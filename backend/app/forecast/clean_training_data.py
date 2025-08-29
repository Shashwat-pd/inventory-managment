
import pandas as pd
import os

def clean_training_data():
    """
    Loads train.csv, robustly cleans the Weekly_Sales column, and saves the
    result to a new file to ensure all downstream tasks use clean data.
    """
    print("--- Starting Data Cleaning Process ---")
    script_dir = os.path.dirname(__file__)
    data_path = os.path.abspath(os.path.join(script_dir, '../../data'))
    
    train_path = os.path.join(data_path, 'train.csv')
    cleaned_output_path = os.path.join(data_path, 'train_cleaned.csv')

    try:
        print(f"Reading data from: {train_path}")
        # Read 'Weekly_Sales' as string to handle non-numeric values
        train_df = pd.read_csv(train_path, dtype={'Weekly_Sales': str})
    except FileNotFoundError:
        print(f"Error: {train_path} not found.")
        return

    # --- Robust Data Cleaning ---
    # 1. Force Weekly_Sales to numeric. Coerce errors to NaN.
    original_rows = len(train_df)
    train_df['Weekly_Sales'] = pd.to_numeric(train_df['Weekly_Sales'], errors='coerce')

    # 2. Report on and remove rows where conversion failed.
    invalid_rows = train_df['Weekly_Sales'].isna().sum()
    if invalid_rows > 0:
        print(f"  > WARNING: Found and removed {invalid_rows} rows with non-numeric 'Weekly_Sales'.")
        train_df.dropna(subset=['Weekly_Sales'], inplace=True)
    
    # 3. Ensure final data types are correct
    train_df['Store'] = train_df['Store'].astype(int)
    train_df['Dept'] = train_df['Dept'].astype(int)
    train_df['IsHoliday'] = train_df['IsHoliday'].astype(bool)

    # 4. Save the cleaned data
    try:
        print(f"Saving cleaned data to: {cleaned_output_path}")
        train_df.to_csv(cleaned_output_path, index=False)
        print(f"Successfully saved {len(train_df)} cleaned rows (out of {original_rows} original).")
    except Exception as e:
        print(f"Error saving cleaned file: {e}")

if __name__ == '__main__':
    clean_training_data()
    print("\n--- Data Cleaning Process Complete ---")
