"""
Voice command API endpoints.

POST /api/voice/command — main voice command endpoint
GET  /api/voice/session/{session_id} — retrieve session history
DELETE /api/voice/session/{session_id} — clear session
"""

import time
import uuid
from typing import Optional, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.llm_service import parse_intent
from app.services.session_store import session_store

router = APIRouter(prefix="/api/voice", tags=["Voice AI"])


# ── Pydantic request/response models ──────────────────────────────────────────

class PlantContext(BaseModel):
    plant_id: Optional[str] = None
    plant_name: Optional[str] = None


class VoiceCommandRequest(BaseModel):
    audio_b64: Optional[str] = None
    text_input: Optional[str] = None
    session_id: Optional[str] = None
    current_view: str = "dashboard"
    plant_context: Optional[PlantContext] = None


class NavigationAction(BaseModel):
    action: str
    params: dict = {}


class Suggestion(BaseModel):
    view: str
    label: str
    probability: float


class VoiceCommandResponse(BaseModel):
    session_id: str
    transcript: str
    intent: str
    confidence: float
    navigation_action: NavigationAction
    entity_preview: Optional[dict] = None
    suggestions: List[Suggestion] = []
    latency_ms: int = 0


class SessionResponse(BaseModel):
    session_id: str
    created_at: str
    history: list
    current_view: str


# ── Route-mapping for navigation actions ──────────────────────────────────────

def _intent_to_route(intent: str, params: dict) -> str:
    """Map an intent + params to a frontend route for suggestions."""
    route_map = {
        "OPEN_DASHBOARD": "/dashboard",
        "OPEN_PLANT": "/plants",
        "OPEN_ALERTS": "/alerts",
        "OPEN_REPORT": "/dashboard",
        "GET_SUMMARY": "/dashboard",
    }

    if intent == "OPEN_DEVICE" or intent == "OPEN_TELEMETRY":
        device_id = params.get("device_id")
        route = params.get("route")
        if route:
            return f"/{route}"
        if device_id:
            return f"/inverters/{device_id}"
        return "/inverters"

    if intent == "DIAGNOSE":
        device_id = params.get("device_id")
        if device_id:
            return f"/inverters/{device_id}"
        return "/inverters"

    if intent == "OPEN_PLANT":
        route = params.get("route")
        if route:
            return f"/{route}"
        plant_id = params.get("plant_id")
        if plant_id:
            return f"/plants/{plant_id}"
        return "/plants"

    return route_map.get(intent, "/dashboard")


