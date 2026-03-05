"""SQLAlchemy ORM models for Plant, Device, Telemetry, Alert."""

from datetime import datetime
from sqlalchemy import String, Float, Integer, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Plant(Base):
    __tablename__ = "plants"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    location: Mapped[str] = mapped_column(String(200))
    lat: Mapped[float] = mapped_column(Float, default=23.0)
    lng: Mapped[float] = mapped_column(Float, default=72.5)
    capacity_kwp: Mapped[float] = mapped_column(Float, default=5000.0)
    status: Mapped[str] = mapped_column(String(30), default="active")
    commissioned_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    devices: Mapped[list["Device"]] = relationship("Device", back_populates="plant")
    alerts: Mapped[list["Alert"]] = relationship("Alert", back_populates="plant")


class Device(Base):
    __tablename__ = "devices"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    plant_id: Mapped[str] = mapped_column(String, ForeignKey("plants.id"))
    device_name: Mapped[str] = mapped_column(String(100))
    # category: inverter | mfm | wms | slms
    category: Mapped[str] = mapped_column(String(30))
    manufacturer: Mapped[str] = mapped_column(String(100))
    model: Mapped[str] = mapped_column(String(100), default="")
    serial_no: Mapped[str] = mapped_column(String(100), default="")
    status: Mapped[str] = mapped_column(String(30), default="active")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    plant: Mapped["Plant"] = relationship("Plant", back_populates="devices")
    telemetry: Mapped[list["Telemetry"]] = relationship("Telemetry", back_populates="device")
    alerts: Mapped[list["Alert"]] = relationship("Alert", back_populates="device")


class Telemetry(Base):
    """
    Time-series readings from inverters/sensors.
    In production: use TimescaleDB hypertable on `time` column.
    Columns match MQTT payload and simulator output for seamless swap.
    """
    __tablename__ = "telemetry"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    time: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    device_id: Mapped[str] = mapped_column(String, ForeignKey("devices.id"), index=True)

    # Three-phase electrical
    voltage_ab: Mapped[float] = mapped_column(Float, default=0.0)
    voltage_bc: Mapped[float] = mapped_column(Float, default=0.0)
    voltage_ac: Mapped[float] = mapped_column(Float, default=0.0)
    current_a: Mapped[float] = mapped_column(Float, default=0.0)
    current_b: Mapped[float] = mapped_column(Float, default=0.0)
    current_c: Mapped[float] = mapped_column(Float, default=0.0)

    # Power
    active_power: Mapped[float] = mapped_column(Float, default=0.0)
    reactive_power: Mapped[float] = mapped_column(Float, default=0.0)
    frequency: Mapped[float] = mapped_column(Float, default=50.0)

    # Environmental
    temperature: Mapped[float] = mapped_column(Float, default=25.0)
    irradiance: Mapped[float] = mapped_column(Float, default=0.0)

    # Generation counters
    today_generation: Mapped[float] = mapped_column(Float, default=0.0)   # kWh
    total_generation: Mapped[float] = mapped_column(Float, default=0.0)   # kWh

    device: Mapped["Device"] = relationship("Device", back_populates="telemetry")


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    device_id: Mapped[str] = mapped_column(String, ForeignKey("devices.id"))
    plant_id: Mapped[str] = mapped_column(String, ForeignKey("plants.id"))
    # severity: critical | warning | info
    severity: Mapped[str] = mapped_column(String(20), default="warning")
    message: Mapped[str] = mapped_column(Text)
    acknowledged: Mapped[bool] = mapped_column(Boolean, default=False)
    acknowledged_by: Mapped[str] = mapped_column(String(100), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    device: Mapped["Device"] = relationship("Device", back_populates="alerts")
    plant: Mapped["Plant"] = relationship("Plant", back_populates="alerts")
