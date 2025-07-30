# Inventory Management & Forecasting API

This is the backend API for the Inventory Management and Sales Forecasting application. It is built with FastAPI and uses a PostgreSQL database with SQLAlchemy for ORM. The API provides endpoints for managing master data and inventory, and importantly, leverages a sophisticated time-series forecasting model to predict weekly sales.

## Table of Contents
- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Forecasting Methodology](#forecasting-methodology)
- [Detailed Machine Learning Strategy](#detailed-machine-learning-strategy)
- [Scripts and Data Population](#scripts-and-data-population)

## Project Overview

The primary goal of this backend system is to serve data to a front-end application and to provide reliable sales forecasts. It allows users to manage stores, departments, products, and inventory, while also running a data pipeline that generates and stores sales predictions. This enables proactive inventory management and business planning based on data-driven insights.

## Technology Stack

- **Backend Framework:** FastAPI
- **Database:** PostgreSQL (or SQLite for development)
- **ORM:** SQLAlchemy
- **Data Validation:** Pydantic
- **ML/Forecasting:** `statsmodels`, `pandas`, `numpy`
- **Server:** Uvicorn

## Project Structure
(The project structure remains as previously described)
```
/backend
├── app/                # Main application source code
│   ├── api/            # API endpoint definitions (routers)
│   ├── crud/           # Create, Read, Update, Delete database logic
│   ├── schemas/        # Pydantic schemas for data validation
│   └── main.py         # FastAPI application entry point
├── db/                 # Database connection and session management
├── models/             # SQLAlchemy ORM models (database tables)
├── scripts/            # Utility scripts for DB initialization, data seeding, etc.
├── .env                # Environment variables (e.g., database URL)
└── pyproject.toml      # Project metadata and dependencies
```

## Database Schema
(The database schema remains as previously described)

## API Endpoints
(The API endpoints remain as previously described)

## Forecasting Methodology

The core of this project's analytical power lies in its sales forecasting model. The goal is to predict future `Weekly_Sales` for each store and department combination. The methodology is implemented in the `scripts/run_modeling.py` script and can be broken down into several key theoretical concepts.

### 1. Data Preparation: Pivoting for Time-Series Analysis

Before modeling, the data is transformed using a pivot operation. For each department, the dataset is reshaped so that each row represents a unique `Date` (week) and each column represents a unique `Store`. The values in the table are the `Weekly_Sales`. This structure is crucial as it organizes the data into multiple independent time series (one for each store), which is the standard format required for time-series forecasting algorithms.

### 2. Modeling Approach: ARIMAX (ARIMA with eXogenous Variables)

The chosen forecasting model is **ARIMA (Autoregressive Integrated Moving Average)**, a class of models that explains a given time series based on its own past values. The model is implemented using the `statsmodels` library.

The "ARIMAX" variant is used here, which means the model is extended to include **eXogenous variables** (i.e., external predictors). In this project, the exogenous variables are **Fourier terms**, used to capture seasonality.

#### a. ARIMA Components:
-   **AR (Autoregressive):** This component assumes that the current value in the series has a linear relationship with its own past values. The `p` parameter defines how many lagged observations are included.
-   **I (Integrated):** This component uses differencing of the time series to make it stationary (i.e., its statistical properties like mean and variance are constant over time). The `d` parameter specifies the number of times the data is differenced.
-   **MA (Moving Average):** This component models the error of the model as a linear combination of past error terms. The `q` parameter defines the number of past error terms to include.

#### b. Handling Seasonality with Fourier Terms:
Instead of using simple binary indicators for seasons (which can be rigid), this model employs a more flexible and powerful technique: **Fourier terms**.

-   **What are they?** Fourier terms are pairs of sine and cosine waves of varying frequencies. A combination of these waves can approximate any complex periodic pattern.
-   **Why use them?** Weekly sales data often exhibits multiple seasonal patterns (e.g., yearly trends, holiday spikes). Fourier terms are excellent at capturing these complex, multi-layered seasonalities without being constrained to a fixed period.
-   **Implementation:** The script generates several pairs of `sin` and `cos` terms based on the day of the year. These terms are then passed to the ARIMA model as external predictors (`exog`), effectively helping the model understand and subtract the seasonal patterns before modeling the underlying trend.

### 3. Hyperparameter Tuning with Grid Search and AIC

An ARIMA model's performance is highly dependent on its `(p, d, q)` order. The project automates the selection of the best order using a **grid search** approach.

-   **Grid Search:** The code iterates through a predefined range of possible values for `p`, `d`, and `q`. For each combination, it fits an ARIMA model.
-   **Model Selection Criterion: AIC (Akaike Information Criterion)**: For each fitted model, the AIC score is calculated. AIC is a statistical measure that estimates the prediction error and, therefore, the relative quality of a model. It rewards models for goodness-of-fit but penalizes them for having too many parameters (complexity) to prevent overfitting.
-   **The Best Model:** The `(p, d, q)` combination that results in the **lowest AIC** is chosen as the optimal order for the final model for that specific store's time series.

### 4. Model Evaluation: Weighted Mean Absolute Error (WMAE)

While the model is tuned using AIC, the script also includes a function to calculate the **Weighted Mean Absolute Error (WMAE)**. This metric is particularly relevant for retail contexts.

-   **MAE (Mean Absolute Error):** This measures the average magnitude of the errors in a set of predictions, without considering their direction.
-   **WMAE (Weighted MAE):** This is a variation where each error contributes to the total based on a predefined weight. In this project, sales that occur during a holiday week are given a higher weight (a weight of 5, versus 1 for non-holiday weeks).
-   **Business Rationale:** This weighting scheme reflects the business reality that accurately forecasting sales during critical holiday periods is significantly more important than during regular weeks. A large error during a holiday week has a much greater business impact than the same error during a slow week.

## Detailed Machine Learning Strategy

This section provides a deeper rationale for the choices made in the forecasting pipeline.

### 1. Model Selection Rationale: Why ARIMAX?

The selection of an ARIMAX model was a deliberate choice based on the nature of the data and the project goals.

-   **Interpretability and Robustness:** ARIMAX is a statistical model grounded in well-understood principles. This makes it highly interpretable—we can analyze the model coefficients to understand the impact of trends and seasonality. It is robust and performs well on time-series data that exhibits clear trend and seasonal components, which is typical for retail sales.
-   **Comparison to Alternatives:**
    -   **Prophet:** Facebook's Prophet is a strong alternative, often easier to tune. However, ARIMAX provides more granular control over the model's components (`p, d, q`), which can lead to better performance when tuned correctly.
    -   **Exponential Smoothing (ETS):** While good for simpler trends and seasonality, ETS models can be less effective at handling the complex, multi-layered seasonality and the direct impact of external regressors like holidays, which ARIMAX handles explicitly.
    -   **Deep Learning (e.g., LSTMs):** Neural networks are powerful but are data-hungry and act as "black boxes." For the likely volume of data available per store-department series, an LSTM would be prone to overfitting and would be much harder to diagnose or interpret. The statistical rigor of ARIMAX is a better fit for this problem.

### 2. Feature Engineering Strategy

The primary feature engineering is the creation of **Fourier terms** and the use of the `IsHoliday` flag.

-   **Fourier Terms for Seasonality:** This is the most critical feature engineering step. By converting the time index into a set of sine and cosine waves, we allow the linear ARIMA model to fit non-linear seasonal patterns. This is superior to using simple dummy variables (e.g., one for each month) because it can capture overlapping cycles (e.g., a yearly pattern plus a semi-annual pattern) and is smoother.
-   **Holiday Flag:** The `IsHoliday` boolean is a crucial exogenous variable. It allows the model to learn a specific, consistent impact for holiday weeks that is separate from the regular seasonal pattern. This is vital because holiday sales spikes are often sharp, short-lived events that a standard seasonality model might struggle to capture accurately.

### 3. Training, Validation, and Granularity

-   **Time-Based Data Split:** For time-series forecasting, it is essential to validate the model on "future" data relative to the training set. The script correctly uses a chronological split (`train_pivot.iloc[:-39]` and `test_pivot.iloc[-39:]`), ensuring that the model is trained on the past and tested on the most recent data. This prevents data leakage and gives a realistic estimate of how the model will perform on unseen future data.
-   **Model Granularity:** The strategy of training one model per department is a smart trade-off between a single global model and thousands of individual models.
    -   **Benefit:** It allows the model to learn sales dynamics specific to each department (e.g., winter coats sell differently than swimwear).
    -   **Scalability:** The approach is highly scalable. The modeling script iterates through each department and trains a model, meaning new departments can be added to the system without requiring a full redesign of the ML pipeline.

### 4. Limitations and Future Enhancements

Every model has limitations, and a good strategy acknowledges them and plans for future improvements.

-   **The "Cold Start" Problem:** The model requires a sufficient history of sales data (at least a full year to see seasonality) to make meaningful predictions. It cannot generate forecasts for new stores or new departments immediately.
-   **Limited Exogenous Variables:** The model's predictive power could be significantly enhanced by incorporating more external data. Future iterations could include:
    -   **Promotional Data:** Flags or details for when products are on sale.
    -   **Price Information:** The price of key items or an average price index.
    -   **Macroeconomic Indicators:** Data like consumer confidence, unemployment rates, etc.
-   **Hyperparameter Optimization:** The current grid search is effective but can be computationally intensive. A more advanced technique like **Bayesian Optimization** could be used to find the optimal `(p, d, q)` parameters more efficiently.
-   **Alternative Models:** For high-value departments where ARIMAX performance is insufficient, it would be worth exploring other models. A **Gradient Boosting Machine (like LightGBM or XGBoost)** trained on a rich set of lagged and time-based features could potentially capture more complex, non-linear relationships.

## Scripts and Data Population

The `scripts/` directory contains essential scripts for managing the database and the forecasting pipeline.

- **`initialize_db.py`**: Creates all the database tables.
- **`populate_database.py`**: A master script that seeds the database with initial data (stores, products, sales, etc.).
- **`run_modeling.py`**: This is the core data science script. It loads the historical sales data, runs the entire ARIMAX forecasting pipeline described above for each department, and saves the resulting predictions to the `forecasts` table in the database.

To populate a fresh database and run the forecast, execute the main population script from the `backend` directory:

```bash
python scripts/populate_database.py
```
This will be followed by running the modeling script to generate the forecasts:
```bash
python scripts/run_modeling.py
```