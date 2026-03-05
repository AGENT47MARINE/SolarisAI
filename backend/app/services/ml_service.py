"""
ML Inference Service — loads trained model and runs predictions.
"""

import json
from pathlib import Path
from typing import Optional
import numpy as np
import joblib

from app.ml.dataset import FAULT_CLASSES, build_features
from app.ml.train import FEATURE_COLS

MODELS_DIR = Path(__file__).parent.parent / "ml" / "models"

# ── Fault remediation recommendations ────────────────────────────────────────
RECOMMENDATIONS = {
    "Normal": [
        "System operating within normal parameters.",
        "Continue regular scheduled maintenance.",
    ],
    "Overtemperature": [
        "Dispatch technician for thermal inspection immediately.",
        "Check cooling fan operation and duty cycle.",
        "Inspect heat sink for dust or blockage.",
        "Do not restart until core temperature drops below 45°C.",
    ],
    "Grid_Undervoltage": [
        "Check grid supply at the point of common coupling (PCC).",
        "Verify AC breaker and cable connections.",
        "Contact grid operator to report low voltage event.",
        "Monitor frequency; potential islanding risk.",
    ],
    "Grid_Overvoltage": [
        "Check for reactive power compensation settings.",
        "Inspect surge protection devices.",
        "Contact grid operator — possible transformer tap issue.",
        "Review export limiting settings.",
    ],
    "IGBT_Fault": [
        "Immediately check gate driver circuitry for IGBT module.",
        "Measure drive signals with oscilloscope.",
        "Check for thermal damage on IGBT package.",
        "Arrange replacement IGBT module if confirmed faulty.",
    ],
    "DC_String_Fault": [
        "Inspect DC string combiner box for blown fuses.",
        "Check individual string open-circuit voltage.",
        "Look for shading, soiling, or delamination on panels.",
        "Use IV curve tracer to identify degraded strings.",
    ],
    "Communication_Timeout": [
        "Check RS485 / Modbus cable continuity.",
        "Verify datalogger power supply.",
        "Restart datalogger unit.",
        "Check for loose terminal block connections.",
    ],
    "Phase_Imbalance": [
        "Verify three-phase supply balance at PCC.",
        "Check load distribution across phases.",
        "Inspect connections for loose or corroded terminals.",
        "Replace current transformers (CTs) if imbalance persists.",
    ],
}

ROOT_CAUSES = {
    "Normal": "All telemetry values within operational limits.",
    "Overtemperature": (
        "Core temperature has exceeded the safe operating limit. "
        "Common causes: cooling fan failure, heat sink contamination, or ambient overheating."
    ),
    "Grid_Undervoltage": (
        "AC grid voltage has dropped below the minimum threshold. "
        "Possible causes: grid fault, heavy load on feeder, or tripped protection relay."
    ),
    "Grid_Overvoltage": (
        "AC grid voltage has risen above the maximum threshold. "
        "Possible causes: load shedding on feeder, transformer tap misconfiguration, or reactive power issues."
    ),
    "IGBT_Fault": (
        "Asymmetric phase currents detected, indicating a possible IGBT module or gate driver failure. "
        "Risk of complete inverter shutdown if not addressed."
    ),
    "DC_String_Fault": (
        "Active power is abnormally low relative to irradiance. "
        "One or more DC strings are likely open-circuited or severely degraded."
    ),
    "Communication_Timeout": (
        "No telemetry received. Device may be offline or communication bus (RS485/Modbus) has failed."
    ),
    "Phase_Imbalance": (
        "Significant voltage or current imbalance detected between phases. "
        "Can cause overheating and reduced efficiency if unresolved."
    ),
}

DOWNTIME_ESTIMATES = {
    "Normal": "0 hours",
    "Overtemperature": "2–6 hours",
    "Grid_Undervoltage": "Unknown — grid-dependent",
    "Grid_Overvoltage": "Unknown — grid-dependent",
    "IGBT_Fault": "8–24 hours (part replacement)",
    "DC_String_Fault": "4–8 hours",
    "Communication_Timeout": "0.5–2 hours",
    "Phase_Imbalance": "1–4 hours",
}


class MLService:
    def __init__(self):
        self._clf = None
        self._scaler = None
        self._le = None
        self._loaded = False

    def load(self):
        """Load model artifacts from disk. Called on app startup."""
        try:
            self._clf = joblib.load(MODELS_DIR / "fault_classifier.pkl")
            self._scaler = joblib.load(MODELS_DIR / "feature_scaler.pkl")
            self._le = joblib.load(MODELS_DIR / "label_encoder.pkl")
            with open(MODELS_DIR / "model_metadata.json") as f:
                self.metadata = json.load(f)
            self._loaded = True
            print(f"✅ ML model loaded — accuracy: {self.metadata['test_accuracy']*100:.1f}%")
        except FileNotFoundError:
            print("⚠️  ML model not found. Run: python -m app.ml.train")
            self._loaded = False

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    def predict(self, telemetry: dict) -> dict:
        """
        Run inference on a single telemetry reading.

        telemetry: dict with raw inverter fields
        Returns: dict with fault_class, confidence, root_cause, recommendations
        """
        if not self._loaded:
            return _fallback_rule_based(telemetry)

        # Compute derived features
        enriched = build_features(telemetry)
        feature_vec = np.array([[enriched[col] for col in FEATURE_COLS]])
        feature_scaled = self._scaler.transform(feature_vec)

        proba = self._clf.predict_proba(feature_scaled)[0]
        pred_idx = int(np.argmax(proba))
        confidence = float(proba[pred_idx])

        fault_class = FAULT_CLASSES[pred_idx]

        return {
            "fault_class": fault_class,
            "confidence": round(confidence, 4),
            "root_cause": ROOT_CAUSES.get(fault_class, "Unknown fault."),
            "recommendations": RECOMMENDATIONS.get(fault_class, []),
            "estimated_downtime": DOWNTIME_ESTIMATES.get(fault_class, "Unknown"),
            "severity": _severity(fault_class),
            "model_version": getattr(self, "metadata", {}).get("version", "1.0.0"),
        }


def _severity(fault_class: str) -> str:
    critical = {"Overtemperature", "IGBT_Fault", "DC_String_Fault", "Grid_Undervoltage", "Grid_Overvoltage"}
    warning = {"Communication_Timeout", "Phase_Imbalance"}
    if fault_class in critical:
        return "critical"
    if fault_class in warning:
        return "warning"
    return "info"


def _fallback_rule_based(t: dict) -> dict:
    """Simple rule-based fallback when model isn't trained yet."""
    if t.get("temperature", 0) > 55:
        fc = "Overtemperature"
    elif t.get("voltage_ab", 410) < 380:
        fc = "Grid_Undervoltage"
    elif t.get("active_power", 10) < 1 and t.get("irradiance", 500) > 100:
        fc = "DC_String_Fault"
    elif all(t.get(k, 1) == 0 for k in ["voltage_ab", "current_a", "active_power"]):
        fc = "Communication_Timeout"
    else:
        fc = "Normal"
    return {
        "fault_class": fc,
        "confidence": 0.75,
        "root_cause": ROOT_CAUSES.get(fc, "Unknown"),
        "recommendations": RECOMMENDATIONS.get(fc, []),
        "estimated_downtime": DOWNTIME_ESTIMATES.get(fc, "Unknown"),
        "severity": _severity(fc),
        "model_version": "rule-based-fallback",
    }


# Singleton
ml_service = MLService()
