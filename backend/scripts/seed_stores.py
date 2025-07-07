import csv
import os
import random

from db.session import SessionLocal
from models.store import Store

DATA_FILE = os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'stores.csv')
)

STORE_NAMES = [
    "SuperMart",
    "MegaStore",
    "ShopSmart",
    "ValueOutlet",
    "QuickBuy",
    "BudgetShop",
]

LOCATIONS = [
    "New York",
    "Los Angeles",
    "Chicago",
    "Houston",
    "Phoenix",
    "Philadelphia",
    "San Antonio",
    "San Diego",
    "Dallas",
    "San Jose",
]

def seed_stores(db ) -> None:
    """Read ``stores.csv`` and populate the ``stores`` table."""

    if not os.path.exists(DATA_FILE):
        print(f"stores.csv not found at {DATA_FILE}")
        return

    count = 0
    with open(DATA_FILE, newline="", encoding="utf-8") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            try:
                store_id = int(row.get("Store", 0))
            except ValueError:
                continue
            name = f"{random.choice(STORE_NAMES)} {store_id}"
            location = random.choice(LOCATIONS)
            store = Store(
                id=store_id,
                name=name,
                location=location,
                size=row.get("Size") or None,
            )
            db.merge(store)
            count += 1
    db.commit()
    print(f"Seeded {count} stores")

def main() -> None:
    db = SessionLocal()
    try:
        seed_stores(db)
    finally:
        db.close()

if __name__ == "__main__":
    main()
