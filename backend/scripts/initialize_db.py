# backend/scripts/init_db.py

from db.session import Base, engine

# This creates tables based on your models
Base.metadata.create_all(bind=engine)
print(" Tables created")

