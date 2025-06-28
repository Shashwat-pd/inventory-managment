
import pandas as pd
from app.db.session import SessionLocal
from app.models.store import Store
from app.models.department import Department
from app.models.weekly_sales import WeeklySales

def seed_stores(db):
    stores_df = pd.read_csv("data/stores.csv")
    for _, row in stores_df.iterrows():
        store = Store(
            id=row["Store"],
            name=f"Store {row['Store']}",
            location=row.get("Type", "Unknown")
        )
        db.merge(store)
    db.commit()
    print(f" Seeded {len(stores_df)} stores")

def seed_departments(db, train_df):
    dept_ids = train_df["Dept"].unique()
    for dept_id in dept_ids:
        dept = Department(
            id=dept_id,
            name=f"Dept {dept_id}",
            description="Auto-imported from Kaggle"
        )
        db.merge(dept)
    db.commit()
    print(f" Seeded {len(dept_ids)} departments")

def seed_weekly_sales(db, train_df):
    train_df["Date"] = pd.to_datetime(train_df["Date"])
    for _, row in train_df.iterrows():
        sale = WeeklySales(
            store_id=row["Store"],
            department_id=row["Dept"],
            date=row["Date"],
            weekly_sales=row["Weekly_Sales"]
        )
        db.add(sale)
    db.commit()
    print(f"Seeded {len(train_df)} weekly sales records")

def main():
    db = SessionLocal()
    try:
        train_df = pd.read_csv("data/train.csv")
        seed_stores(db)
        seed_departments(db, train_df)
        seed_weekly_sales(db, train_df)
    finally:
        db.close()

if __name__ == "__main__":
    main()

