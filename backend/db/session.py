
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

import os

# Get the absolute path to the project root directory
# This assumes the script is run from somewhere inside the project
# For a more robust solution, you might use environment variables
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
db_path = os.path.join(project_root, "inventory.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{db_path}"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

