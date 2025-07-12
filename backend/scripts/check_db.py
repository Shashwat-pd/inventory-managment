from db.session import SessionLocal
from models.product import Product
from models.store import Store
from models.department import Department
from models.inventory import Inventory

db = SessionLocal()

# Check stores
stores = db.query(Store).all()
print("Stores:", stores)

# Check departments
departments = db.query(Department).all()
print("Departments:", departments)

products = db.query(Product).all()
print("products:", products)

inventories = db.query(Inventory).all()
print("Inventory:", inventories)



