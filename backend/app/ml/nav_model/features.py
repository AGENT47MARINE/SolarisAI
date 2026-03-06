"""
Feature engineering for the navigation suggestion model.
Converts session context into feature vectors for XGBoost.
"""

import numpy as np
from sklearn.preprocessing import LabelEncoder
from typing import List, Optional


# ── View and intent vocabularies ──────────────────────────────────────────────

ALL_VIEWS = [
    "dashboard", "alerts", "map", "sensors", "inverters",
    "plant_bhadla", "plant_kamuthi", "plant_rewa",
    "plant_charanka", "plant_ananthapuramu", "plant_pavagada",
    "BHADLA_INV_01", "KAMUTHI_INV_05", "REWA_INV_02",
    "CHARANKA_INV_03", "ANANTHAPURAMU_INV_04", "PAVAGADA_INV_02",
    "diagnose_BHADLA_INV_01", "diagnose_KAMUTHI_INV_05",
    "diagnose_REWA_INV_02", "diagnose_CHARANKA_INV_03",
    "diagnose_ANANTHAPURAMU_INV_04", "diagnose_PAVAGADA_INV_02",
    "UNKNOWN",
]

ALL_INTENTS = [
    "OPEN_DASHBOARD", "OPEN_PLANT", "OPEN_DEVICE",
    "OPEN_ALERTS", "OPEN_TELEMETRY", "DIAGNOSE",
    "GET_SUMMARY", "UNKNOWN",
]

PLANT_IDS = [
    "bhadla", "kamuthi", "rewa", "charanka",
    "ananthapuramu", "pavagada", "UNKNOWN",
]

DEVICE_TYPES = ["inverter", "sensor", "mfm", "wms", "UNKNOWN"]

# Pre-fit encoders
_view_encoder = LabelEncoder()
_view_encoder.fit(ALL_VIEWS)

_intent_encoder = LabelEncoder()
_intent_encoder.fit(ALL_INTENTS)

_plant_encoder = LabelEncoder()
_plant_encoder.fit(PLANT_IDS)

_device_type_encoder = LabelEncoder()
_device_type_encoder.fit(DEVICE_TYPES)


def _safe_encode(encoder: LabelEncoder, value: str) -> int:
    """Encode a value, returning last class index for unknowns."""
    try:
        return int(encoder.transform([value])[0])
    except ValueError:
        return len(encoder.classes_) - 1


def build_feature_vector(
    current_view: str,
    last_intent: str,
    history: List[dict],
    hour_of_day: int = 12,
    day_of_week: int = 1,
    has_active_alert: bool = False,
    plant_id: str = "UNKNOWN",
    device_type: str = "UNKNOWN",
) -> np.ndarray:
    """
    Build a feature vector for the navigation suggestion model.

    Features (11 total):
    0: current_view_enc (int)
    1: current_intent_enc (int)
    2: session_depth (int)
    3: hour_of_day (int)
    4: day_of_week (int)
    5: prev_view_1_enc (int)
    6: prev_view_2_enc (int)
    7: prev_view_3_enc (int)
    8: has_active_alert (int)
    9: plant_id_enc (int)
    10: device_type_enc (int)
    """
    # Encode current state
    current_view_enc = _safe_encode(_view_encoder, current_view)
    intent_enc = _safe_encode(_intent_encoder, last_intent)
    session_depth = min(len(history), 10)

    # Previous views (last 3)
    prev_views = ["UNKNOWN", "UNKNOWN", "UNKNOWN"]
    for i in range(min(3, len(history))):
        idx = len(history) - 1 - i
        if idx >= 0:
            prev_views[i] = history[idx].get("to_view", "UNKNOWN")

    prev_1 = _safe_encode(_view_encoder, prev_views[0])
    prev_2 = _safe_encode(_view_encoder, prev_views[1])
    prev_3 = _safe_encode(_view_encoder, prev_views[2])

    # Contextual flags
    alert_flag = int(has_active_alert)
    plant_enc = _safe_encode(_plant_encoder, plant_id)
    device_enc = _safe_encode(_device_type_encoder, device_type)

    return np.array([
        current_view_enc,
        intent_enc,
        session_depth,
        hour_of_day,
        day_of_week,
        prev_1,
        prev_2,
        prev_3,
        alert_flag,
        plant_enc,
        device_enc,
    ], dtype=np.float32)


FEATURE_NAMES = [
    "current_view_enc",
    "current_intent_enc",
    "session_depth",
    "hour_of_day",
    "day_of_week",
    "prev_view_1_enc",
    "prev_view_2_enc",
    "prev_view_3_enc",
    "has_active_alert",
    "plant_id_enc",
    "device_type_enc",
]


def get_view_encoder() -> LabelEncoder:
    return _view_encoder


def get_intent_encoder() -> LabelEncoder:
    return _intent_encoder
