import pandas as pd
import os
import numpy as np
from sqlalchemy.orm import sessionmaker
from db.session import engine
from models.forecast import Forecast

def load_final_data():
    """
    Loads the final submission file and the test data for validation.
    """
    print("--- Step 1: Loading Final Forecasts and Validation Data ---")
    script_dir = os.path.dirname(__file__)
    data_path = os.path.abspath(os.path.join(script_dir, '../../data'))
    
    try:
        submission_df = pd.read_csv(os.path.join(data_path, 'final_submission.csv'))
        actuals_df = pd.read_csv(os.path.join(data_path, 'train_cleaned.csv'))
        test_df = pd.read_csv(os.path.join(data_path, 'test.csv'))
    except FileNotFoundError as e:
        print(f"Error: A required CSV file was not found. {e}")
        return None, None

    for df in [submission_df, actuals_df, test_df]:
        df['Date'] = pd.to_datetime(df['Date'])
    
    # Filter actuals to the validation date range
    validation_actuals = actuals_df[actuals_df['Date'].isin(test_df['Date'])]
    
    print("Data loading complete.")
    return submission_df, validation_actuals

def calculate_wmae(predictions_df, actuals_df):
    """
    Calculates the Weighted Mean Absolute Error (WMAE) for the validation period.
    This version robustly handles cases where test set contains keys not in training set.
    """
    print("\n--- Step 2: Calculating WMAE Performance ---")
    
    # --- THE FIX: Ensure we only score on predictable Store-Dept pairs ---
    # Create unique identifiers to find the intersection of pairs we can score on
    actuals_df['Store_Dept'] = actuals_df['Store'].astype(str) + '-' + actuals_df['Dept'].astype(str)
    predictions_df['Store_Dept'] = predictions_df['Store'].astype(str) + '-' + predictions_df['Dept'].astype(str)
    
    predictable_keys = set(actuals_df['Store_Dept'].unique())
    
    # Filter predictions to only those we have actuals for
    predictions_to_score = predictions_df[predictions_df['Store_Dept'].isin(predictable_keys)].copy()

    # Merge actuals and predictions
    merged_df = pd.merge(
        actuals_df, 
        predictions_to_score, 
        on=['Date', 'Store', 'Dept', 'Store_Dept'], 
        suffixes=('_actual', '_pred')
    )
    
    if merged_df.empty:
        print("  > CRITICAL ERROR: Could not merge any predictions with actuals. WMAE calculation failed.")
        return

    # Add IsHoliday data from the actuals for weighting
    holiday_info = actuals_df[['Date', 'Store', 'Dept', 'IsHoliday']].drop_duplicates()
    merged_df = pd.merge(merged_df, holiday_info, on=['Date', 'Store', 'Dept'], how='left')

    # Calculate weights and error
    merged_df['Weights'] = merged_df['IsHoliday'].apply(lambda x: 5 if x else 1)
    wmae = np.sum(merged_df['Weights'] * abs(merged_df['Weekly_Sales_pred'] - merged_df['Weekly_Sales_actual'])) / np.sum(merged_df['Weights'])
    
    print(f"  > Final Validation WMAE (calculated on {len(merged_df)} matching rows): {wmae:.4f}")
    return wmae

def load_forecasts_to_db(submission_df):
    """
    Clears the forecasts table and loads the new predictions.
    """
    print("\n--- Step 3: Loading Forecasts into Database ---")
    
    # Clean up the helper column if it exists
    if 'Store_Dept' in submission_df.columns:
        submission_df = submission_df.drop(columns=['Store_Dept'])
        
    Session = sessionmaker(bind=engine)
    db = Session()

    try:
        print("  > Clearing old forecasts from the database...")
        num_deleted = db.query(Forecast).delete()
        db.commit()
        print(f"  > Deleted {num_deleted} old forecast records.")
        
        submission_df = submission_df.rename(columns={
            'Date': 'week_date', 'Store': 'store_id',
            'Dept': 'department_id', 'Weekly_Sales': 'predicted_sales'
        })
        
        forecast_records = submission_df.to_dict(orient='records')
        
        print(f"  > Inserting {len(forecast_records)} new forecast records...")
        db.bulk_insert_mappings(Forecast, forecast_records)
        db.commit()
        print("  > New forecasts successfully loaded into the database.")
        
    except Exception as e:
        print(f"  ! An error occurred during the database operation: {e}")
        db.rollback()
    finally:
        db.close()
        print("  > Database session closed.")

if __name__ == '__main__':
    final_forecasts, validation_actuals = load_final_data()
    
    if final_forecasts is not None and validation_actuals is not None:
        calculate_wmae(final_forecasts, validation_actuals)
        load_forecasts_to_db(final_forecasts)
        print("\n--- Pipeline Complete ---")