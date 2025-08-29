import pandas as pd
import os
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
import warnings
from datetime import timedelta

def load_and_prepare_data():
    """
    Loads cleaned train and test data.
    """
    print("--- Step 1: Loading and Preparing Data for ARIMA Models ---")
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

def generate_fourier_features_for_series(series, forecast_horizon, k=12):
    """
    Generates Fourier features specifically for a given time series and its forecast horizon.
    """
    full_index = pd.date_range(start=series.index.min(), periods=len(series) + forecast_horizon, freq='W-FRI')
    features_df = pd.DataFrame(index=full_index)
    for i in range(1, k + 1):
        features_df[f'sin_{i}'] = np.sin(2 * np.pi * i * features_df.index.isocalendar().week / 52.1775)
        features_df[f'cos_{i}'] = np.cos(2 * np.pi * i * features_df.index.isocalendar().week / 52.1775)
    
    X_train = features_df.loc[series.index]
    X_forecast = features_df.loc[~features_df.index.isin(series.index)]
    
    return X_train, X_forecast

def generate_arima_forecasts(train_df, test_df, future_weeks=26):
    """
    Trains a Fourier ARIMA model for each series and returns the forecasts.
    """
    print("\n--- Step 2: Generating Forecasts from Fourier ARIMA Models ---")
    
    validation_end_date = test_df['Date'].max()
    future_end_date = validation_end_date + timedelta(weeks=future_weeks)

    all_store_depts = train_df[['Store', 'Dept']].drop_duplicates()
    total_series = len(all_store_depts)
    all_forecasts = []

    for i, row in enumerate(all_store_depts.itertuples(index=False)):
        store, dept = row.Store, row.Dept
        print(f"\n({i+1}/{total_series}) Forecasting for Store: {store}, Dept: {dept}...")

        series_df = train_df[(train_df['Store'] == store) & (train_df['Dept'] == dept)]
        
        if len(series_df) < 52:
            print("  > Insufficient data (< 52 weeks). Skipping.")
            continue
            
        y_train = series_df.set_index('Date')['Weekly_Sales'].asfreq('W-FRI').fillna(0)
        
        forecast_horizon = (future_end_date - y_train.index.max()).days // 7 + 1
        if forecast_horizon <= 0:
            continue

        try:
            X_train, X_forecast = generate_fourier_features_for_series(y_train, forecast_horizon)
            
            # --- THE FIX: Convert pandas dtypes to numpy dtypes ---
            y_train = y_train.astype('float64')
            X_train = X_train.astype('float64')
            X_forecast = X_forecast.astype('float64')

            # Using a robust seasonal order and a non-seasonal order
            model = ARIMA(y_train, exog=X_train, order=(2,1,2), seasonal_order=(1,1,0,52))
            model_fit = model.fit()
            predictions = model_fit.forecast(steps=len(X_forecast), exog=X_forecast)
            
            forecast_df = pd.DataFrame({'Date': predictions.index, 'Weekly_Sales': predictions.values, 'Store': store, 'Dept': dept})
            all_forecasts.append(forecast_df)
            print("  > ARIMA forecast successful.")
        except Exception as e:
            print(f"  ! ARIMA ERROR for Store {store}, Dept {dept}: {e}")

    return pd.concat(all_forecasts, ignore_index=True)

if __name__ == '__main__':
    train_data, test_data = load_and_prepare_data()
    
    if train_data is not None and test_data is not None:
        arima_forecasts = generate_arima_forecasts(train_data, test_data, future_weeks=26)
        
        if not arima_forecasts.empty:
            script_dir = os.path.dirname(__file__)
            output_path = os.path.abspath(os.path.join(script_dir, '../../data/forecast_arima.csv'))
            arima_forecasts.to_csv(output_path, index=False)
            
            print(f"\n--- Saved ARIMA Forecasts ---")
            print(f"Successfully saved {len(arima_forecasts)} rows to {output_path}")
        else:
            print("\nNo ARIMA forecasts were generated.")