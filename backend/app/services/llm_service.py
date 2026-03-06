"""
LLM intent parser for voice commands.
Uses Anthropic Claude API when available, falls back to regex-based parsing.
"""

import json
import re
from typing import Optional

from app.core.config import settings

# ── Navigation action types ────────────────────────────────────────────────────

INTENTS = [
    "OPEN_DASHBOARD",
    "OPEN_PLANT",
    "OPEN_DEVICE",
    "OPEN_ALERTS",
    "OPEN_REPORT",
    "OPEN_TELEMETRY",
    "DIAGNOSE",
    "GET_SUMMARY",
    "UNKNOWN",
]


# ── LLM-based intent parsing (Claude) ─────────────────────────────────────────

SYSTEM_PROMPT = """You are a navigation assistant for a solar plant monitoring dashboard.

Dashboard views: dashboard, plants, plant_{id}, device_{id}, inverters, sensors, alerts, reports, map.
Current session context: {context_json}
Available entities: {entity_list_json}

Given the user's voice command, return ONLY valid JSON (no markdown, no explanation):
{{
  "intent": "<OPEN_DASHBOARD|OPEN_PLANT|OPEN_DEVICE|OPEN_ALERTS|OPEN_REPORT|OPEN_TELEMETRY|DIAGNOSE|GET_SUMMARY|UNKNOWN>",
  "entities": {{"device_id": null, "plant_id": null, "device_name": null, "plant_name": null, "time_range": null, "severity": null}},
  "navigation_action": {{"action": "<intent>", "params": {{}}}},
  "confidence": 0.0
}}

Rules:
- Match device/plant names fuzzy to the entity list
- For "inverter 3" style commands, find the matching device
- For "show alerts" without a target, use OPEN_ALERTS with no params
- Confidence should be between 0.0 and 1.0
"""


async def parse_intent_llm(
    transcript: str,
    context: dict,
    entity_list: list,
) -> dict:
    """Parse intent using Anthropic Claude API."""
    try:
        import anthropic

        client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
        response = await client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=300,
            system=SYSTEM_PROMPT.format(
                context_json=json.dumps(context, default=str),
                entity_list_json=json.dumps(entity_list),
            ),
            messages=[{"role": "user", "content": transcript}],
        )
        result = json.loads(response.content[0].text)
        return result
    except Exception as e:
        print(f"⚠️  LLM parsing failed: {e}")
        return None


# ── Regex-based fallback parser ────────────────────────────────────────────────

# Known device/plant mappings from the existing seed data
KNOWN_DEVICES = {
    "inverter 1": {"id": "BHADLA_INV_01", "type": "inverter", "name": "Inverter 1 - Bhadla"},
    "inverter 2": {"id": "KAMUTHI_INV_05", "type": "inverter", "name": "Inverter 5 - Kamuthi"},
    "inverter 3": {"id": "REWA_INV_02", "type": "inverter", "name": "Inverter 2 - Rewa"},
    "inverter 4": {"id": "CHARANKA_INV_03", "type": "inverter", "name": "Inverter 3 - Charanka"},
    "inverter 5": {"id": "ANANTHAPURAMU_INV_04", "type": "inverter", "name": "Inverter 4 - Ananthapuramu"},
    "inverter 6": {"id": "PAVAGADA_INV_02", "type": "inverter", "name": "Inverter 2 - Pavagada"},
    "bhadla": {"id": "BHADLA_INV_01", "type": "inverter", "name": "Inverter 1 - Bhadla"},
    "kamuthi": {"id": "KAMUTHI_INV_05", "type": "inverter", "name": "Inverter 5 - Kamuthi"},
    "rewa": {"id": "REWA_INV_02", "type": "inverter", "name": "Inverter 2 - Rewa"},
    "charanka": {"id": "CHARANKA_INV_03", "type": "inverter", "name": "Inverter 3 - Charanka"},
    "ananthapuramu": {"id": "ANANTHAPURAMU_INV_04", "type": "inverter", "name": "Inverter 4 - Ananthapuramu"},
    "pavagada": {"id": "PAVAGADA_INV_02", "type": "inverter", "name": "Inverter 2 - Pavagada"},
}

KNOWN_PLANTS = {
    "bhadla": {"id": "bhadla", "name": "Bhadla Solar Park"},
    "kamuthi": {"id": "kamuthi", "name": "Kamuthi Solar Farm"},
    "rewa": {"id": "rewa", "name": "Rewa Ultra Mega Solar"},
    "charanka": {"id": "charanka", "name": "Charanka Solar Park"},
    "ananthapuramu": {"id": "ananthapuramu", "name": "Ananthapuramu Ultra Mega Solar"},
    "pavagada": {"id": "pavagada", "name": "Pavagada Solar Park"},
}


