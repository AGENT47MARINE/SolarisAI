"""
Seed the database with initial plant/device/alert data.
Run: python -m seed   (from the backend/ directory)
"""

import asyncio
from datetime import datetime
from app.core.database import AsyncSessionLocal, create_tables
from app.models.models import Plant, Device, Alert


PLANTS = [
    {"id": "p1", "name": "Dehgam Plant", "location": "Dehgam, Gujarat", "lat": 23.29, "lng": 72.80, "capacity_kwp": 5000, "status": "active"},
    {"id": "p2", "name": "Charanka Plant", "location": "Charanka, Gujarat", "lat": 23.88, "lng": 71.17, "capacity_kwp": 4500, "status": "active"},
    {"id": "p3", "name": "Bhadla Plant", "location": "Bhadla, Rajasthan", "lat": 27.54, "lng": 72.08, "capacity_kwp": 6000, "status": "partially-active"},
    {"id": "p4", "name": "Kamuthi Plant", "location": "Kamuthi, Tamil Nadu", "lat": 9.37, "lng": 78.39, "capacity_kwp": 5500, "status": "active"},
    {"id": "p5", "name": "Rewa Plant", "location": "Rewa, Madhya Pradesh", "lat": 24.53, "lng": 81.30, "capacity_kwp": 4000, "status": "alert"},
]

DEVICES = [
    {"id": "d1", "plant_id": "p1", "device_name": "DEHGAM_INV_01", "category": "inverter", "manufacturer": "Mindra", "status": "active"},
    {"id": "d2", "plant_id": "p1", "device_name": "DEHGAM_MFM_01", "category": "mfm", "manufacturer": "Schneider", "status": "active"},
    {"id": "d3", "plant_id": "p2", "device_name": "CHARANKA_INV_05", "category": "inverter", "manufacturer": "ABB", "status": "active"},
    {"id": "d4", "plant_id": "p2", "device_name": "CHARANKA_WMS_01", "category": "wms", "manufacturer": "Davis", "status": "active"},
    {"id": "d5", "plant_id": "p3", "device_name": "BHADLA_INV_12", "category": "inverter", "manufacturer": "Mindra", "status": "active"},
    {"id": "d6", "plant_id": "p3", "device_name": "BHADLA_MFM_02", "category": "mfm", "manufacturer": "Schneider", "status": "active"},
    {"id": "d7", "plant_id": "p4", "device_name": "KAMUTHI_INV_03", "category": "inverter", "manufacturer": "Sungrow", "status": "active"},
    {"id": "d8", "plant_id": "p4", "device_name": "KAMUTHI_SLMS_01", "category": "slms", "manufacturer": "Huawei", "status": "active"},
    {"id": "d9", "plant_id": "p5", "device_name": "REWA_INV_08", "category": "inverter", "manufacturer": "Mindra", "status": "alert"},
    {"id": "d10", "plant_id": "p5", "device_name": "REWA_MFM_01", "category": "mfm", "manufacturer": "Schneider", "status": "active"},
]

ALERTS = [
    {"device_id": "d9", "plant_id": "p5", "severity": "critical", "message": "Overtemperature detected: 65.5°C — Thermal Runaway Risk"},
    {"device_id": "d1", "plant_id": "p1", "severity": "warning", "message": "Elevated IGBT temperature (52.2°C) — Desert Heat Wave"},
    {"device_id": "d6", "plant_id": "p3", "severity": "warning", "message": "Sensor communication timeout — RS485 Loop Error"},
    {"device_id": "d7", "plant_id": "p4", "severity": "critical", "message": "Grid Under Voltage / Lost Communication — Potential Islanding"},
]


async def seed():
    await create_tables()
    async with AsyncSessionLocal() as session:
        # Plants
        for p in PLANTS:
            existing = await session.get(Plant, p["id"])
            if not existing:
                session.add(Plant(**p))

        # Devices
        for d in DEVICES:
            existing = await session.get(Device, d["id"])
            if not existing:
                session.add(Device(**d))

        # Alerts
        from sqlalchemy import select, func
        count = (await session.execute(select(func.count()).select_from(Alert))).scalar()
        if count == 0:
            for a in ALERTS:
                session.add(Alert(**a))

        await session.commit()
    print("✅ Database seeded: 5 plants, 10 devices, 4 alerts")


if __name__ == "__main__":
    asyncio.run(seed())
