import os
import pandas as pd
from db.session import SessionLocal
from models.store import Store
from models.department import Department
from models.weekly_sales import WeeklySales


current_path = os.getcwd()
parent_path = os.path.join(current_path, '..')


def seed_stores(db):

    try:
        stores_df = pd.read_csv(os.path.join(parent_path, "data/stores.csv"))
    except Exception as e:
        print(" Failed to read stores.csv:", e)
        return

    for _, row in stores_df.iterrows():
        try:
            store = Store(
                id=int(row["Store"]),
                name=f"Store {int(row['Store'])}",
                location=str(row.get("Type", "Unknown"))
            )
            db.merge(store)
        except Exception as e:
            print(f" Skipping store row: {row} → {e}")

    db.commit()
    print(f" Seeded {len(stores_df)} stores")

def seed_departments(db, train_df):
    dept_ids = train_df["Dept"].unique()
    for dept_id in dept_ids:
        try:
            dept = Department(
                id=int(dept_id),
                name=f"Dept {int(dept_id)}",
                description="Imported from Kaggle"
            )
            db.merge(dept)
        except Exception as e:
            print(f" Skipping dept {dept_id} → {e}")
    db.commit()
    print(f" Seeded {len(dept_ids)} departments")

def seed_weekly_sales(db, train_df):
    train_df["Date"] = pd.to_datetime(train_df["Date"])
    count = 0

    for _, row in train_df.iterrows():
        try:
            sale = WeeklySales(
                store_id=int(row["Store"]),
                department_id=int(row["Dept"]),
                date=row["Date"].date(),
                weekly_sales=float(row["Weekly_Sales"])
            )
            db.add(sale)
            count += 1
        except Exception as e:
            print(f" Skipping row: {row} → {e}")
    db.commit()
    print(f" Seeded {count} weekly sales records")

def main():
    db = SessionLocal()

    try:
        train_df = pd.read_csv(os.path.join(parent_path, "data/train.csv"))
        seed_stores(db)
        seed_departments(db, train_df)
        seed_weekly_sales(db, train_df)
    except Exception as e:
        print(" Error during seeding:", e)
    finally:
        db.close()

if __name__ == "__main__":
    main()

