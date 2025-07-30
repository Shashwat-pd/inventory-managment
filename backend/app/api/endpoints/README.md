# Forecast API

This API provides endpoints for retrieving sales forecasts.

## Schemas

### ForecastOut

The `ForecastOut` schema represents a single forecast record.

- **`store_id`**: (integer) The ID of the store.
- **`department_id`**: (integer) The ID of the department.
- **`week_date`**: (date) The date of the week for the forecast (in `YYYY-MM-DD` format).
- **`predicted_sales`**: (float) The predicted sales amount.
- **`upper_ci`**: (float, optional) The upper confidence interval for the prediction.
- **`lower_ci`**: (float, optional) The lower confidence interval for the prediction.

---

## Endpoints

### List Forecasts

- **`GET /`**

  Retrieves a list of all forecasts, with optional pagination.

  **Query Parameters:**

  - `skip` (integer, optional, default: 0): The number of records to skip.
  - `limit` (integer, optional, default: 100): The maximum number of records to return.

  **Responses:**

  - `200 OK`: A list of `ForecastOut` objects.

  **Example Request:**

  ```bash
  curl -X GET "http://localhost:8000/api/v1/forecasts/?skip=0&limit=10"
  ```

### Read Forecast

- **`GET /{store_id}/{department_id}/{week_date}`**

  Retrieves a specific forecast for a given store, department, and week.

  **Path Parameters:**

  - `store_id` (integer, required): The ID of the store.
  - `department_id` (integer, required): The ID of the department.
  - `week_date` (date, required): The date of the week for the forecast (in `YYYY-MM-DD` format).

  **Responses:**

  - `200 OK`: A `ForecastOut` object.
  - `404 Not Found`: If the forecast does not exist.

  **Example Request:**

  ```bash
  curl -X GET "http://localhost:8000/api/v1/forecasts/1/1/2025-07-28"
  ```
