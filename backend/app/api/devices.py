"""GET /api/devices, GET /api/devices/{id}/telemetry"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.models import Device, Telemetry
from app.schemas.schemas import DeviceSummary, TelemetryReading, CTAnalysisData, VoltageGridData
from datetime import datetime, timedelta
import math

router = APIRouter(prefix="/api/devices", tags=["Devices"])


@router.get("", response_model=list[DeviceSummary])
async def list_devices(db: AsyncSession = Depends(get_db)):
    devices = (await db.execute(select(Device))).scalars().all()
    return [DeviceSummary(
        id=d.id, device_name=d.device_name, category=d.category,
        manufacturer=d.manufacturer, status=d.status, plant_id=d.plant_id
    ) for d in devices]


@router.get("/{device_id}", response_model=DeviceSummary)
async def get_device(device_id: str, db: AsyncSession = Depends(get_db)):
    device = await db.get(Device, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return device


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

@router.get("/{device_id}/ct-analysis", response_model=list[CTAnalysisData])
async def get_ct_analysis(
    device_id: str,
    limit: int = Query(default=24, le=100),
    db: AsyncSession = Depends(get_db),
):
    rows = (
        await db.execute(
            select(Telemetry)
            .where(Telemetry.device_id == device_id)
            .order_by(Telemetry.time.desc())
            .limit(limit)
        )
    ).scalars().all()
    rows = list(reversed(rows))
    return [CTAnalysisData(
        time=r.time,
        phase_a=r.current_a,
        phase_b=r.current_b,
        phase_c=r.current_c
    ) for r in rows]


@router.get("/{device_id}/voltage-grid", response_model=VoltageGridData)
async def get_voltage_grid(device_id: str, db: AsyncSession = Depends(get_db)):
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
    
    return VoltageGridData(
        v_r=round(row.voltage_ab / math.sqrt(3), 2) if row.voltage_ab else 230.4,
        v_y=round(row.voltage_bc / math.sqrt(3), 2) if row.voltage_bc else 229.8,
        v_b=round(row.voltage_ac / math.sqrt(3), 2) if row.voltage_ac else 231.1,
        v_ry=row.voltage_ab,
        v_yb=row.voltage_bc,
        v_br=row.voltage_ac,
        freq=row.frequency,
        pf_r=0.99,
        pf_y=0.98,
        pf_b=0.99,
        i_r=row.current_a,
        i_y=row.current_b,
        i_b=row.current_c
    )
