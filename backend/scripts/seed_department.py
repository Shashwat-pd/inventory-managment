import json
import os
from sqlalchemy.orm import Session
from models import Department
from db.session import SessionLocal, engine, Base

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DEPT_JSON_PATH = os.path.join(BASE_DIR, "department.json")

def seed_departments_from_json():
    db: Session = SessionLocal()
    added, skipped = 0, 0

    try:
        with open(DEPT_JSON_PATH, "r", encoding="utf-8") as f:
            departments = json.load(f)

        for dept_id, dept_name in departments.items():
            dept_id_int = int(dept_id)
            if not db.query(Department).filter_by(id=dept_id_int).first():
                db.add(Department(id=dept_id_int, name=dept_name))
                added += 1
                print(f"{added}. Added - {dept_id_int}: {dept_name}")
            else:
                skipped += 1
                print(f"Skipped - {dept_id_int}: already exists")

        db.commit()
        print(f"\n Seeding complete. {added} added, {skipped} skipped.")
    except Exception as e:
        db.rollback()
        print(f"Failed to seed departments: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    seed_departments_from_json()

