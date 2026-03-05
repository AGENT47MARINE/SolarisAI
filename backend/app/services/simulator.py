"""
Device Simulator — Generates realistic inverter telemetry at regular intervals.

Design for real-device swap:
  - Each device runs the same simulation loop as a background task
  - To use real MQTT devices, replace the `_simulate_reading()` call with
    an MQTT subscribe callback that parses the published payload
  - The DB insertion logic (`_write_telemetry`) stays identical

Usage: Launched automatically by FastAPI on startup.
"""

import asyncio
import random
import math
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.models.models import Device, Telemetry, Alert

# ── Config ──────────────────────────────────────────────────────────────────
POLL_INTERVAL_SECONDS = 5   # how often to generate new readings
ALERT_TEMP_THRESHOLD = 55.0 # °C — triggers Overtemperature alert
ALERT_VOLT_LOW = 380.0      # V — triggers Grid_Undervoltage alert
# ─────────────────────────────────────────────────────────────────────────────

_running = False
_cumulative: dict[str, dict] = {}  # tracks today_gen / total_gen per device


def _simulate_reading(device: Device, t_seconds: float) -> dict:
    """
    Generate a realistic telemetry reading for a simulated device.

    ── REAL-DEVICE SWAP ──
    Replace this entire function body with:
        payload = mqtt_client.get_latest(device.device_name)
        return parse_mqtt_payload(payload)
    ────────────────────
    """
    # Diurnal irradiance curve (peak at t=21600s ≈ noon)
    hour = (datetime.utcnow().hour + datetime.utcnow().minute / 60)
    irradiance = max(0, 1000 * math.sin(math.pi * (hour - 6) / 12)) if 6 <= hour <= 18 else 0
    irradiance += random.uniform(-20, 20)
    irradiance = max(0, irradiance)

    # Inject faults for specific test devices
    fault_device = "REWA_INV_08"
    is_fault_device = device.device_name == fault_device

    vab = random.uniform(400, 420)
    vbc = vab + random.uniform(-2, 2)
    vac = vab + random.uniform(-2, 2)

    if is_fault_device:
        temp = random.uniform(58, 72)  # overtemp!
    else:
        temp = random.uniform(28, 48) + (irradiance / 1000) * 8

    ia = max(0, (irradiance / 1000) * 50 + random.uniform(-2, 2))
    ib = ia + random.uniform(-0.5, 0.5)
    ic = ia + random.uniform(-0.5, 0.5)

    active_power = round((vab * ia * 0.98 * math.sqrt(3)) / 1000, 2)
    reactive_power = round(active_power * random.uniform(0.05, 0.15), 2)
    freq = round(random.uniform(49.85, 50.15), 3)

    return {
        "voltage_ab": round(vab, 2),
        "voltage_bc": round(vbc, 2),
        "voltage_ac": round(vac, 2),
        "current_a": round(ia, 2),
        "current_b": round(ib, 2),
        "current_c": round(ic, 2),
        "active_power": max(0, active_power),
        "reactive_power": max(0, reactive_power),
        "frequency": freq,
        "temperature": round(temp, 1),
        "irradiance": round(irradiance, 1),
    }


async def _write_telemetry(session: AsyncSession, device: Device, reading: dict):
    """Persist one telemetry reading to the DB (same logic for real devices)."""
    dev_state = _cumulative.setdefault(device.id, {
        "today_gen": random.uniform(500, 4000),
        "total_gen": random.uniform(50000, 150000),
    })
    # Accumulate kWh (power × interval / 3600)
    kwh_delta = (reading["active_power"] * POLL_INTERVAL_SECONDS) / 3600
    dev_state["today_gen"] += kwh_delta
    dev_state["total_gen"] += kwh_delta

    t = Telemetry(
        time=datetime.utcnow(),
        device_id=device.id,
        **reading,
        today_generation=round(dev_state["today_gen"], 3),
        total_generation=round(dev_state["total_gen"], 3),
    )
    session.add(t)

    # Auto-create alerts for threshold breaches
    if reading["temperature"] > ALERT_TEMP_THRESHOLD:
        existing = (await session.execute(
            __import__("sqlalchemy", fromlist=["select"]).select(Alert)
            .where(Alert.device_id == device.id)
            .where(Alert.acknowledged == False)
            .where(Alert.message.contains("temperature"))
        )).scalars().first()
        if not existing:
            session.add(Alert(
                device_id=device.id,
                plant_id=device.plant_id,
                severity="critical",
                message=f"Overtemperature detected: {reading['temperature']}°C — Thermal Runaway Risk",
            ))

    if reading["voltage_ab"] < ALERT_VOLT_LOW and reading["voltage_ab"] > 0:
        existing = (await session.execute(
            __import__("sqlalchemy", fromlist=["select"]).select(Alert)
            .where(Alert.device_id == device.id)
            .where(Alert.acknowledged == False)
            .where(Alert.message.contains("voltage"))
        )).scalars().first()
        if not existing:
            session.add(Alert(
                device_id=device.id,
                plant_id=device.plant_id,
                severity="warning",
                message=f"Grid undervoltage: {reading['voltage_ab']}V — Below minimum threshold",
            ))

    await session.commit()


async def _simulator_loop():
    """Main simulation loop — runs forever as a background task."""
    global _running
    _running = True
    print(f"🔌 Device simulator started (interval: {POLL_INTERVAL_SECONDS}s)")
    t_seconds = 0.0

    while _running:
        try:
            async with AsyncSessionLocal() as session:
                from sqlalchemy import select
                devices = (await session.execute(select(Device))).scalars().all()
                for device in devices:
                    if device.status == "expired":
                        continue
                    reading = _simulate_reading(device, t_seconds)
                    await _write_telemetry(session, device, reading)
        except Exception as e:
            print(f"⚠️  Simulator error: {e}")

        t_seconds += POLL_INTERVAL_SECONDS
        await asyncio.sleep(POLL_INTERVAL_SECONDS)


async def start_simulator():
    """Called on FastAPI startup."""
    asyncio.create_task(_simulator_loop())


async def stop_simulator():
    """Called on FastAPI shutdown."""
    global _running
    _running = False
    print("🔌 Device simulator stopped")
