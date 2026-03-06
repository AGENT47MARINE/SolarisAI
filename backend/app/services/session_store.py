"""
Session context store with in-memory fallback.
Stores per-session navigation context for the voice AI pipeline.
"""

import json
import time
from typing import Optional, Dict, List
from datetime import datetime


class SessionStore:
    """
    In-memory session store. Redis support can be added later
    by subclassing and overriding get/set methods.
    """

    def __init__(self):
        self._store: Dict[str, dict] = {}
        self._ttl = 1800  # 30 minutes

    async def get_context(self, session_id: str) -> dict:
        """Get session context. Returns empty context if not found."""
        entry = self._store.get(session_id)
        if entry is None:
            return self._empty_context(session_id)

        # Check TTL
        if time.time() - entry.get("_last_access", 0) > self._ttl:
            del self._store[session_id]
            return self._empty_context(session_id)

        entry["_last_access"] = time.time()
        return entry

    async def set_context(self, session_id: str, context: dict):
        """Store/update session context."""
        context["_last_access"] = time.time()
        self._store[session_id] = context

    async def append_nav_event(
        self,
        session_id: str,
        from_view: str,
        to_view: str,
        intent: str,
        transcript: str = "",
    ):
        """Append a navigation event to the session history."""
        ctx = await self.get_context(session_id)
        history = ctx.get("history", [])
        history.append({
            "step": len(history) + 1,
            "from_view": from_view,
            "to_view": to_view,
            "intent": intent,
            "transcript": transcript,
            "ts": datetime.utcnow().isoformat(),
        })
        # Keep last 10 events
        ctx["history"] = history[-10:]
        ctx["current_view"] = to_view
        await self.set_context(session_id, ctx)

    async def clear_session(self, session_id: str):
        """Delete a session."""
        self._store.pop(session_id, None)

    async def get_session_info(self, session_id: str) -> Optional[dict]:
        """Get session info for the API response."""
        ctx = await self.get_context(session_id)
        if not ctx.get("history"):
            return None
        return {
            "session_id": session_id,
            "created_at": ctx.get("created_at", ""),
            "history": ctx.get("history", []),
            "current_view": ctx.get("current_view", "dashboard"),
        }

    def _empty_context(self, session_id: str) -> dict:
        return {
            "session_id": session_id,
            "current_view": "dashboard",
            "entity_ids": [],
            "history": [],
            "created_at": datetime.utcnow().isoformat(),
            "_last_access": time.time(),
        }


# Singleton
session_store = SessionStore()
