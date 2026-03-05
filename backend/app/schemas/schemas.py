"""Pydantic schemas for all API responses."""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


# ── Plant ────────────────────────────────────────────────────────────────────
class PlantSummary(BaseModel):
    id: str
    name: str
    location: str
    lat: float
    lng: float
    status: str
    today_gen: float = 0.0      # kWh
    total_gen: float = 0.0      # kWh
    capacity_kwp: float
    device_count: int = 0
    last_updated: Optional[str] = None
    chart_data: List[float] = []  # last N active_power readings

    class Config:
        from_attributes = True


class PlantDetail(PlantSummary):
    devices: List["DeviceSummary"] = []


# ── Device ───────────────────────────────────────────────────────────────────
class DeviceSummary(BaseModel):
    id: str
    device_name: str
    category: str
    manufacturer: str
    status: str
    plant_id: str

    class Config:
        from_attributes = True


class TelemetryReading(BaseModel):
    time: datetime
    device_id: str
    voltage_ab: float
    voltage_bc: float
    voltage_ac: float
    current_a: float
    current_b: float
    current_c: float
    active_power: float
    reactive_power: float
    frequency: float
    temperature: float
    irradiance: float
    today_generation: float
    total_generation: float

    class Config:
        from_attributes = True


# ── Alert ────────────────────────────────────────────────────────────────────
class AlertOut(BaseModel):
    id: int
    device_id: str
    plant_id: str
    severity: str
    message: str
    acknowledged: bool
    created_at: datetime
    device_name: Optional[str] = None
    plant_name: Optional[str] = None

    class Config:
        from_attributes = True


# ── Dashboard ─────────────────────────────────────────────────────────────────
class DashboardMetrics(BaseModel):
    total_plants: int
    active_plants: int
    alert_plants: int
    partially_active_plants: int
    expired_plants: int
    today_production_kwh: float
    total_production_kwh: float
    total_capacity_kwp: float
    efficiency_pct: float
    co2_reduced_tons: float
    trees_planted: int
    coal_saved_tons: float
    active_alerts: int
    total_devices: int
    device_breakdown: dict  # {mfm: N, wms: N, slms: N, inverter: N}
    energy_chart: List[dict]  # [{day, value}]


# ── AI Diagnosis ──────────────────────────────────────────────────────────────
class DiagnoseRequest(BaseModel):
    device_id: str
    alert_id: Optional[int] = None


class DiagnoseResponse(BaseModel):
    fault_class: str
    confidence: float
    root_cause: str
    recommendations: List[str]
    estimated_downtime: str
    severity: str
    model_version: str
    telemetry_used: Optional[dict] = None
