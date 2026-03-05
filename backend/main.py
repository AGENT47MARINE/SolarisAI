"""
SolarisAI FastAPI Application Entry Point

Startup sequence:
  1. Create DB tables (if not exist)
  2. Seed DB with initial plant/device data
  3. Load ML model artifacts
  4. Start device simulator (background task)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import create_tables
from app.api import dashboard, plants, devices, alerts, ai
from app.services.ml_service import ml_service
from app.services.simulator import start_simulator, stop_simulator

app = FastAPI(
    title="SolarisAI API",
    description="Solar monitoring backend with custom ML fault diagnosis",
    version="1.0.0",
)

# CORS — allow the Vite dev server on port 5173
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(dashboard.router)
app.include_router(plants.router)
app.include_router(devices.router)
app.include_router(alerts.router)
app.include_router(ai.router)


@app.on_event("startup")
async def on_startup():
    print("🌞 SolarisAI Backend starting...")
    # 1. Create tables
    await create_tables()
    # 2. Seed initial data
    from seed import seed
    await seed()
    # 3. Load ML model
    ml_service.load()
    # 4. Start device simulator
    await start_simulator()
    print("✅ Backend ready → http://localhost:8000/docs")


@app.on_event("shutdown")
async def on_shutdown():
    await stop_simulator()


@app.get("/")
async def health():
    return {
        "status": "ok",
        "service": "SolarisAI Backend",
        "ml_model_loaded": ml_service.is_loaded,
        "docs": "/docs",
    }
