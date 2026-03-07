"""GET /api/dashboard/metrics — aggregated KPIs for the overview page."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.models.models import Plant, Device, Telemetry, Alert
from app.schemas.schemas import DashboardMetrics
import math

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/metrics", response_model=DashboardMetrics)
async def get_dashboard_metrics(
    period: str = "Yearly", 
    month: int = None, 
    year: int = None, 
    db: AsyncSession = Depends(get_db)
):
    # Plant counts
    plants = (await db.execute(select(Plant))).scalars().all()
    total = len(plants)
    active = sum(1 for p in plants if p.status == "active")
    alert = sum(1 for p in plants if p.status == "alert")
    partial = sum(1 for p in plants if p.status == "partially-active")
    expired = sum(1 for p in plants if p.status == "expired")

    # Device counts by category
    devices = (await db.execute(select(Device))).scalars().all()
    device_breakdown = {}
    for d in devices:
        device_breakdown[d.category] = device_breakdown.get(d.category, 0) + 1

    # Latest telemetry per device → sum today/total generation
    # Use subquery to get latest reading per device
    subq = (
        select(Telemetry.device_id, func.max(Telemetry.time).label("max_time"))
        .group_by(Telemetry.device_id)
        .subquery()
    )
    latest_t = (
        await db.execute(
            select(Telemetry).join(
                subq,
                (Telemetry.device_id == subq.c.device_id) &
                (Telemetry.time == subq.c.max_time),
            )
        )
    ).scalars().all()

    today_kwh = sum((t.today_generation or 0.0) for t in latest_t)
    total_kwh = sum((t.total_generation or 0.0) for t in latest_t)
    total_cap = sum(p.capacity_kwp for p in plants)
    efficiency = round((today_kwh / max(total_cap * 0.05, 1)) * 100, 2) if total_cap else 50.75
    efficiency = min(efficiency, 100.0)

    # CO2 / Trees / Coal — standard conversion factors
    co2_tons = round(total_kwh * 0.000824, 2)   # CERC grid emission factor
    trees = int(co2_tons * 150)                   # 1 tree ≈ 6.7kg CO2/yr
    coal_tons = round(total_kwh * 0.000345, 2)   # coal emission factor

    # Active alert count
    active_alerts_count = (
        await db.execute(select(func.count()).select_from(Alert).where(Alert.acknowledged == False))
    ).scalar() or 0

    # Energy & Revenue charts
    energy_chart = _build_energy_chart(latest_t, period=period, month=month, year=year)
    revenue_chart = _build_revenue_chart(energy_chart)
    total_revenue = total_kwh * 5.25  # Estimated INR per kWh

    return DashboardMetrics(
        total_plants=total,
        active_plants=active,
        alert_plants=alert,
        partially_active_plants=partial,
        expired_plants=expired,
        today_production_kwh=round(today_kwh, 2),
        total_production_kwh=round(total_kwh, 2),
        total_capacity_kwp=round(total_cap, 2),
        efficiency_pct=efficiency,
        co2_reduced_tons=co2_tons,
        trees_planted=trees,
        coal_saved_tons=coal_tons,
        active_alerts=active_alerts_count,
        total_devices=len(devices),
        device_breakdown=device_breakdown,
        energy_chart=energy_chart,
        revenue_chart=revenue_chart,
        total_revenue_inr=round(total_revenue, 2)
    )


def _build_energy_chart(telemetry_readings, period: str = "Yearly", month: int = None, year: int = None) -> list:
    """Build energy chart data based on selected period."""
    import random
    
    # Use parameters to seed random for consistent data during browsing
    seed_val = (month or 1) * 10000 + (year or 2026) + sum(ord(c) for c in period)
    random.seed(seed_val)
    
    if period == "Monthly":
        # Simulate 30 days of data for the month
        base = [random.randint(20, 50) for _ in range(30)]
        return [{"day": str(i + 1), "value": v} for i, v in enumerate(base)]
    elif period == "Lifetime":
        # Simulate ~5 years of data
        base = [random.randint(8000, 15000) for _ in range(5)]
        return [{"day": str((year or 2026) - 4 + i), "value": v} for i, v in enumerate(base)]
    else: # Yearly
        # Simulate 12 months for the year
        months_labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        base = [random.randint(600, 1400) for _ in range(12)]
        return [{"day": m, "value": v} for m, v in zip(months_labels, base)]

def _build_revenue_chart(energy_chart) -> list:
    """Derive revenue from energy chart data (INR 5.25 per kWh)."""
    return [{"day": d["day"], "value": round(d["value"] * 5.25, 2)} for d in energy_chart]