def parse_intent_regex(
    transcript: str,
    context: dict,
    entity_list: list,
) -> dict:
    """Rule-based intent parser as fallback for when LLM is unavailable."""
    text = transcript.lower().strip()

    # ── DIAGNOSE ──
    if any(w in text for w in ["diagnose", "diagnostic", "diagnosis", "fault", "health check"]):
        device = _find_device(text)
        if device:
            return _make_result("DIAGNOSE", {
                "device_id": device["id"],
                "device_type": device["type"],
                "device_name": device["name"],
            }, 0.92)
        return _make_result("DIAGNOSE", {}, 0.70)

    # ── OPEN_ALERTS ──
    if any(w in text for w in ["alert", "alerts", "warning", "warnings", "critical"]):
        severity = None
        if "critical" in text:
            severity = "critical"
        elif "warning" in text:
            severity = "warning"
        plant = _find_plant(text)
        params = {}
        if plant:
            params["plant_id"] = plant["id"]
        if severity:
            params["severity"] = severity
        return _make_result("OPEN_ALERTS", params, 0.90)

    # ── OPEN_DEVICE / OPEN_TELEMETRY ──
    if any(w in text for w in ["inverter", "device", "sensor"]):
        device = _find_device(text)
        if "telemetry" in text or "performance" in text or "output" in text or "trend" in text:
            if device:
                return _make_result("OPEN_TELEMETRY", {
                    "device_id": device["id"],
                    "device_type": device["type"],
                    "device_name": device["name"],
                }, 0.88)
        if device:
            return _make_result("OPEN_DEVICE", {
                "device_id": device["id"],
                "device_type": device["type"],
                "device_name": device["name"],
            }, 0.92)
        # Generic "show inverters"
        if "inverter" in text:
            return _make_result("OPEN_DEVICE", {"route": "inverters"}, 0.85)
        if "sensor" in text:
            return _make_result("OPEN_DEVICE", {"route": "sensors"}, 0.85)

    # ── OPEN_PLANT / MAP ──
    if any(w in text for w in ["plant", "plants", "map", "solar park", "solar farm"]):
        plant = _find_plant(text)
        if plant:
            return _make_result("OPEN_PLANT", {
                "plant_id": plant["id"],
                "plant_name": plant["name"],
            }, 0.90)
        if "map" in text:
            return _make_result("OPEN_PLANT", {"route": "map"}, 0.88)
        return _make_result("OPEN_PLANT", {"route": "plants"}, 0.85)

    # ── OPEN_REPORT ──
    if any(w in text for w in ["report", "reports", "summary", "generation"]):
        return _make_result("GET_SUMMARY", {}, 0.80)

    # ── OPEN_DASHBOARD / HOME ──
    if any(w in text for w in ["dashboard", "home", "main", "overview"]):
        return _make_result("OPEN_DASHBOARD", {}, 0.95)

    # ── OPEN_TELEMETRY (general) ──
    if any(w in text for w in ["telemetry", "readings", "temperature", "voltage", "current", "power"]):
        device = _find_device(text)
        params = {}
        if device:
            params = {"device_id": device["id"], "device_type": device["type"]}
        return _make_result("OPEN_TELEMETRY", params, 0.80)

    # ── UNKNOWN ──
    return _make_result("UNKNOWN", {}, 0.30)


def _find_device(text: str) -> Optional[dict]:
    """Try to find a device reference in the text."""
    for key, device in KNOWN_DEVICES.items():
        if key in text:
            return device
    # Try "inverter N" pattern
    match = re.search(r"inverter\s*(\d+)", text)
    if match:
        num = match.group(1)
        key = f"inverter {num}"
        if key in KNOWN_DEVICES:
            return KNOWN_DEVICES[key]
    return None


def _find_plant(text: str) -> Optional[dict]:
    """Try to find a plant reference in the text."""
    for key, plant in KNOWN_PLANTS.items():
        if key in text:
            return plant
    return None


def _make_result(intent: str, params: dict, confidence: float) -> dict:
    return {
        "intent": intent,
        "entities": params,
        "navigation_action": {
            "action": intent,
            "params": params,
        },
        "confidence": confidence,
    }


# ── Main entry point ──────────────────────────────────────────────────────────

async def parse_intent(
    transcript: str,
    context: dict,
    entity_list: list,
) -> dict:
    """
    Parse user intent from transcript.
    Uses Claude API if ANTHROPIC_API_KEY is set, otherwise falls back to regex.
    """
    # Try LLM first if API key is available
    if settings.anthropic_api_key:
        result = await parse_intent_llm(transcript, context, entity_list)
        if result:
            return result

    # Fallback to regex-based parser
    return parse_intent_regex(transcript, context, entity_list)
