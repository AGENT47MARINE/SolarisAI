"""
Synthetic navigation sequence generator for the context-routing model.

Generates Markov-chain-based navigation sequences that simulate
how field technicians navigate the solar monitoring dashboard.
"""

import json
import random
import argparse
from pathlib import Path
from datetime import datetime, timedelta


# ── View definitions ──────────────────────────────────────────────────────────

PLANTS = ["bhadla", "kamuthi", "rewa", "charanka", "ananthapuramu", "pavagada"]

DEVICES = {
    "bhadla": ["BHADLA_INV_01"],
    "kamuthi": ["KAMUTHI_INV_05"],
    "rewa": ["REWA_INV_02"],
    "charanka": ["CHARANKA_INV_03"],
    "ananthapuramu": ["ANANTHAPURAMU_INV_04"],
    "pavagada": ["PAVAGADA_INV_02"],
}

ALL_VIEWS = (
    ["dashboard", "alerts", "map", "sensors", "inverters"]
    + [f"plant_{p}" for p in PLANTS]
    + [dev for devs in DEVICES.values() for dev in devs]
)

# Intents mapped to typical transitions
INTENTS = [
    "OPEN_DASHBOARD", "OPEN_PLANT", "OPEN_DEVICE",
    "OPEN_ALERTS", "OPEN_TELEMETRY", "DIAGNOSE", "GET_SUMMARY",
]

# ── Transition probabilities (Markov chain) ───────────────────────────────────

TRANSITIONS = {
    "dashboard": {
        "alerts": 0.20,
        "map": 0.15,
        "inverters": 0.25,
        "sensors": 0.10,
        "plant_*": 0.25,
        "dashboard": 0.05,
    },
    "plant_*": {
        "device_*": 0.40,
        "alerts": 0.15,
        "dashboard": 0.15,
        "map": 0.10,
        "inverters": 0.10,
        "plant_*": 0.10,
    },
    "device_*": {
        "alerts": 0.20,
        "diagnose_*": 0.25,
        "dashboard": 0.10,
        "plant_*": 0.15,
        "inverters": 0.15,
        "device_*": 0.15,
    },
    "alerts": {
        "device_*": 0.30,
        "dashboard": 0.25,
        "plant_*": 0.15,
        "inverters": 0.15,
        "map": 0.15,
    },
    "map": {
        "plant_*": 0.40,
        "dashboard": 0.25,
        "alerts": 0.15,
        "inverters": 0.20,
    },
    "inverters": {
        "device_*": 0.45,
        "dashboard": 0.20,
        "alerts": 0.15,
        "plant_*": 0.10,
        "sensors": 0.10,
    },
    "sensors": {
        "dashboard": 0.30,
        "inverters": 0.25,
        "alerts": 0.20,
        "plant_*": 0.15,
        "map": 0.10,
    },
}

DEFAULT_TRANSITION = {
    "dashboard": 0.30,
    "alerts": 0.20,
    "inverters": 0.20,
    "plant_*": 0.15,
    "map": 0.15,
}


def _resolve_view(view_pattern: str) -> str:
    """Resolve wildcard view patterns to concrete views."""
    if view_pattern == "plant_*":
        plant = random.choice(PLANTS)
        return f"plant_{plant}"
    elif view_pattern == "device_*":
        plant = random.choice(PLANTS)
        devices = DEVICES.get(plant, [])
        return random.choice(devices) if devices else "BHADLA_INV_01"
    elif view_pattern == "diagnose_*":
        plant = random.choice(PLANTS)
        devices = DEVICES.get(plant, [])
        device = random.choice(devices) if devices else "BHADLA_INV_01"
        return f"diagnose_{device}"
    return view_pattern


def _classify_view(view: str) -> str:
    """Get the view category for transition lookup."""
    if view == "dashboard":
        return "dashboard"
    elif view.startswith("plant_"):
        return "plant_*"
    elif view in ["inverters"]:
        return "inverters"
    elif view.startswith("diagnose_") or view.endswith("_INV_") or any(
        view.startswith(p.upper()) for p in PLANTS
    ):
        return "device_*"
    elif view == "alerts":
        return "alerts"
    elif view == "map":
        return "map"
    elif view == "sensors":
        return "sensors"
    return "dashboard"


def _pick_intent(from_view: str, to_view: str) -> str:
    """Determine the intent that caused this transition."""
    to_cat = _classify_view(to_view)
    intent_map = {
        "dashboard": "OPEN_DASHBOARD",
        "plant_*": "OPEN_PLANT",
        "device_*": "OPEN_DEVICE",
        "alerts": "OPEN_ALERTS",
        "map": "OPEN_PLANT",
        "inverters": "OPEN_DEVICE",
        "sensors": "OPEN_TELEMETRY",
    }
    if to_view.startswith("diagnose_"):
        return "DIAGNOSE"
    return intent_map.get(to_cat, "UNKNOWN")


def generate_sequence(min_steps: int = 3, max_steps: int = 12) -> list:
    """Generate a single navigation sequence."""
    steps = random.randint(min_steps, max_steps)
    current_view = "dashboard"
    sequence = []
    ts = datetime(2026, 3, 1, random.randint(6, 18), random.randint(0, 59))

    for i in range(steps):
        # Get transitions for current view category
        view_cat = _classify_view(current_view)
        transitions = TRANSITIONS.get(view_cat, DEFAULT_TRANSITION)

        # Sample next view
        views = list(transitions.keys())
        probs = list(transitions.values())
        total = sum(probs)
        probs = [p / total for p in probs]

        next_pattern = random.choices(views, weights=probs, k=1)[0]
        next_view = _resolve_view(next_pattern)
        intent = _pick_intent(current_view, next_view)

        # Add noise: occasionally show/accept suggestion
        suggestion_shown = random.random() < 0.6
        suggestion_accepted = suggestion_shown and random.random() < 0.45

        sequence.append({
            "step": i + 1,
            "from_view": current_view,
            "to_view": next_view,
            "intent": intent,
            "ts": ts.isoformat(),
            "hour_of_day": ts.hour,
            "day_of_week": ts.weekday(),
            "suggestion_shown": suggestion_shown,
            "suggestion_accepted": suggestion_accepted,
        })

        current_view = next_view
        ts += timedelta(seconds=random.randint(5, 120))

    return sequence


def generate_dataset(num_sequences: int = 20000, output_path: str = None) -> list:
    """Generate the full synthetic dataset."""
    if output_path is None:
        output_path = str(
            Path(__file__).parent.parent / "data" / "nav_sequences.jsonl"
        )

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)

    all_events = []
    with open(output_path, "w") as f:
        for seq_id in range(num_sequences):
            sequence = generate_sequence()
            record = {
                "sequence_id": seq_id,
                "session_id": f"syn_session_{seq_id}",
                "events": sequence,
            }
            f.write(json.dumps(record) + "\n")
            all_events.extend(sequence)

    print(f"✅ Generated {num_sequences} sequences → {output_path}")
    print(f"   Total navigation events: {len(all_events)}")
    return all_events


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate synthetic navigation sequences")
    parser.add_argument("--sequences", type=int, default=20000, help="Number of sequences")
    parser.add_argument("--output", type=str, default=None, help="Output path")
    args = parser.parse_args()
    generate_dataset(args.sequences, args.output)
