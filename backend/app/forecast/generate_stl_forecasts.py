
import pandas as pd
import os
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.forecasting.stl import STLForecast
import warnings
from datetime import timedelta

def load_and_prepare_data():
    """
    Loads cleaned train and test data.
    """
    print("--- Step 1: Loading and Preparing Data for STL Models ---")
    script_dir = os.path.dirname(__file__)
    data_path = os.path.abspath(os.path.join(script_dir, '../../data'))

    try:
        cleaned_train_path = os.path.join(data_path, 'train_cleaned.csv')
        if not os.path.exists(cleaned_train_path):
            print(f"  > ERROR: '{cleaned_train_path}' not found. Please run the data cleaning script first.")
            return None, None

        train_df = pd.read_csv(cleaned_train_path)
        test_df = pd.read_csv(os.path.join(data_path, 'test.csv'))

    except FileNotFoundError as e:
        print(f"Error: Data file not found. {e}")
        return None, None

    train_df['Date'] = pd.to_datetime(train_df['Date'])
    test_df['Date'] = pd.to_datetime(test_df['Date'])

    print("Data loading complete.")
    return train_df, test_df

def generate_stl_forecasts(train_df, test_df, future_weeks=26):
    """
    Trains an STL + ARIMA model for each series and returns the forecasts.
    """
    print("\n--- Step 2: Generating Forecasts from STL Models ---")

    validation_end_date = test_df['Date'].max()
    future_end_date = validation_end_date + timedelta(weeks=future_weeks)

    all_store_depts = train_df[['Store', 'Dept']].drop_duplicates()
    total_series = len(all_store_depts)
    all_forecasts = []

    for i, row in enumerate(all_store_depts.itertuples(index=False)):
        store, dept = row.Store, row.Dept
        print(f"\n({i+1}/{total_series}) Forecasting for Store: {store}, Dept: {dept}...")

        series_df = train_df[(train_df['Store'] == store) & (train_df['Dept'] == dept)]

        if len(series_df) < 104: # STL requires at least 2 full seasons (52 * 2)
            print("  > Insufficient data (< 104 weeks). Skipping.")
            continue

        y_train = series_df.set_index('Date')['Weekly_Sales'].asfreq('W-FRI').fillna(0)

        forecast_horizon = (future_end_date - y_train.index.max()).days // 7 + 1
        if forecast_horizon <= 0:
            continue

        try:
            # Use ARIMA as the forecaster for the seasonally-adjusted data, as in the R code
            model_kwargs = {'order': (1, 1, 1), 'seasonal_order': (0,0,0,0)}
            stlf = STLForecast(y_train, ARIMA, model_kwargs=model_kwargs, period=52)
            stlf_fit = stlf.fit()
            predictions = stlf_fit.forecast(forecast_horizon)

            forecast_df = pd.DataFrame({'Date': predictions.index, 'Weekly_Sales': predictions.values, 'Store': store, 'Dept': dept})
            all_forecasts.append(forecast_df)
            print("  > STL forecast successful.")
        except Exception as e:
            print(f"  ! STL ERROR for Store {store}, Dept {dept}: {e}")

    return pd.concat(all_forecasts, ignore_index=True)

if __name__ == '__main__':
    train_data, test_data = load_and_prepare_data()

    if train_data is not None and test_data is not None:
        stl_forecasts = generate_stl_forecasts(train_data, test_data, future_weeks=26)

        if not stl_forecasts.empty:
            script_dir = os.path.dirname(__file__)
            output_path = os.path.abspath(os.path.join(script_dir, '../../data/forecast_stl.csv'))
            stl_forecasts.to_csv(output_path, index=False)

            print(f"\n--- Saved STL Forecasts ---")
            print(f"Successfully saved {len(stl_forecasts)} rows to {output_path}")
        else:
            print("\nNo STL forecasts were generated.")
