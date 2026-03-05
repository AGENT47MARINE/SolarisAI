"""GET /api/alerts, PATCH /api/alerts/{id}/acknowledge"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.models import Alert, Device, Plant
from app.schemas.schemas import AlertOut

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


@router.get("", response_model=list[AlertOut])
async def list_alerts(
    severity: str | None = Query(default=None),
    acknowledged: bool | None = Query(default=None),
    limit: int = Query(default=50, le=200),
    db: AsyncSession = Depends(get_db),
):
    q = select(Alert).order_by(Alert.created_at.desc()).limit(limit)
    if severity:
        q = q.where(Alert.severity == severity)
    if acknowledged is not None:
        q = q.where(Alert.acknowledged == acknowledged)

    alerts = (await db.execute(q)).scalars().all()

    result = []
    for alert in alerts:
        device = await db.get(Device, alert.device_id)
        plant = await db.get(Plant, alert.plant_id)
        result.append(AlertOut(
            id=alert.id,
            device_id=alert.device_id,
            plant_id=alert.plant_id,
            severity=alert.severity,
            message=alert.message,
            acknowledged=alert.acknowledged,
            created_at=alert.created_at,
            device_name=device.device_name if device else alert.device_id,
            plant_name=plant.name if plant else alert.plant_id,
        ))
    return result


@router.patch("/{alert_id}/acknowledge", response_model=AlertOut)
async def acknowledge_alert(alert_id: int, db: AsyncSession = Depends(get_db)):
    alert = await db.get(Alert, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.acknowledged = True
    alert.acknowledged_by = "operator"
    await db.commit()
    await db.refresh(alert)

    device = await db.get(Device, alert.device_id)
    plant = await db.get(Plant, alert.plant_id)
    return AlertOut(
        id=alert.id, device_id=alert.device_id, plant_id=alert.plant_id,
        severity=alert.severity, message=alert.message,
        acknowledged=alert.acknowledged, created_at=alert.created_at,
        device_name=device.device_name if device else alert.device_id,
        plant_name=plant.name if plant else alert.plant_id,
    )
