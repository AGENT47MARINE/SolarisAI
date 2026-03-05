"""GET /api/devices, GET /api/devices/{id}/telemetry"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.models import Device, Telemetry
from app.schemas.schemas import DeviceSummary, TelemetryReading
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/devices", tags=["Devices"])


@router.get("", response_model=list[DeviceSummary])
async def list_devices(db: AsyncSession = Depends(get_db)):
    devices = (await db.execute(select(Device))).scalars().all()
    return [DeviceSummary(
        id=d.id, device_name=d.device_name, category=d.category,
        manufacturer=d.manufacturer, status=d.status, plant_id=d.plant_id
    ) for d in devices]


@router.get("/{device_id}/telemetry", response_model=list[TelemetryReading])
async def get_telemetry(
    device_id: str,
    limit: int = Query(default=50, le=500),
    db: AsyncSession = Depends(get_db),
):
    device = await db.get(Device, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    rows = (
        await db.execute(
            select(Telemetry)
            .where(Telemetry.device_id == device_id)
            .order_by(Telemetry.time.desc())
            .limit(limit)
        )
    ).scalars().all()
    return list(reversed(rows))


@router.get("/{device_id}/latest", response_model=TelemetryReading)
async def get_latest_telemetry(device_id: str, db: AsyncSession = Depends(get_db)):
    device = await db.get(Device, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    row = (
        await db.execute(
            select(Telemetry)
            .where(Telemetry.device_id == device_id)
            .order_by(Telemetry.time.desc())
            .limit(1)
        )
    ).scalars().first()
    if not row:
        raise HTTPException(status_code=404, detail="No telemetry data yet")
    return row
