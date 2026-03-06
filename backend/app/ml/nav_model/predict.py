"""
Navigation suggestion model inference.
Predicts top-k next views given session context.
"""

import json
from pathlib import Path
from typing import List, Optional

import numpy as np
import joblib

from app.ml.nav_model.features import (
    build_feature_vector,
    get_view_encoder,
    ALL_VIEWS,
)

MODELS_DIR = Path(__file__).parent.parent / "models"


class NavSuggester:
    """Loads trained nav suggestion model and returns predictions."""

    def __init__(self):
        self._model = None
        self._loaded = False
        self._metadata = {}

    def load(self):
        """Load model artifacts."""
        try:
            model_path = MODELS_DIR / "nav_suggester.pkl"
            self._model = joblib.load(model_path)

            meta_path = MODELS_DIR / "nav_metadata.json"
            if meta_path.exists():
                with open(meta_path) as f:
                    self._metadata = json.load(f)

            self._loaded = True
            acc = self._metadata.get("cv_accuracy", 0) * 100
            print(f"✅ Nav suggestion model loaded — CV accuracy: {acc:.1f}%")
        except FileNotFoundError:
            print("⚠️  Nav suggestion model not found. Run: python -m app.ml.nav_model.train")
            self._loaded = False

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    def predict_top_k(
        self,
        current_view: str,
        last_intent: str,
        history: list,
        k: int = 3,
        hour_of_day: int = 12,
        day_of_week: int = 1,
    ) -> List[dict]:
        """
        Predict top-k next views.
        Returns list of {view, label, probability}.
        """
        if not self._loaded:
            return self._fallback_suggestions(current_view, last_intent)

        # Build feature vector
        feature_vec = build_feature_vector(
            current_view=current_view,
            last_intent=last_intent,
            history=history,
            hour_of_day=hour_of_day,
            day_of_week=day_of_week,
        )

        # Predict probabilities
        proba = self._model.predict_proba(feature_vec.reshape(1, -1))[0]

        # Get top-k indices
        top_indices = np.argsort(proba)[::-1][:k]

        view_encoder = get_view_encoder()
        results = []
        for idx in top_indices:
            if idx < len(ALL_VIEWS):
                view = ALL_VIEWS[idx]
            else:
                view = "dashboard"

            prob = float(proba[idx])
            if prob < 0.05:
                continue

            results.append({
                "view": view,
                "label": _view_to_label(view),
                "probability": round(prob, 3),
            })

        return results

    def _fallback_suggestions(
        self, current_view: str, last_intent: str
    ) -> List[dict]:
        """Simple heuristic-based suggestions when model isn't available."""
        suggestions = {
            "dashboard": [
                {"view": "alerts", "label": "Check system alerts", "probability": 0.65},
                {"view": "inverters", "label": "View all inverters", "probability": 0.55},
            ],
            "alerts": [
                {"view": "inverters", "label": "View inverter details", "probability": 0.60},
                {"view": "dashboard", "label": "Return to dashboard", "probability": 0.50},
            ],
            "inverters": [
                {"view": "alerts", "label": "Check alerts", "probability": 0.55},
                {"view": "dashboard", "label": "Return to dashboard", "probability": 0.45},
            ],
        }
        return suggestions.get(current_view, [
            {"view": "dashboard", "label": "Go to dashboard", "probability": 0.50},
        ])


def _view_to_label(view: str) -> str:
    """Convert a view identifier to a human-readable label."""
    labels = {
        "dashboard": "Main dashboard overview",
        "alerts": "View system alerts",
        "map": "Solar plant map",
        "sensors": "Sensor readings",
        "inverters": "All inverters list",
    }
    if view in labels:
        return labels[view]
    if view.startswith("plant_"):
        plant = view.replace("plant_", "").replace("_", " ").title()
        return f"View {plant} plant details"
    if view.startswith("diagnose_"):
        device = view.replace("diagnose_", "")
        return f"Run diagnostic on {device}"
    if "_INV_" in view:
        return f"View inverter {view}"
    return f"Navigate to {view}"


# Singleton
nav_suggester = NavSuggester()
