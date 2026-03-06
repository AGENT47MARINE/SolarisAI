"""
STT Service for SolarisAI.
Currently provides a stub to support voice logic while browser-side STT is the primary provider.
"""

import structlog

logger = structlog.get_logger()

async def transcribe(audio_bytes: bytes) -> str:
    """
    Stub for server-side STT.
    Returns empty string as browser-side STT is preferred for the hackathon.
    """
    logger.info("stt_service.transcribe_stub_called", size=len(audio_bytes))
    return ""
