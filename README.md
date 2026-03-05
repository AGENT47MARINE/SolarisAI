# SolarisAI ☀️

> Solar plant monitoring dashboard — hackathon project

A full-stack solar monitoring platform with a custom ML fault diagnosis model.

## Quick Start

### Frontend (React + Vite)
```bash
npm install
npm run dev
# → http://localhost:5173
```

### Backend (FastAPI + Python)
```bash
cd backend
pip install -r requirements.txt

# Train the ML fault diagnosis model (one-time)
python -m app.ml.train

# Start backend server (seeds DB + starts device simulator automatically)
uvicorn main:app --reload --port 8000
# → http://localhost:8000/docs  (Swagger UI)
```

## Architecture

```
Frontend (React/Vite :5173)
        ↕ REST API (Axios)
Backend (FastAPI :8000)
    ├── REST API             (plants, devices, alerts, dashboard metrics)
    ├── Custom ML Model      (XGBoost fault classifier — no external API)
    └── Device Simulator     (generates realistic telemetry; MQTT-swap-ready)
        ↕ SQLAlchemy async
SQLite (dev) / PostgreSQL+TimescaleDB (prod)
```

## ML Fault Diagnosis Model

Custom XGBoost multi-class classifier — **no external API key required**.

- **8 fault classes**: Normal, Overtemperature, Grid Under/Overvoltage, IGBT Fault, DC String Fault, Communication Timeout, Phase Imbalance
- **15 input features**: 3-phase voltages/currents, power, temperature, irradiance, frequency + derived imbalance/power-factor metrics
- **Training data**: 50,000 physics-informed synthetic samples
- **Expected accuracy**: ~92–95%

```bash
# Train
cd backend && python -m app.ml.train

# Evaluate
python -m app.ml.evaluate
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard/metrics` | Aggregated KPIs |
| `GET` | `/api/plants` | All plants with live generation data |
| `GET` | `/api/plants/{id}` | Single plant with device list |
| `GET` | `/api/devices/{id}/telemetry` | Time-series readings |
| `GET` | `/api/alerts` | Alert list (filterable) |
| `PATCH` | `/api/alerts/{id}/acknowledge` | Acknowledge an alert |
| `POST` | `/api/ai/diagnose` | ML fault diagnosis |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + React Router |
| Styling | Vanilla CSS (Figma design system) |
| Backend | FastAPI (Python) |
| Database | SQLite (dev) → PostgreSQL/TimescaleDB (prod) |
| ORM | SQLAlchemy async + aiosqlite |
| ML Model | XGBoost + scikit-learn pipeline |
| IoT Simulation | Async background telemetry simulator |

## Replacing Simulator with Real IoT Devices

The simulator (`backend/app/services/simulator.py`) is designed for seamless swap:

1. Replace `_simulate_reading()` with an MQTT subscribe callback
2. Parse the MQTT payload to the same dict format
3. The `_write_telemetry()` function remains unchanged

MQTT topic structure:
```
solaris/{plant_id}/{device_id}/telemetry
solaris/{plant_id}/{device_id}/alert
```
