import pandas as pd
import os
import numpy as np

def load_forecasts_and_historical_data():
    """
    Loads the two raw forecast CSVs and the cleaned historical training data,
    enforcing consistent data types from the start.
    """
    print("--- Step 1: Loading Forecasts and Historical Data ---")
    script_dir = os.path.dirname(__file__)
    data_path = os.path.abspath(os.path.join(script_dir, '../../data'))
    
    try:
        # Define consistent data types for key columns
        dtype_spec = {'Store': 'int64', 'Dept': 'int64'}
        
        arima_df = pd.read_csv(os.path.join(data_path, 'forecast_arima.csv'), dtype=dtype_spec)
        stl_df = pd.read_csv(os.path.join(data_path, 'forecast_stl.csv'), dtype=dtype_spec)
        train_df = pd.read_csv(os.path.join(data_path, 'train_cleaned.csv'), dtype=dtype_spec)
    except FileNotFoundError as e:
        print(f"Error: A required CSV file was not found. {e}")
        return None, None, None

    # Convert Date columns to datetime objects
    for df in [arima_df, stl_df, train_df]:
        df['Date'] = pd.to_datetime(df['Date'])
    
    print("Data loading complete with consistent types.")
    return arima_df, stl_df, train_df

def create_ensemble(arima_df, stl_df):
    """
    Creates an ensemble by averaging the predictions from the two models.
    """
    print("\n--- Step 2: Creating Ensemble Forecast ---")
    
    ensemble_df = pd.merge(arima_df, stl_df, on=['Date', 'Store', 'Dept'], suffixes=('_arima', '_stl'))
    ensemble_df['Weekly_Sales'] = (ensemble_df['Weekly_Sales_arima'] + ensemble_df['Weekly_Sales_stl']) / 2
    
    return ensemble_df[['Date', 'Store', 'Dept', 'Weekly_Sales']]

def apply_christmas_shift(ensemble_df, train_df, shift_days=2.5, threshold=1.1):
    """
    Applies the circular holiday shift to Christmas-sensitive departments.
    """
    print("\n--- Step 3: Applying Christmas Holiday Shift ---")
    
    shift_fraction = shift_days / 7.0
    
    train_df['Week'] = train_df['Date'].dt.isocalendar().week
    christmas_weeks_df = train_df[train_df['Week'].isin([48, 49, 50, 51, 52])]
    dept_weekly_avg = christmas_weeks_df.groupby(['Dept', 'Week'])['Weekly_Sales'].mean().unstack()
    
    for week in [48, 49, 50, 51, 52]:
        if week not in dept_weekly_avg.columns: dept_weekly_avg[week] = 0
            
    baseline_sales = dept_weekly_avg[[48, 52]].mean(axis=1)
    surge_sales = dept_weekly_avg[[49, 50, 51]].mean(axis=1)
    
    sensitive_depts = surge_sales[surge_sales > baseline_sales * threshold].index.tolist()
    print(f"  > Found {len(sensitive_depts)} Christmas-sensitive departments.")

    final_forecast = ensemble_df.copy()
    final_forecast['Week'] = final_forecast['Date'].dt.isocalendar().week

    is_holiday_period = (final_forecast['Date'].dt.year == 2012) & \
                        (final_forecast['Week'].isin([48, 49, 50, 51, 52])) & \
                        (final_forecast['Dept'].isin(sensitive_depts))
    
    holiday_subset = final_forecast[is_holiday_period].copy()
    
    if holiday_subset.empty:
        print("  > No forecasts in the 2012 Christmas period for sensitive departments. No shift applied.")
        return ensemble_df.drop(columns=['Week'], errors='ignore')

    def shift_sales(group):
        group = group.sort_values('Date')
        sales = group['Weekly_Sales'].values
        if len(sales) != 5: return group
        
        shift_amount = sales * shift_fraction
        new_sales = sales * (1 - shift_fraction)
        new_sales[1:] += shift_amount[:-1]
        new_sales[0] += shift_amount[-1]
        group['Weekly_Sales'] = new_sales
        return group

    # Apply the shift and ensure the index is preserved
    shifted_subset = holiday_subset.groupby(['Store', 'Dept'], group_keys=False).apply(shift_sales)
    
    # --- THE FIX: Ensure dtypes and columns match before updating ---
    final_forecast.set_index(['Date', 'Store', 'Dept'], inplace=True)
    shifted_subset = shifted_subset[final_forecast.columns] # Ensure column order
    shifted_subset = shifted_subset.astype(final_forecast.dtypes) # Ensure dtypes match
    
    final_forecast.update(shifted_subset)
    final_forecast.reset_index(inplace=True)
    
    print(f"  > Applied Christmas shift to relevant rows.")
    return final_forecast.drop(columns=['Week'], errors='ignore')

if __name__ == '__main__':
    arima_data, stl_data, train_data = load_forecasts_and_historical_data()
    
    if all(df is not None for df in [arima_data, stl_data, train_data]):
        ensemble_forecast = create_ensemble(arima_data, stl_data)
        final_adjusted_forecast = apply_christmas_shift(ensemble_forecast, train_data)
        
        script_dir = os.path.dirname(__file__)
        output_path = os.path.abspath(os.path.join(script_dir, '../../data/final_submission.csv'))
        final_adjusted_forecast.to_csv(output_path, index=False)
        
        print(f"\n--- Step 4: Saving Final Submission File ---")
        print(f"Successfully saved {len(final_adjusted_forecast)} rows to {output_path}")