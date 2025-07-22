
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
from sklearn.preprocessing import FourierFeatures

def load_data():
    """Loads the training and test data."""
    try:
        train = pd.read_csv('../../../data/train.csv')
        test = pd.read_csv('../../../data/test.csv')
        features = pd.read_csv('../../../data/features.csv')
        stores = pd.read_csv('../../../data/stores.csv')

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

    train_pivot = train_dept.pivot_table(index='Date', columns='Store', values='Weekly_Sales')

    test_dates = test_dept['Date'].unique()

    return train_pivot, test_dates

def fourier_arima_forecast(train_pivot, test_dates, k=5):

    forecasts = pd.DataFrame(index=test_dates)

    for store in train_pivot.columns:
        ts = train_pivot[store].dropna()

        fourier = FourierFeatures(sp=52, k=k)
        fourier_terms = fourier.fit_transform(ts.index.to_frame())

        model = ARIMA(ts, order=(1, 1, 1), exog=fourier_terms)
        model_fit = model.fit()

        fourier_terms_future = fourier.transform(pd.DataFrame(index=test_dates))
        forecast = model_fit.forecast(steps=len(test_dates), exog=fourier_terms_future)

        forecasts[store] = forecast.values

    return forecasts

if __name__ == '__main__':
    train, test = load_data()
    if train is not None:
        dept_id = 1
        train_pivot, test_dates = prepare_department_data(train, test, dept_id)

        if not train_pivot.empty:
            forecasts = fourier_arima_forecast(train_pivot, test_dates)
            print(f"Forecasts for department {dept_id}:")
            print(forecasts.head())
