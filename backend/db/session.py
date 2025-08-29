
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

import os
from pathlib import Path
try:
    from dotenv import load_dotenv, find_dotenv
except Exception:
    load_dotenv = None
    find_dotenv = None

if load_dotenv and find_dotenv:
    env_file = find_dotenv(usecwd=True)
    if env_file:
        load_dotenv(env_file)

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
if not SQLALCHEMY_DATABASE_URL:
    if find_dotenv:
        env_file = find_dotenv(usecwd=True)
    else:
        env_file = ""
    base_dir = Path(env_file).resolve().parent if env_file else Path.cwd()
    default_db_path = base_dir / "inventory.db"
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{default_db_path}"

if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False},
    )
else:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
