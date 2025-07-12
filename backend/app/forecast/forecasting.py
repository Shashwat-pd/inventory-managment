
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
from sklearn.preprocessing import FourierFeatures

def load_data():
    """Loads the training and test data."""
    try:
        train = pd.read_csv('/Users/shashwatpoudel/Documents/inventory-managment/data/train.csv')
        test = pd.read_csv('/Users/shashwatpoudel/Documents/inventory-managment/data/test.csv')
        features = pd.read_csv('/Users/shashwatpoudel/Documents/inventory-managment/data/features.csv')
        stores = pd.read_csv('/Users/shashwatpoudel/Documents/inventory-managment/data/stores.csv')
        
        # Merge with features and stores
        train = pd.merge(train, features, on=['Store', 'Date', 'IsHoliday'], how='left')
        train = pd.merge(train, stores, on=['Store'], how='left')
        test = pd.merge(test, features, on=['Store', 'Date', 'IsHoliday'], how='left')
        test = pd.merge(test, stores, on=['Store'], how='left')
        
        return train, test
    except FileNotFoundError:
        print("Data files not found. Please make sure train.csv, test.csv, features.csv and stores.csv are in the data directory.")
        return None, None

def prepare_department_data(train, test, dept_id):
    """Prepares the data for a specific department in a 'date x store' format."""
    train_dept = train[train['Dept'] == dept_id]
    test_dept = test[test['Dept'] == dept_id]
    
    # Pivot the data
    train_pivot = train_dept.pivot_table(index='Date', columns='Store', values='Weekly_Sales')
    
    # Get the dates for the test set
    test_dates = test_dept['Date'].unique()
    
    return train_pivot, test_dates

def fourier_arima_forecast(train_pivot, test_dates, k=5):
    """
    Forecasts weekly sales for a department using an ARIMA model with Fourier features.
    
    Args:
        train_pivot: A DataFrame with dates as index, stores as columns, and weekly sales as values.
        test_dates: A list of dates to forecast.
        k: The number of Fourier terms to use.
        
    Returns:
        A DataFrame with forecasts for each store.
    """
    
    # Placeholder for forecasts
    forecasts = pd.DataFrame(index=test_dates)
    
    for store in train_pivot.columns:
        # Get the time series for the store
        ts = train_pivot[store].dropna()
        
        # Create Fourier features
        fourier = FourierFeatures(sp=52, k=k)
        fourier_terms = fourier.fit_transform(ts.index.to_frame())
        
        # Fit ARIMA model
        # Note: This is a simplified example. The original R code uses auto.arima,
        # which automatically selects the best ARIMA order. We can use a similar
        # approach with pmdarima.auto_arima or by implementing our own grid search.
        # For now, we'll use a fixed order.
        model = ARIMA(ts, order=(1, 1, 1), exog=fourier_terms)
        model_fit = model.fit()
        
        # Forecast
        fourier_terms_future = fourier.transform(pd.DataFrame(index=test_dates))
        forecast = model_fit.forecast(steps=len(test_dates), exog=fourier_terms_future)
        
        forecasts[store] = forecast.values
        
    return forecasts

if __name__ == '__main__':
    # Example usage
    train, test = load_data()
    if train is not None:
        dept_id = 1
        train_pivot, test_dates = prepare_department_data(train, test, dept_id)
        
        if not train_pivot.empty:
            forecasts = fourier_arima_forecast(train_pivot, test_dates)
            print(f"Forecasts for department {dept_id}:")
            print(forecasts.head())
