"""
WebSocket endpoint for streaming voice sessions.
WS /api/ws/voice/{session_id}
"""

import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.session_store import session_store
from app.services.llm_service import parse_intent

router = APIRouter(tags=["Voice WebSocket"])


@router.websocket("/api/ws/voice/{session_id}")
async def voice_websocket(websocket: WebSocket, session_id: str):
    """
    Streaming voice session via WebSocket.
    Client sends text commands as JSON, server returns navigation actions.
    
    Client → {"type": "text_command", "text": "show me inverter 3", "current_view": "dashboard"}
    Server → {"type": "final", "navigation_action": {...}, "suggestions": [...]}
    """
    await websocket.accept()

    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            msg_type = msg.get("type", "text_command")

            if msg_type == "text_command":
                text = msg.get("text", "")
                current_view = msg.get("current_view", "dashboard")

                if not text:
                    await websocket.send_json({
                        "type": "error",
                        "detail": "Empty command",
                    })
                    continue

                # Get context
                context = await session_store.get_context(session_id)
                context["current_view"] = current_view

                # Send partial transcript acknowledgement
                await websocket.send_json({
                    "type": "partial_transcript",
                    "text": text,
                })

                # Parse intent
                entity_list = [
                    {"type": "plant", "id": "bhadla", "name": "Bhadla Solar Park"},
                    {"type": "plant", "id": "kamuthi", "name": "Kamuthi Solar Farm"},
                    {"type": "device", "id": "BHADLA_INV_01", "name": "Inverter 1"},
                ]
                result = await parse_intent(text, context, entity_list)

                # Update session
                nav = result.get("navigation_action", {})
                await session_store.append_nav_event(
                    session_id=session_id,
                    from_view=current_view,
                    to_view=nav.get("action", "UNKNOWN"),
                    intent=result.get("intent", "UNKNOWN"),
                    transcript=text,
                )

                # Send final result
                await websocket.send_json({
                    "type": "final",
                    "transcript": text,
                    "intent": result.get("intent", "UNKNOWN"),
                    "confidence": result.get("confidence", 0.0),
                    "navigation_action": nav,
                    "suggestions": [],
                })

            elif msg_type == "ping":
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_json({
                "type": "error",
                "detail": str(e),
            })
        except Exception:
            pass
