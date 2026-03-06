"""
Prometheus metrics for SolarisAI observability.
"""

try:
    from prometheus_client import Counter, Histogram, Gauge

    voice_commands_total = Counter(
        "voice_commands_total",
        "Total voice commands processed",
        ["intent", "status"],
    )

    voice_latency_ms = Histogram(
        "voice_latency_ms",
        "End-to-end voice command latency in milliseconds",
        buckets=[100, 250, 500, 1000, 2000, 5000],
    )

    stt_latency_ms = Histogram(
        "stt_latency_ms",
        "STT transcription latency in milliseconds",
    )

    llm_latency_ms = Histogram(
        "llm_latency_ms",
        "LLM intent parsing latency in milliseconds",
    )

    nav_suggestion_accepts = Counter(
        "nav_suggestion_accepts_total",
        "Total navigation suggestions accepted by users",
    )

    fault_diagnoses_total = Counter(
        "fault_diagnoses_total",
        "Total fault diagnoses performed",
        ["fault_class"],
    )

    model_drift_psi = Gauge(
        "model_drift_psi",
        "Population Stability Index for model drift",
        ["model"],
    )

    METRICS_AVAILABLE = True

except ImportError:
    # prometheus_client not installed — metrics are no-ops
    METRICS_AVAILABLE = False

    class _NoOp:
        def labels(self, *args, **kwargs):
            return self
        def inc(self, *args, **kwargs):
            pass
        def observe(self, *args, **kwargs):
            pass
        def set(self, *args, **kwargs):
            pass

    voice_commands_total = _NoOp()
    voice_latency_ms = _NoOp()
    stt_latency_ms = _NoOp()
    llm_latency_ms = _NoOp()
    nav_suggestion_accepts = _NoOp()
    fault_diagnoses_total = _NoOp()
    model_drift_psi = _NoOp()
