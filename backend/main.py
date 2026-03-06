"""
SolarisAI FastAPI Application Entry Point

Startup sequence:
  1. Create DB tables (if not exist)
  2. Seed DB with initial plant/device data
  3. Seed default users (admin/operator)
  4. Load ML model artifacts
  5. Start device simulator (background task)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import create_tables
from app.api import dashboard, plants, devices, alerts, ai, auth, voice, ws
from app.services.ml_service import ml_service
from app.services.simulator import start_simulator, stop_simulator

app = FastAPI(
    title="SolarisAI API",
    description="Solar monitoring backend with Voice AI navigation and custom ML fault diagnosis",
    version="2.0.0",
)

# CORS — allow the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(plants.router)
app.include_router(devices.router)
app.include_router(alerts.router)
app.include_router(ai.router)
app.include_router(voice.router)
app.include_router(ws.router)


@app.on_event("startup")
async def on_startup():
    print("🌞 SolarisAI Backend starting...")
    # 1. Create tables (including new voice/auth tables)
    await create_tables()
    # 2. Seed initial data
    from seed import seed
    await seed()
    # 3. Seed default users
    await _seed_users()
    # 4. Load ML model
    ml_service.load()
    # 5. Start device simulator
    await start_simulator()
    print("✅ Backend ready → http://localhost:8000/docs")


@app.on_event("shutdown")
async def on_shutdown():
    await stop_simulator()


@app.get("/")
async def root():
    return {
        "status": "ok",
        "service": "SolarisAI Backend",
        "version": "2.0.0",
        "ml_model_loaded": ml_service.is_loaded,
        "docs": "/docs",
    }


@app.get("/api/health")
async def health():
    return {"status": "ok"}


async def _seed_users():
    """Create default admin and operator users if they don't exist."""
    from app.core.database import AsyncSessionLocal
    from app.core.security import hash_password
    from app.models.models import User
    from sqlalchemy import select

    async with AsyncSessionLocal() as session:
        # Check if users already exist
        result = await session.execute(select(User).limit(1))
        if result.scalars().first():
            return

        users = [
            User(username="admin", hashed_pw=hash_password("admin"), role="admin"),
            User(username="operator", hashed_pw=hash_password("operator"), role="operator"),
            User(username="field_tech_1", hashed_pw=hash_password("solar2026"), role="operator"),
        ]
        session.add_all(users)
        await session.commit()
        print("👤 Default users seeded (admin/admin, operator/operator, field_tech_1/solar2026)")
