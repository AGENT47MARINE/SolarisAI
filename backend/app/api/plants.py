"""GET /api/plants — list all plants with live status & chart data."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.models.models import Plant, Device, Telemetry
from app.schemas.schemas import PlantSummary, PlantDetail, DeviceSummary
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/plants", tags=["Plants"])


async def _get_latest_telemetry(db: AsyncSession, device_ids: list[str]):
    if not device_ids:
        return {}
    subq = (
        select(Telemetry.device_id, func.max(Telemetry.time).label("max_time"))
        .where(Telemetry.device_id.in_(device_ids))
        .group_by(Telemetry.device_id)
        .subquery()
    )
    rows = (
        await db.execute(
            select(Telemetry).join(
                subq,
                (Telemetry.device_id == subq.c.device_id) &
                (Telemetry.time == subq.c.max_time),
            )
        )
    ).scalars().all()
    return {r.device_id: r for r in rows}


async def _get_chart_data(db: AsyncSession, device_ids: list[str], n: int = 11) -> list[float]:
    """Return last N active_power readings averaged across all devices in this plant."""
    if not device_ids:
        return []
    rows = (
        await db.execute(
            select(Telemetry.active_power, Telemetry.time)
            .where(Telemetry.device_id.in_(device_ids))
            .order_by(Telemetry.time.desc())
            .limit(n * len(device_ids))
        )
    ).all()
    if not rows:
        return []
    values = [r.active_power for r in rows[:n]]
    return list(reversed(values))


@router.get("", response_model=list[PlantSummary])
async def list_plants(db: AsyncSession = Depends(get_db)):
    plants = (await db.execute(select(Plant))).scalars().all()
    result = []
    for plant in plants:
        devs = (
            await db.execute(select(Device).where(Device.plant_id == plant.id))
        ).scalars().all()
        dev_ids = [d.id for d in devs]
        latest = await _get_latest_telemetry(db, dev_ids)
        chart = await _get_chart_data(db, dev_ids)

        today_gen = sum(t.today_generation for t in latest.values())
        total_gen = sum(t.total_generation for t in latest.values())
        last_t = max((t.time for t in latest.values()), default=None)
        last_upd = _humanize(last_t) if last_t else "N/A"

        result.append(PlantSummary(
            id=plant.id,
            name=plant.name,
            location=plant.location,
            lat=plant.lat,
            lng=plant.lng,
            status=plant.status,
            today_gen=round(today_gen, 2),
            total_gen=round(total_gen, 2),
            capacity_kwp=plant.capacity_kwp,
            device_count=len(devs),
            last_updated=last_upd,
            chart_data=chart,
        ))
    return result


@router.get("/{plant_id}", response_model=PlantDetail)
async def get_plant(plant_id: str, db: AsyncSession = Depends(get_db)):
    plant = await db.get(Plant, plant_id)
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")

    devs = (
        await db.execute(select(Device).where(Device.plant_id == plant_id))
    ).scalars().all()
    dev_ids = [d.id for d in devs]
    latest = await _get_latest_telemetry(db, dev_ids)
    chart = await _get_chart_data(db, dev_ids)

    today_gen = sum(t.today_generation for t in latest.values())
    total_gen = sum(t.total_generation for t in latest.values())
    last_t = max((t.time for t in latest.values()), default=None)

    return PlantDetail(
        id=plant.id,
        name=plant.name,
        location=plant.location,
        lat=plant.lat,
        lng=plant.lng,
        status=plant.status,
        today_gen=round(today_gen, 2),
        total_gen=round(total_gen, 2),
        capacity_kwp=plant.capacity_kwp,
        device_count=len(devs),
        last_updated=_humanize(last_t) if last_t else "N/A",
        chart_data=chart,
        devices=[DeviceSummary(
            id=d.id, device_name=d.device_name, category=d.category,
            manufacturer=d.manufacturer, status=d.status, plant_id=d.plant_id
        ) for d in devs],
    )


def _humanize(dt: datetime) -> str:
    if not dt:
        return "N/A"
    diff = datetime.utcnow() - dt
    mins = int(diff.total_seconds() / 60)
    if mins < 1:
        return "just now"
    if mins < 60:
        return f"{mins} min ago"
    hours = mins // 60
    return f"{hours} hr ago"
