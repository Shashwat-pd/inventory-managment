from db.session import SessionLocal
from models.store import Store
from models.department import Department

db = SessionLocal()

# Check stores
stores = db.query(Store).all()
print("Stores:", stores)

# Check departments
departments = db.query(Department).all()
print("Departments:", departments)

print(DATA_DIR)