def _generate_suggestions(intent: str, params: dict, current_view: str) -> List[Suggestion]:
    """Generate contextual navigation suggestions based on current intent."""
    suggestions = []

    if intent == "OPEN_DEVICE":
        device_id = params.get("device_id", "")
        device_name = params.get("device_name", "this device")
        suggestions.append(Suggestion(
            view=f"alerts_device_{device_id}",
            label=f"View recent alerts for {device_name}",
            probability=0.72,
        ))
        suggestions.append(Suggestion(
            view=f"diagnose_{device_id}",
            label=f"Run AI diagnostic on {device_name}",
            probability=0.65,
        ))

    elif intent == "OPEN_ALERTS":
        suggestions.append(Suggestion(
            view="dashboard",
            label="Return to main dashboard",
            probability=0.60,
        ))
        suggestions.append(Suggestion(
            view="inverters",
            label="View all inverters",
            probability=0.55,
        ))

    elif intent == "OPEN_DASHBOARD":
        suggestions.append(Suggestion(
            view="alerts",
            label="Check system alerts",
            probability=0.68,
        ))
        suggestions.append(Suggestion(
            view="map",
            label="View plant locations on map",
            probability=0.55,
        ))

    elif intent == "DIAGNOSE":
        device_id = params.get("device_id", "")
        suggestions.append(Suggestion(
            view=f"alerts_device_{device_id}",
            label="View alert history for this device",
            probability=0.70,
        ))
        suggestions.append(Suggestion(
            view="dashboard",
            label="Return to dashboard overview",
            probability=0.50,
        ))

    elif intent == "OPEN_PLANT":
        suggestions.append(Suggestion(
            view="inverters",
            label="View inverters for this plant",
            probability=0.72,
        ))
        suggestions.append(Suggestion(
            view="alerts",
            label="Check plant alerts",
            probability=0.58,
        ))

    # Add a general suggestion if we have less than 2
    if len(suggestions) < 2:
        suggestions.append(Suggestion(
            view="dashboard",
            label="Go to main dashboard",
            probability=0.40,
        ))

    return suggestions[:3]


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/command", response_model=VoiceCommandResponse)
async def voice_command(req: VoiceCommandRequest):
    """
    Main voice command endpoint.
    Accepts audio (base64) or text, returns navigation action + suggestions.
    """
    start = time.time()

    # Validate input
    if not req.audio_b64 and not req.text_input:
        raise HTTPException(status_code=400, detail="Provide audio_b64 or text_input")

    # Generate session ID if not provided
    session_id = req.session_id or str(uuid.uuid4())

    # Get session context
    context = await session_store.get_context(session_id)
    context["current_view"] = req.current_view

    # Step 1: Get transcript
    if req.text_input:
        transcript = req.text_input
    else:
        # STT from audio — for now we use browser-side STT,
        # so audio_b64 commands would need server-side Whisper
        try:
            from app.services.stt_service import transcribe
            import base64
            audio_bytes = base64.b64decode(req.audio_b64)
            transcript = await transcribe(audio_bytes)
        except Exception as e:
            # Fallback: try to decode as text
            transcript = req.audio_b64[:200] if req.audio_b64 else ""
            print(f"⚠️  STT failed: {e}")

    if not transcript:
        raise HTTPException(status_code=422, detail="Speech recognition failed")

    # Step 2: Parse intent
    entity_list = _get_entity_list()
    result = await parse_intent(transcript, context, entity_list)

    intent = result.get("intent", "UNKNOWN")
    confidence = result.get("confidence", 0.0)
    nav_action = result.get("navigation_action", {"action": "UNKNOWN", "params": {}})

    # Step 3: Generate suggestions
    suggestions = _generate_suggestions(
        intent, nav_action.get("params", {}), req.current_view
    )

    # Step 4: Update session
    target_view = _intent_to_route(intent, nav_action.get("params", {}))
    await session_store.append_nav_event(
        session_id=session_id,
        from_view=req.current_view,
        to_view=target_view,
        intent=intent,
        transcript=transcript,
    )

    latency_ms = int((time.time() - start) * 1000)

    return VoiceCommandResponse(
        session_id=session_id,
        transcript=transcript,
        intent=intent,
        confidence=confidence,
        navigation_action=NavigationAction(
            action=nav_action.get("action", intent),
            params=nav_action.get("params", {}),
        ),
        suggestions=suggestions,
        latency_ms=latency_ms,
    )


@router.get("/session/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str):
    """Retrieve session history."""
    info = await session_store.get_session_info(session_id)
    if not info:
        raise HTTPException(status_code=404, detail="Session not found")
    return SessionResponse(**info)


@router.delete("/session/{session_id}", status_code=204)
async def delete_session(session_id: str):
    """Clear session."""
    await session_store.clear_session(session_id)


def _get_entity_list() -> list:
    """Return a list of known entities for the LLM context."""
    return [
        {"type": "plant", "id": "bhadla", "name": "Bhadla Solar Park"},
        {"type": "plant", "id": "kamuthi", "name": "Kamuthi Solar Farm"},
        {"type": "plant", "id": "rewa", "name": "Rewa Ultra Mega Solar"},
        {"type": "plant", "id": "charanka", "name": "Charanka Solar Park"},
        {"type": "plant", "id": "ananthapuramu", "name": "Ananthapuramu Ultra Mega Solar"},
        {"type": "plant", "id": "pavagada", "name": "Pavagada Solar Park"},
        {"type": "device", "id": "BHADLA_INV_01", "name": "Inverter 1 - Bhadla", "device_type": "inverter"},
        {"type": "device", "id": "KAMUTHI_INV_05", "name": "Inverter 5 - Kamuthi", "device_type": "inverter"},
        {"type": "device", "id": "REWA_INV_02", "name": "Inverter 2 - Rewa", "device_type": "inverter"},
        {"type": "device", "id": "CHARANKA_INV_03", "name": "Inverter 3 - Charanka", "device_type": "inverter"},
        {"type": "device", "id": "ANANTHAPURAMU_INV_04", "name": "Inverter 4 - Ananthapuramu", "device_type": "inverter"},
        {"type": "device", "id": "PAVAGADA_INV_02", "name": "Inverter 2 - Pavagada", "device_type": "inverter"},
    ]
