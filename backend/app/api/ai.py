"""POST /api/ai/diagnose — Custom ML fault diagnosis."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.models import Device, Telemetry, Alert
from app.schemas.schemas import DiagnoseRequest, DiagnoseResponse
from app.services.ml_service import ml_service

router = APIRouter(prefix="/api/ai", tags=["AI Diagnosis"])


@router.post("/diagnose", response_model=DiagnoseResponse)
async def diagnose(req: DiagnoseRequest, db: AsyncSession = Depends(get_db)):
    """
    Run the custom XGBoost fault classifier on the latest telemetry
    for the given device and return structured diagnosis.
    """
    device = await db.get(Device, req.device_id)
    if not device:
        raise HTTPException(status_code=404, detail=f"Device '{req.device_id}' not found")

    # Fetch the latest telemetry reading for this device
    latest = (
        await db.execute(
            select(Telemetry)
            .where(Telemetry.device_id == req.device_id)
            .order_by(Telemetry.time.desc())
            .limit(1)
        )
    ).scalars().first()

    if latest:
        telemetry_dict = {
            "voltage_ab": latest.voltage_ab,
            "voltage_bc": latest.voltage_bc,
            "voltage_ac": latest.voltage_ac,
            "current_a": latest.current_a,
            "current_b": latest.current_b,
            "current_c": latest.current_c,
            "active_power": latest.active_power,
            "reactive_power": latest.reactive_power,
            "frequency": latest.frequency,
            "temperature": latest.temperature,
            "irradiance": latest.irradiance,
        }
    else:
        # No telemetry yet — use device status to craft a reading
        telemetry_dict = _status_to_telemetry(device.status)

    result = ml_service.predict(telemetry_dict)

    return DiagnoseResponse(
        fault_class=result["fault_class"],
        confidence=result["confidence"],
        root_cause=result["root_cause"],
        recommendations=result["recommendations"],
        estimated_downtime=result["estimated_downtime"],
        severity=result["severity"],
        model_version=result["model_version"],
        telemetry_used=telemetry_dict,
    )


def _status_to_telemetry(status: str) -> dict:
    """Craft a synthetic reading based on device status for demo purposes."""
    base = {
        "voltage_ab": 415.0, "voltage_bc": 414.0, "voltage_ac": 415.0,
        "current_a": 45.0, "current_b": 44.8, "current_c": 45.2,
        "active_power": 40.0, "reactive_power": 5.0,
        "frequency": 50.01, "temperature": 38.0, "irradiance": 850.0,
    }
    if status == "alert":
        base["temperature"] = 65.5
        base["active_power"] = 0.0
        base["current_a"] = base["current_b"] = base["current_c"] = 0.0
    elif status == "partially-active":
        base["active_power"] = 10.0
        base["irradiance"] = 800.0
    return base
