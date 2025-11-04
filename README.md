• # 📦 Inventory Management & Forecasting API
  <p align="center">
    FastAPI backend that unifies retail master data, inventory tracking, and ARIMA/STL-based sales forecasting for actionable insights.
  </p>
  <p align="center">
    <img alt="Python" src="https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white">
    <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white">
    <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white">
  </p>

  ———

  ## 📚 Table of Contents

  - Overview (#-overview)
  - Motivation (#-motivation)
  - Features (#-features)
  - Demo (#-demo)
  - Quick Start (#-quick-start)
  - 📖 Usage (#-usage)
  - Development Notes (#-development-notes)
  - 🤝 Contributing (#-contributing)
  - Roadmap (#-roadmap)

  ## 🧭 Overview

  This service powers an inventory management platform with a REST API for stores, departments, products, inventory levels, weekly sales, and machine-generated
  forecasts. It combines SQLAlchemy models, FastAPI routes, and a forecasting toolkit to ingest Walmart competition data, build ensemble ARIMA/STL predictions,
  and expose them to a frontend dashboard.

  ## 💡 Motivation

  Manual spreadsheets and ad hoc reports made stock replenishment reactive. By centralizing historical sales, store topology, and predictive models in one
  backend, decision-makers can evaluate holiday surges, plan production, and keep shelves balanced without wrestling with BI exports or external SaaS tools.

  ## ✨ Features

  - Comprehensive data model — stores, departments, products, inventories, weekly sales, and forecasts mapped in SQLAlchemy with cascade relationships.
  - FastAPI routers — REST endpoints grouped per domain (/api/stores, /api/inventory, /api/forecasts) using Pydantic schemas for strong validation.
  - Forecasting pipeline — scripts create Fourier-based ARIMA and STL models, ensemble the outcomes, shift holiday demand, and store results in the DB.
  - Seed & maintenance scripts — utilities populate master data from CSV/JSON dumps, reset tables, inspect DB state, and troubleshoot data joins.
  - SQLite/PostgreSQL ready — configuration loads from .env, with optional fallbacks that allow local development on SQLite and deployment on Postgres.

  ## 🚀 Quick Start

  ### Prerequisites

  - Python 3.11+
  - Poetry or pip for dependency management
  - SQLite (bundled) or PostgreSQL running and reachable
  - Walmart competition CSVs in data/ (train.csv, test.csv, features.csv, stores.csv)
  - Optional: virtual environment manager (venv, pyenv, etc.)

  ### Installation

  cd backend
  python -m venv .venv
  source .venv/bin/activate           # Windows: .venv\Scripts\activate
  pip install --upgrade pip
  pip install -r requirements.txt

  ### Environment

  Create .env at the project root (next to backend/) with your database URL:

  DATABASE_URL=sqlite:///./inventory.db

  ### Seed essential data

  python scripts/populate_database.py

  This will:

  1. Create tables.
  2. Seed departments, stores, products.
  3. Load weekly sales, infer inventory, and load forecasts from CSV outputs.

  ## 📖 Usage

  Start the API (from project root):

  uvicorn backend.app.main:app --reload

  Available domains (all prefixed with /api):

  - /stores — CRUD for store metadata.
  - /departments — manage departments and attach them to stores.
  - /products — create, update, delete products per department.
  - /inventory — query/update stock by store/department/product composite keys.
  - /weekly_sales — manage weekly sales entries (with holiday flag).
  - /forecasts — retrieve forecast lists or drill into specific store-department-week combinations.

  Example request:

  curl http://localhost:8000/api/forecasts/1/1

  ## 🛠️ Development Notes

  - backend/__init__.py ensures intra-package imports like from app.schemas work even when running Uvicorn from the repository root.
  - db/session.py loads .env, falling back to the bundled inventory.db if no URL is set; adjust for production-grade databases.
  - Forecast scripts live under app/forecast/ and scripts/—they create Fourier features, run ARIMA/STL models, ensemble predictions, apply Christmas demand
  shifts, and compute WMAE.
  - Diagnostic helpers (scripts/debug_*) analyze missing merge keys, inspect DB contents, and troubleshoot ARIMA parameter issues.
  - Generated plots land in scripts/plots/ for quick EDA snapshots.

  ## 🤝 Contributing

  1. Fork the repository and branch from main.
  2. Run pip install -r requirements.txt inside a fresh virtual environment.
  3. Format/lint if you add tooling, run the FastAPI server, and ensure seed scripts still succeed.
  4. Open a PR describing the change, rationale, and any follow-up tasks.

  ## 🧱 Roadmap

  - Package the forecasting pipeline into Alembic-style migrations or CLI commands.
  - Add JWT-based auth/permissions for write endpoints.
  - Introduce async session handling and connection pooling for Postgres.
  - Expand forecast endpoints with confidence intervals and scenario comparisons.
  - Add unit/integration tests plus CI automation.
