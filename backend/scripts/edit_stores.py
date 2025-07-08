import os
import pandas as pd
from db.session import SessionLocal
from models.store import Store

current_path = os.getcwd()
parent_path = os.path.join(current_path, '..')


def update_store_types(db):
    try:
        csv_path = os.path.join(parent_path, 'data', 'stores.csv')
        stores_df = pd.read_csv(csv_path)
    except Exception as e:
        print('Failed to read stores.csv:', e)
        return

    updated = 0
    for _, row in stores_df.iterrows():
        store_id = int(row['Store'])
        store_type = str(row['Type']).strip()
        store_size = str(row['Size']).strip()
        store = db.query(Store).filter(Store.id == store_id).first()
        if store:
            store.type = store_type
            store.size = store_size
            updated += 1
        else:
            store = Store(id=store_id, name=f'Store {store_id}', location=store_type, size=store_size)
            db.add(store)
            updated += 1

    db.commit()
    print(f'Updated {updated} stores')


if __name__ == '__main__':
    db = SessionLocal()
    try:
        update_store_types(db)
    finally:
        db.close()

