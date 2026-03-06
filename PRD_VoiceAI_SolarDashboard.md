# Voice AI Solar Dashboard — Product Requirements Document (PRD)

**Project:** SolarisAI — Voice-Controlled Intelligent Navigation for IoT Solar Monitoring  
**Owner:** DyuLabs / Hackathon 2026  
**Version:** 1.0  
**Target Implementer:** Antigravity Claude Opus 4.6  
**Repo:** https://github.com/AGENT47MARINE/SolarisAI  
**Status:** Implementation-Ready Draft  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)  
2. [Problem Statement & Goals](#2-problem-statement--goals)  
3. [Existing Repo Audit](#3-existing-repo-audit)  
4. [System Architecture](#4-system-architecture)  
5. [Functional Requirements](#5-functional-requirements)  
6. [API Specifications](#6-api-specifications)  
7. [Database Schema](#7-database-schema)  
8. [ML & MLE Pipeline](#8-ml--mle-pipeline)  
9. [Message Flows](#9-message-flows)  
10. [Infrastructure & DevOps](#10-infrastructure--devops)  
11. [Security & Compliance](#11-security--compliance)  
12. [CI/CD Pipeline](#12-cicd-pipeline)  
13. [Monitoring & Observability](#13-monitoring--observability)  
14. [Rollout & Rollback Plan](#14-rollout--rollback-plan)  
15. [Testing & Acceptance Criteria](#15-testing--acceptance-criteria)  
16. [Risk Register](#16-risk-register)  
17. [Milestone Plan](#17-milestone-plan)  
18. [Implementation Checklist](#18-implementation-checklist)

---

## 1. Executive Summary

SolarisAI adds a **voice-controlled navigation layer** to an existing solar plant IoT monitoring dashboard. Field technicians can speak commands like *"Show me inverter 3 performance"* and the system:

1. Transcribes speech to text (STT).
2. Parses user intent and current dashboard context using an LLM.
3. Returns a structured navigation action (which screen/view to open).
4. Suggests the next likely navigation step based on a self-trained context-routing model.

The backend is a **FastAPI** service. The new additions are a **Voice/NLP API layer**, a **context-routing ML model** (navigation suggestion), and a **session/context state store**. The existing XGBoost fault-diagnosis model is retained and extended.

---

## 2. Problem Statement & Goals

### Problem
Solar monitoring dashboards are multi-screen, data-dense environments. Field technicians need to:
- Navigate hands-free during physical inspections.
- Surface critical alerts without screen hunting.
- Get proactive next-step suggestions based on what they are currently viewing.

### Goals

| # | Goal | Metric |
|---|------|--------|
| G1 | Hands-free voice navigation | Navigate to target view in ≤ 2 utterances |
| G2 | High STT accuracy | WER ≤ 10% on solar-domain vocabulary |
| G3 | Correct intent resolution | Intent accuracy ≥ 90% on held-out eval set |
| G4 | Context-aware suggestions | Next-view suggestion precision@1 ≥ 70% |
| G5 | Low latency end-to-end | Full voice→navigation response ≤ 2 s (p95) |
| G6 | Fault diagnosis model | Multi-class accuracy ≥ 92% (existing target) |

---

## 3. Existing Repo Audit

### 3.1 Directory Structure

```
SolarisAI/
├── backend/                    # FastAPI application
│   ├── main.py                 # App entrypoint; seeds DB; starts simulator
│   ├── requirements.txt        # Python deps
│   └── app/
│       ├── api/                # Route handlers
│       │   ├── dashboard.py    # GET /api/dashboard/metrics
│       │   ├── plants.py       # GET /api/plants, /api/plants/{id}
│       │   ├── devices.py      # GET /api/devices/{id}/telemetry
│       │   └── alerts.py       # GET/PATCH /api/alerts
│       ├── models/             # SQLAlchemy ORM models
│       ├── services/
│       │   └── simulator.py    # Async telemetry generator (MQTT-swap-ready)
│       └── ml/
│           ├── train.py        # XGBoost training script
│           └── evaluate.py     # Evaluation script
├── src/                        # React 19 + Vite frontend
│   ├── components/             # UI components
│   ├── pages/                  # Dashboard, Plant, Device, Alert views
│   └── main.jsx
├── public/                     # Static assets
├── index.html
├── package.json
├── vite.config.js
├── eslint.config.js
├── PRD.md                      # Earlier draft PRD
└── README.md
```

### 3.2 Existing Components Summary

| File/Dir | Role | PRD Task Mapping |
|----------|------|-----------------|
| `backend/app/api/dashboard.py` | Aggregated KPI endpoint | Extend with voice session context |
| `backend/app/api/plants.py` | Plant CRUD | Feed entity list to NLP intent parser |
| `backend/app/api/devices.py` | Telemetry time-series | Provide device context for suggestion model |
| `backend/app/api/alerts.py` | Alert management | Voice trigger: "show me alerts for plant 1" |
| `backend/app/services/simulator.py` | Synthetic IoT data | Swap to real MQTT; keep interface unchanged |
| `backend/app/ml/train.py` | XGBoost fault classifier | Extend; add context-routing model training |
| `backend/app/ml/evaluate.py` | Evaluation harness | Add intent + suggestion metrics |
| `src/` | React frontend | Add VoiceAssistant chatbot widget |

### 3.3 Missing Components (Prioritized)

| Priority | Missing File/Feature | Why Needed |
|----------|----------------------|-----------|
| P0 | `backend/app/api/voice.py` | STT + intent parsing endpoint |
| P0 | `backend/app/api/auth.py` | JWT-based auth for all routes |
| P0 | `backend/app/services/stt_service.py` | Whisper/cloud STT abstraction |
| P0 | `backend/app/services/llm_service.py` | LLM intent & navigation resolution |
| P0 | `backend/app/services/session_store.py` | Redis-backed per-session context |
| P1 | `backend/app/ml/nav_model/train.py` | Context-routing navigation suggestion model |
| P1 | `backend/app/ml/nav_model/predict.py` | Inference for next-view suggestions |
| P1 | `backend/app/ml/nav_model/data_gen.py` | Synthetic navigation sequence generator |
| P1 | `backend/app/core/config.py` | Centralised settings (pydantic BaseSettings) |
| P1 | `backend/app/core/security.py` | JWT utilities |
| P2 | `Dockerfile` | Container image for backend |
| P2 | `docker-compose.yml` | Local dev orchestration |
| P2 | `.github/workflows/ci.yml` | GitHub Actions CI |
| P2 | `k8s/` | Kubernetes manifests |
| P3 | `mlflow/` | Experiment tracking setup |
| P3 | `tests/` | Unit + integration tests |
| P3 | `backend/app/api/ws.py` | WebSocket for streaming voice session |

### 3.4 Validation Commands (Run Before Implementing)

```bash
# 1. Clone and setup
git clone https://github.com/AGENT47MARINE/SolarisAI.git && cd SolarisAI

# 2. Backend smoke test
cd backend
pip install -r requirements.txt --break-system-packages
python -m app.ml.train          # Expect: model saved to app/ml/artifacts/
python -m app.ml.evaluate       # Expect: accuracy ~92–95%
uvicorn main:app --reload --port 8000
curl http://localhost:8000/api/dashboard/metrics   # Expect 200 JSON

# 3. Frontend smoke test
cd .. && npm install && npm run dev
# Navigate to http://localhost:5173 — expect solar dashboard

# 4. Run existing tests (if any)
cd backend && pytest tests/ -v 2>/dev/null || echo "No tests yet"
```

---

## 4. System Architecture

### 4.1 High-Level Architecture

```mermaid
flowchart TD
    subgraph Client["Mobile/Web Client (Flutter / React)"]
        MIC[Microphone / Text Input]
        UI[Dashboard UI]
        VAW[VoiceAssistant Widget]
    end

    subgraph Gateway["API Gateway / Nginx"]
        AUTH[JWT Auth Middleware]
        RL[Rate Limiter]
    end

    subgraph Backend["FastAPI Backend :8000"]
        VOICE_API[POST /api/voice/command]
        WS_API[WS /api/ws/voice]
        DIAG_API[POST /api/ai/diagnose]
        DATA_API[REST Data APIs]

        STT[STT Service\nWhisper / Cloud]
        LLM[LLM Service\nClaude / OpenAI / local]
        NAV[Nav Suggestion Model\nXGBoost sequence classifier]
        SESSION[Session Store\nRedis]
        FAULT[Fault Diagnosis Model\nXGBoost]
    end

    subgraph Storage
        DB[(PostgreSQL +\nTimescaleDB)]
        CACHE[(Redis)]
        S3[(S3 / MinIO\nModel Artifacts)]
    end

    subgraph Infra
        SIM[Device Simulator /\nMQTT Broker]
        MLFLOW[MLflow\nModel Registry]
        PROM[Prometheus]
        GRAF[Grafana]
    end

    MIC --> VAW --> VOICE_API
    VAW --> WS_API
    VOICE_API --> AUTH --> RL
    VOICE_API --> STT --> LLM --> NAV
    LLM --> SESSION
    NAV --> SESSION
    DIAG_API --> FAULT
    DATA_API --> DB
    DATA_API --> CACHE
    SIM --> DB
    FAULT --> MLFLOW
    NAV --> MLFLOW
    Backend --> PROM --> GRAF
```

### 4.2 Request Flow: Voice Command

```mermaid
sequenceDiagram
    participant C as Client
    participant API as FastAPI
    participant STT as STT Service
    participant LLM as LLM Service
    participant NAV as Nav Model
    participant SESS as Session Store (Redis)
    participant DB

    C->>API: POST /api/voice/command {audio_b64 | text, session_id, current_view}
    API->>SESS: GET session context
    API->>STT: transcribe(audio) → text [skip if text input]
    STT-->>API: transcript
    API->>LLM: parse_intent(transcript, context, entity_list)
    LLM-->>API: {intent, entities, navigation_action}
    API->>DB: Fetch entity data (if needed)
    API->>NAV: predict_next_views(current_view, intent, session_history)
    NAV-->>API: [suggested_view_1, suggested_view_2]
    API->>SESS: PUT updated context
    API-->>C: {transcript, navigation_action, suggestions, entity_data}
```

---

## 5. Functional Requirements

### 5.1 Voice/Text Command Processing

| ID | Requirement |
|----|-------------|
| FR-V1 | Accept audio (base64 WAV/WebM ≤ 10 MB) or plain text as command input |
| FR-V2 | Return transcription text alongside navigation action |
| FR-V3 | Support at minimum these intents: `navigate_to`, `show_alert`, `show_telemetry`, `show_report`, `diagnose_device`, `get_summary` |
| FR-V4 | Maintain a per-session context window of the last 10 navigation steps |
| FR-V5 | Return 1–3 next-view suggestions ranked by probability |
| FR-V6 | Accept text fallback if audio capture fails |
| FR-V7 | Support multi-turn: "Show inverter 3" then "compare with inverter 4" resolves entity from context |

### 5.2 Navigation Actions

| Action | Payload | Target UI Screen |
|--------|---------|-----------------|
| `OPEN_DASHBOARD` | `{}` | Main dashboard |
| `OPEN_PLANT` | `{plant_id}` | Plant overview |
| `OPEN_DEVICE` | `{device_id, device_type}` | Device detail |
| `OPEN_ALERTS` | `{plant_id?, severity?}` | Alert list |
| `OPEN_REPORT` | `{plant_id?, date_range}` | Report view |
| `OPEN_TELEMETRY` | `{device_id, metric?, time_range}` | Telemetry chart |
| `DIAGNOSE` | `{device_id}` | Fault diagnosis result |

### 5.3 Context-Routing Suggestion Model

- Self-trained on logged navigation sequences.
- On first deploy, uses a synthetic dataset (see §8.4).
- Re-trains weekly on real session logs once ≥ 1,000 unique sessions exist.
- Output: ranked list of `(screen_name, probability)` tuples.

### 5.4 Dashboard Data APIs (Existing — Retain & Extend)

All existing endpoints are retained. Extensions:
- Add `session_id` header support to data APIs so the voice layer can attach fetched entity data to session context.
- Add WebSocket endpoint for streaming voice sessions.

### 5.5 Authentication

- All `/api/*` routes require `Authorization: Bearer <JWT>`.
- Public endpoints: `POST /api/auth/token`, `GET /api/health`.
- **Assumption:** Simple username/password auth with role `operator` and `admin`. OAuth2 is out of scope for hackathon.

---

## 6. API Specifications

### 6.1 Auth

#### POST /api/auth/token

```json
// Request
{
  "username": "field_tech_1",
  "password": "s3cur3!"
}

// Response 200
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600
}

// Error 401
{"detail": "Invalid credentials"}
```

### 6.2 Voice Command

#### POST /api/voice/command

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `audio_b64` | string | No* | Base64-encoded WAV/WebM |
| `text_input` | string | No* | Text fallback (one of audio or text required) |
| `session_id` | string | Yes | UUID session identifier |
| `current_view` | string | Yes | Active screen: `dashboard`, `plant_{id}`, `device_{id}`, `alerts`, `report` |
| `plant_context` | object | No | `{plant_id, plant_name}` currently selected |

*One of `audio_b64` or `text_input` must be provided.

```json
// Request
{
  "audio_b64": "UklGRi4AAABXQVZFZm10...",
  "session_id": "sess-uuid-1234",
  "current_view": "plant_7",
  "plant_context": {"plant_id": 7, "plant_name": "Alpha Farm"}
}

// Response 200
{
  "session_id": "sess-uuid-1234",
  "transcript": "Show me inverter 3 performance",
  "intent": "OPEN_DEVICE",
  "confidence": 0.94,
  "navigation_action": {
    "action": "OPEN_DEVICE",
    "params": {
      "device_id": 31,
      "device_type": "inverter",
      "device_name": "Inverter 3"
    }
  },
  "entity_preview": {
    "current_power_kw": 12.4,
    "status": "normal",
    "last_fault": null
  },
  "suggestions": [
    {"view": "alerts_device_31", "label": "View last week alerts for Inverter 3", "probability": 0.72},
    {"view": "telemetry_device_31_7d", "label": "Show 7-day output trend", "probability": 0.55}
  ],
  "latency_ms": 820
}

// Error 400 — missing audio and text
{"detail": "Provide audio_b64 or text_input"}

// Error 422 — STT failure
{"detail": "Speech recognition failed", "code": "STT_ERROR"}

// Error 503 — LLM unavailable
{"detail": "LLM service unavailable", "code": "LLM_UNAVAILABLE"}
```

#### WS /api/ws/voice/{session_id}

Streaming voice session. Client sends binary audio chunks; server streams back partial transcripts and final action.

```
CLIENT → binary frame (audio chunk)
SERVER → {"type": "partial_transcript", "text": "show me inver..."}
SERVER → {"type": "partial_transcript", "text": "show me inverter 3"}
SERVER → {"type": "final", "navigation_action": {...}, "suggestions": [...]}
```

### 6.3 Session

#### GET /api/voice/session/{session_id}

```json
// Response 200
{
  "session_id": "sess-uuid-1234",
  "created_at": "2026-03-06T10:00:00Z",
  "history": [
    {"step": 1, "view": "dashboard", "intent": "OPEN_PLANT", "ts": "..."},
    {"step": 2, "view": "plant_7", "intent": "OPEN_DEVICE", "ts": "..."}
  ],
  "current_view": "device_31"
}
```

#### DELETE /api/voice/session/{session_id}

Clears session. Returns `204 No Content`.

### 6.4 Fault Diagnosis (Existing — Extended)

#### POST /api/ai/diagnose

```json
// Request
{
  "device_id": 31,
  "features": {
    "v_a": 229.1, "v_b": 231.0, "v_c": 228.5,
    "i_a": 14.2, "i_b": 13.9, "i_c": 14.4,
    "active_power_kw": 9.2, "reactive_power_kvar": 1.1,
    "temperature_c": 47.0, "irradiance_wm2": 820.0,
    "frequency_hz": 49.98,
    "voltage_imbalance": 0.011, "current_imbalance": 0.018,
    "power_factor": 0.992, "dc_string_current": 8.3
  }
}

// Response 200
{
  "device_id": 31,
  "diagnosis": "Normal",
  "fault_class": 0,
  "confidence": 0.97,
  "probabilities": {
    "Normal": 0.97, "Overtemperature": 0.01, "GridUnderVoltage": 0.005,
    "GridOverVoltage": 0.005, "IGBTFault": 0.003,
    "DCStringFault": 0.004, "CommTimeout": 0.003, "PhaseImbalance": 0.003
  },
  "model_version": "fault_clf_v2.3",
  "latency_ms": 45
}
```

### 6.5 Existing Data Endpoints (Unchanged)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/dashboard/metrics` | Bearer | Aggregated KPIs |
| GET | `/api/plants` | Bearer | All plants |
| GET | `/api/plants/{id}` | Bearer | Single plant + devices |
| GET | `/api/devices/{id}/telemetry` | Bearer | Time-series (query params: `from`, `to`, `metric`) |
| GET | `/api/alerts` | Bearer | Alert list (`?plant_id=&severity=&resolved=`) |
| PATCH | `/api/alerts/{id}/acknowledge` | Bearer | Acknowledge |
| GET | `/api/health` | None | Liveness check `{"status":"ok"}` |

---

## 7. Database Schema

> **Assumption:** PostgreSQL 15 + TimescaleDB 2.x in production, SQLite for dev.

### 7.1 Existing Tables (Retain)

```sql
-- Plants
CREATE TABLE plants (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    location    VARCHAR(255),
    capacity_kw FLOAT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Devices
CREATE TABLE devices (
    id          SERIAL PRIMARY KEY,
    plant_id    INTEGER REFERENCES plants(id),
    name        VARCHAR(255) NOT NULL,
    type        VARCHAR(50),   -- 'inverter', 'sensor', 'transformer'
    serial_no   VARCHAR(100),
    status      VARCHAR(20) DEFAULT 'normal',
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Telemetry (TimescaleDB hypertable)
CREATE TABLE telemetry (
    time        TIMESTAMPTZ NOT NULL,
    device_id   INTEGER REFERENCES devices(id),
    metric      VARCHAR(100),
    value       FLOAT,
    PRIMARY KEY (time, device_id, metric)
);
SELECT create_hypertable('telemetry', 'time');

-- Alerts
CREATE TABLE alerts (
    id           SERIAL PRIMARY KEY,
    device_id    INTEGER REFERENCES devices(id),
    severity     VARCHAR(20),  -- 'critical', 'warning', 'info'
    message      TEXT,
    resolved     BOOLEAN DEFAULT FALSE,
    acknowledged BOOLEAN DEFAULT FALSE,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    resolved_at  TIMESTAMPTZ
);
```

### 7.2 New Tables

```sql
-- Users / Auth
CREATE TABLE users (
    id           SERIAL PRIMARY KEY,
    username     VARCHAR(100) UNIQUE NOT NULL,
    hashed_pw    VARCHAR(255) NOT NULL,
    role         VARCHAR(20) DEFAULT 'operator',
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Voice Sessions
CREATE TABLE voice_sessions (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      INTEGER REFERENCES users(id),
    started_at   TIMESTAMPTZ DEFAULT NOW(),
    last_active  TIMESTAMPTZ DEFAULT NOW(),
    metadata     JSONB DEFAULT '{}'
);

-- Navigation Events (for training context-routing model)
CREATE TABLE nav_events (
    id           BIGSERIAL PRIMARY KEY,
    session_id   UUID REFERENCES voice_sessions(id),
    ts           TIMESTAMPTZ DEFAULT NOW(),
    from_view    VARCHAR(100),
    to_view      VARCHAR(100),
    intent       VARCHAR(50),
    transcript   TEXT,
    suggestion_shown BOOLEAN DEFAULT FALSE,
    suggestion_accepted BOOLEAN DEFAULT FALSE
);

-- Model Registry (lightweight; MLflow is primary)
CREATE TABLE model_versions (
    id           SERIAL PRIMARY KEY,
    model_name   VARCHAR(100) NOT NULL,
    version      VARCHAR(20) NOT NULL,
    artifact_uri TEXT,
    metrics      JSONB,
    promoted_at  TIMESTAMPTZ,
    is_active    BOOLEAN DEFAULT FALSE
);
```

### 7.3 Redis Key Schema

| Key Pattern | TTL | Value |
|-------------|-----|-------|
| `session:{session_id}:context` | 30 min | JSON: `{current_view, entity_ids, history[-10]}` |
| `session:{session_id}:partial_transcript` | 60 s | string |
| `rate_limit:{user_id}:voice` | 60 s | int (request count) |
| `entity_cache:plant:{id}` | 2 min | JSON plant summary |
| `entity_cache:device:{id}` | 2 min | JSON device summary |

---

## 8. ML & MLE Pipeline

### 8.1 Model Inventory

| Model | Type | Framework | Input | Output |
|-------|------|-----------|-------|--------|
| Fault Classifier | Multi-class (8 classes) | XGBoost | 15 numeric features | fault_class + probabilities |
| Navigation Suggester | Multi-label sequence classifier | XGBoost / LightGBM | session context vector | top-3 next views |
| Intent Parser | Zero-shot / fine-tuned LLM | External API (Claude/OpenAI) or local (Mistral 7B) | text + context | intent + entities JSON |

### 8.2 Fault Diagnosis Model (Existing — Extend)

#### Dataset

- **50,000 physics-informed synthetic samples** (existing).
- **Features (15):** `v_a, v_b, v_c, i_a, i_b, i_c, active_power_kw, reactive_power_kvar, temperature_c, irradiance_wm2, frequency_hz, voltage_imbalance, current_imbalance, power_factor, dc_string_current`
- **Labels (8 classes):** `Normal(0), Overtemperature(1), GridUnderVoltage(2), GridOverVoltage(3), IGBTFault(4), DCStringFault(5), CommTimeout(6), PhaseImbalance(7)`

#### Training Pipeline

```bash
# Generate dataset (if not already present)
cd backend
python -m app.ml.data_gen --samples 50000 --output data/fault_dataset.parquet

# Train
python -m app.ml.train \
  --data data/fault_dataset.parquet \
  --output app/ml/artifacts/fault_clf \
  --n-estimators 300 \
  --max-depth 6 \
  --learning-rate 0.1 \
  --subsample 0.8 \
  --colsample-bytree 0.8 \
  --scale-pos-weight auto \
  --cv-folds 5 \
  --mlflow-run fault_clf_v2

# Evaluate
python -m app.ml.evaluate \
  --model app/ml/artifacts/fault_clf \
  --data data/fault_dataset.parquet \
  --test-split 0.2
```

#### Baseline Hyperparameters (Assumptions — Marked)

```python
# ASSUMPTION: these are production-ready defaults; tune with Optuna if >92% target not met
FAULT_CLF_PARAMS = {
    "n_estimators": 300,
    "max_depth": 6,
    "learning_rate": 0.1,
    "subsample": 0.8,
    "colsample_bytree": 0.8,
    "min_child_weight": 3,
    "gamma": 0.1,
    "reg_alpha": 0.01,
    "reg_lambda": 1.0,
    "objective": "multi:softprob",
    "num_class": 8,
    "eval_metric": "mlogloss",
    "tree_method": "hist",  # GPU: "gpu_hist"
    "seed": 42,
}
```

#### Evaluation Metrics

| Metric | Target |
|--------|--------|
| Overall Accuracy | ≥ 92% |
| Macro F1 | ≥ 0.88 |
| Per-class Recall (critical faults) | ≥ 0.90 |
| Inference latency (CPU) | ≤ 50 ms p99 |

### 8.3 Navigation Suggestion Model

#### Problem Formulation

Given a session history of views `[v1, v2, ..., vk, v_current]` and the last intent, predict the top-3 most likely next views.

#### Dataset Ingestion & Labeling

```bash
# Generate synthetic navigation sequences (Day 1 bootstrap)
python -m app.ml.nav_model.data_gen \
  --sequences 20000 \
  --output data/nav_sequences.jsonl

# After go-live: export from DB
python -m app.ml.nav_model.export_real \
  --db-url $DATABASE_URL \
  --output data/nav_sequences_real.jsonl \
  --min-sessions 1000

# Merge and deduplicate
python -m app.ml.nav_model.merge_data \
  --synthetic data/nav_sequences.jsonl \
  --real data/nav_sequences_real.jsonl \
  --output data/nav_training.jsonl
```

#### Feature Engineering

```python
# Feature vector per nav event (see app/ml/nav_model/features.py)
features = {
    # Current context
    "current_view_enc": LabelEncoder(current_view),        # int
    "current_intent_enc": LabelEncoder(last_intent),       # int
    "session_depth": len(history),                         # int (capped at 10)
    "hour_of_day": ts.hour,                                # int 0–23
    "day_of_week": ts.weekday(),                           # int 0–6
    # Session history (last 3 views, one-hot)
    "prev_view_1_enc": LabelEncoder(history[-1]),
    "prev_view_2_enc": LabelEncoder(history[-2]),
    "prev_view_3_enc": LabelEncoder(history[-3]),
    # Contextual flags
    "has_active_alert": int(bool(active_alerts)),
    "plant_id_enc": LabelEncoder(plant_id),
    "device_type_enc": LabelEncoder(device_type),
}
```

#### Training

```bash
python -m app.ml.nav_model.train \
  --data data/nav_training.jsonl \
  --output app/ml/artifacts/nav_suggester \
  --model-type xgboost \
  --top-k 3 \
  --n-estimators 200 \
  --max-depth 4 \
  --learning-rate 0.05 \
  --mlflow-run nav_suggester_v1
```

#### Baseline Hyperparameters (Assumptions)

```python
NAV_SUGGESTER_PARAMS = {
    "n_estimators": 200,
    "max_depth": 4,
    "learning_rate": 0.05,
    "subsample": 0.8,
    "colsample_bytree": 0.7,
    "objective": "multi:softprob",  # one model per top-k position, or multi-label
    "seed": 42,
}
```

#### Evaluation Metrics

| Metric | Target |
|--------|--------|
| Precision@1 | ≥ 0.70 |
| Precision@3 | ≥ 0.85 |
| MRR (Mean Reciprocal Rank) | ≥ 0.65 |
| Inference latency | ≤ 20 ms p99 |

### 8.4 Synthetic Navigation Sequence Generation

```python
# app/ml/nav_model/data_gen.py — pseudo-logic
VIEWS = ["dashboard", "plant_{1..N}", "device_{1..M}", "alerts", "report"]
TRANSITIONS = {
    "dashboard": ["plant_1", "alerts", "report"],
    "plant_*":   ["device_*", "alerts", "report", "dashboard"],
    "device_*":  ["alerts_device_*", "telemetry_device_*", "diagnose_device_*", "plant_*"],
    "alerts":    ["device_*", "report"],
}
# Sample Markov chains weighted by domain heuristics; add noise
```

### 8.5 Experiment Tracking (MLflow)

```bash
# Start MLflow server
mlflow server \
  --backend-store-uri postgresql://mlflow:mlflow@localhost/mlflow \
  --default-artifact-root s3://solaris-mlflow-artifacts \
  --port 5000

# Log run in training scripts (already in train.py skeleton)
import mlflow
mlflow.set_tracking_uri("http://localhost:5000")
mlflow.set_experiment("fault_classifier")
with mlflow.start_run():
    mlflow.log_params(params)
    mlflow.log_metrics({"accuracy": acc, "macro_f1": f1})
    mlflow.xgboost.log_model(model, "model")
    mlflow.register_model("runs:/.../model", "fault_clf")
```

### 8.6 Model Serving

```python
# backend/app/ml/loader.py
import joblib, mlflow.pyfunc

def load_fault_clf():
    model = mlflow.pyfunc.load_model("models:/fault_clf/Production")
    return model

def load_nav_suggester():
    model = mlflow.pyfunc.load_model("models:/nav_suggester/Production")
    return model
```

Alternatively, load from local artifact path if MLflow server not available (dev mode).

### 8.7 Model Drift Monitoring

```python
# Run nightly via cron / Celery beat
python -m app.ml.drift_monitor \
  --model fault_clf \
  --reference-data data/fault_dataset.parquet \
  --production-data data/recent_diagnoses.parquet \
  --psi-threshold 0.2   # Population Stability Index alert threshold
```

- PSI > 0.2 triggers a Prometheus alert → Slack notification.
- Nav suggester: monitor `precision@1` on accepted suggestions weekly.
- Retrain trigger: accuracy drops > 3% from baseline OR PSI > 0.2.

### 8.8 Reproducibility

```bash
# Pin all deps
pip freeze > requirements-lock.txt

# Seed everything
export PYTHONHASHSEED=42
# training scripts pass seed=42 to all random components

# DVC (optional but recommended for dataset versioning)
dvc init
dvc add data/fault_dataset.parquet
dvc push  # to S3/MinIO
```

### 8.9 LLM Intent Parsing Service

**Assumption:** Use Anthropic Claude API (`claude-haiku-4-5-20251001`) as the default for low-latency intent parsing. Fallback: Mistral 7B via `llama.cpp` for offline/air-gapped deployments.

```python
# backend/app/services/llm_service.py — core logic
SYSTEM_PROMPT = """
You are a navigation assistant for a solar plant monitoring dashboard.
Current dashboard views: dashboard, plant_{id}, device_{id}, alerts, reports.
Current session context: {context_json}
Available entities: {entity_list_json}

Given the user's voice command, return ONLY valid JSON:
{
  "intent": "<OPEN_DASHBOARD|OPEN_PLANT|OPEN_DEVICE|OPEN_ALERTS|OPEN_REPORT|OPEN_TELEMETRY|DIAGNOSE|UNKNOWN>",
  "entities": {"device_id": null, "plant_id": null, "device_name": null, "time_range": null},
  "navigation_action": {"action": "...", "params": {...}},
  "confidence": 0.0
}
"""

async def parse_intent(transcript: str, context: dict, entity_list: list) -> dict:
    response = await anthropic_client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=300,
        system=SYSTEM_PROMPT.format(...),
        messages=[{"role": "user", "content": transcript}]
    )
    return json.loads(response.content[0].text)
```

### 8.10 STT Service

**Assumption:** Use OpenAI Whisper `base.en` model (self-hosted) for offline capability. Cloud fallback: Whisper API or Google Cloud Speech-to-Text.

```python
# backend/app/services/stt_service.py
import whisper

_model = None

def get_model():
    global _model
    if _model is None:
        _model = whisper.load_model("base.en")  # ~140 MB; ASSUMPTION
    return _model

async def transcribe(audio_bytes: bytes) -> str:
    model = get_model()
    # Save to temp WAV, transcribe
    with tempfile.NamedTemporaryFile(suffix=".wav") as f:
        f.write(audio_bytes)
        result = model.transcribe(f.name, language="en", fp16=False)
    return result["text"].strip()
```

---

## 9. Message Flows

### 9.1 Device Telemetry Ingestion

```mermaid
sequenceDiagram
    participant IOT as IoT Device / Simulator
    participant MQTT as MQTT Broker (Mosquitto)
    participant SIM as Simulator Service
    participant DB as PostgreSQL/TimescaleDB
    participant CACHE as Redis

    IOT->>MQTT: Publish telemetry JSON
    MQTT->>SIM: Subscribe callback
    SIM->>DB: INSERT INTO telemetry
    SIM->>CACHE: SET entity_cache:device:{id} TTL=120s
    SIM->>DB: INSERT INTO alerts (if threshold exceeded)
```

### 9.2 Fault Diagnosis Trigger

- Voice command: *"Diagnose inverter 3"* → LLM returns `DIAGNOSE` intent → backend calls `/api/ai/diagnose` internally → returns diagnosis in voice response.

---

## 10. Infrastructure & DevOps

### 10.1 Dockerfile

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system deps for Whisper
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download Whisper model at build time
RUN python -c "import whisper; whisper.load_model('base.en')"

COPY . .

# Train ML models if artifacts not present (dev convenience; prod: mount pre-trained)
# RUN python -m app.ml.train && python -m app.ml.nav_model.train

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
```

```dockerfile
# Dockerfile.frontend
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### 10.2 Docker Compose (Local Dev)

```yaml
# docker-compose.yml
version: "3.9"

services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    environment:
      - DATABASE_URL=postgresql+asyncpg://solaris:solaris@db/solaris
      - REDIS_URL=redis://redis:6379/0
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - JWT_SECRET=${JWT_SECRET:-dev-secret-change-in-prod}
      - MLFLOW_TRACKING_URI=http://mlflow:5000
    depends_on: [db, redis]
    volumes:
      - ./backend/app/ml/artifacts:/app/app/ml/artifacts

  frontend:
    build: .
    ports: ["3000:80"]

  db:
    image: timescale/timescaledb:latest-pg15
    environment:
      - POSTGRES_USER=solaris
      - POSTGRES_PASSWORD=solaris
      - POSTGRES_DB=solaris
    volumes: [pgdata:/var/lib/postgresql/data]
    ports: ["5432:5432"]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  mlflow:
    image: ghcr.io/mlflow/mlflow:latest
    command: >
      mlflow server
      --backend-store-uri sqlite:///mlflow.db
      --default-artifact-root /mlflow/artifacts
      --host 0.0.0.0 --port 5000
    ports: ["5000:5000"]
    volumes: [mlflow_data:/mlflow]

volumes:
  pgdata:
  mlflow_data:
```

```bash
# Run locally
docker compose up --build
# Backend: http://localhost:8000/docs
# Frontend: http://localhost:3000
# MLflow: http://localhost:5000
```

### 10.3 Kubernetes Manifests (Outline)

```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: solaris-backend
spec:
  replicas: 2
  selector:
    matchLabels: {app: solaris-backend}
  template:
    metadata:
      labels: {app: solaris-backend}
    spec:
      containers:
      - name: backend
        image: ghcr.io/agent47marine/solarisai-backend:latest
        ports: [{containerPort: 8000}]
        env:
        - {name: DATABASE_URL, valueFrom: {secretKeyRef: {name: solaris-secrets, key: db-url}}}
        - {name: ANTHROPIC_API_KEY, valueFrom: {secretKeyRef: {name: solaris-secrets, key: anthropic-key}}}
        resources:
          requests: {cpu: "250m", memory: "512Mi"}
          limits:   {cpu: "1000m", memory: "2Gi"}
        livenessProbe:
          httpGet: {path: /api/health, port: 8000}
          initialDelaySeconds: 30
        readinessProbe:
          httpGet: {path: /api/health, port: 8000}
---
apiVersion: v1
kind: Service
metadata: {name: solaris-backend-svc}
spec:
  selector: {app: solaris-backend}
  ports: [{port: 80, targetPort: 8000}]
---
# k8s/ml-training-job.yaml
apiVersion: batch/v1
kind: Job
metadata: {name: solaris-train-fault-clf}
spec:
  template:
    spec:
      containers:
      - name: trainer
        image: ghcr.io/agent47marine/solarisai-backend:latest
        command: ["python", "-m", "app.ml.train"]
        resources:
          requests: {cpu: "2", memory: "4Gi"}
          limits:   {cpu: "4", memory: "8Gi"}
      restartPolicy: Never
```

```bash
# Apply
kubectl apply -f k8s/
kubectl get pods -n solaris

# Scale
kubectl scale deployment solaris-backend --replicas=4

# Rollback
kubectl rollout undo deployment/solaris-backend
```

### 10.4 Hardware Recommendations

| Environment | Component | Recommended |
|-------------|-----------|-------------|
| Dev (local) | Backend + Whisper | MacBook M2 / 16 GB RAM |
| Dev (local) | Training | Same machine; ~5 min for 50K samples |
| Cloud dev | Backend | AWS t3.medium (2 vCPU, 4 GB) — ~$0.04/hr |
| Cloud dev | Training | AWS c5.2xlarge (8 vCPU, 16 GB) — ~$0.34/hr |
| Production | Backend | AWS c5.xlarge × 2 behind ALB |
| Production | Training (GPU) | AWS g4dn.xlarge (T4 GPU) — for larger datasets |
| Production | DB | AWS RDS PostgreSQL r6g.large + TimescaleDB |
| Production | Redis | AWS ElastiCache t3.medium |

---

## 11. Security & Compliance

| Area | Implementation |
|------|---------------|
| Auth | JWT HS256; 1 hr expiry; refresh token 7 days |
| Secrets | Env vars via k8s Secrets / AWS Secrets Manager; never hardcoded |
| HTTPS | TLS terminated at load balancer; internal HTTP |
| Rate Limiting | 60 voice commands / user / minute (Redis counter) |
| Input Validation | Pydantic models on all request bodies; max audio size 10 MB |
| CORS | Restrict to frontend origin in production |
| Audit Logging | All voice commands logged with user_id, session_id, timestamp |
| PII | Transcripts stored encrypted at rest; purge after 90 days |
| LLM Prompt Injection | Sanitise user input; strip special characters before LLM call |
| Dependency Scanning | `pip-audit` + `npm audit` in CI |

---

## 12. CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  backend-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: timescale/timescaledb:latest-pg15
        env: {POSTGRES_PASSWORD: test, POSTGRES_DB: solaris_test}
      redis:
        image: redis:7-alpine
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: {python-version: "3.11"}
      - run: cd backend && pip install -r requirements.txt
      - run: cd backend && python -m app.ml.train --samples 1000 --fast   # smoke train
      - run: cd backend && pytest tests/ -v --cov=app --cov-report=xml
      - uses: codecov/codecov-action@v4

  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: {node-version: "20"}
      - run: npm ci && npm run lint && npm run build

  docker-build:
    needs: [backend-test, frontend-test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/build-push-action@v5
        with:
          context: ./backend
          tags: ghcr.io/agent47marine/solarisai-backend:${{ github.sha }}
          push: ${{ github.ref == 'refs/heads/main' }}

  deploy-staging:
    needs: docker-build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: kubectl set image deployment/solaris-backend backend=ghcr.io/agent47marine/solarisai-backend:${{ github.sha }}
```

---

## 13. Monitoring & Observability

### 13.1 Metrics (Prometheus)

```python
# backend/app/core/metrics.py
from prometheus_client import Counter, Histogram, Gauge

voice_commands_total  = Counter("voice_commands_total", "Total voice commands", ["intent", "status"])
voice_latency_ms      = Histogram("voice_latency_ms", "End-to-end voice command latency", buckets=[100,250,500,1000,2000,5000])
stt_latency_ms        = Histogram("stt_latency_ms", "STT latency")
llm_latency_ms        = Histogram("llm_latency_ms", "LLM intent parsing latency")
nav_suggestion_accepts = Counter("nav_suggestion_accepts_total", "Suggestions accepted by user")
fault_diagnoses_total  = Counter("fault_diagnoses_total", "Fault diagnoses", ["fault_class"])
model_drift_psi        = Gauge("model_drift_psi", "Population Stability Index", ["model"])
```

### 13.2 Grafana Dashboards

| Dashboard | Panels |
|-----------|--------|
| Voice AI | Command volume, p50/p95 latency, STT vs LLM latency, error rate, intent distribution |
| ML Models | Fault class distribution, PSI over time, inference latency, suggestion accept rate |
| Infrastructure | CPU, memory, DB connections, Redis hit rate |
| IoT | Telemetry ingestion rate, active alerts, device status heatmap |

### 13.3 Alerting Rules

```yaml
# prometheus/alerts.yml
groups:
- name: solaris
  rules:
  - alert: VoiceLatencyHigh
    expr: histogram_quantile(0.95, voice_latency_ms_bucket) > 3000
    for: 5m
    annotations: {summary: "Voice command p95 latency > 3s"}

  - alert: ModelDriftHigh
    expr: model_drift_psi{model="fault_clf"} > 0.2
    annotations: {summary: "Fault classifier drift detected — retrain needed"}

  - alert: ErrorRateHigh
    expr: rate(voice_commands_total{status="error"}[5m]) / rate(voice_commands_total[5m]) > 0.05
    annotations: {summary: "Voice command error rate > 5%"}
```

### 13.4 Structured Logging

```python
# All logs as JSON; ship to ELK or CloudWatch
import structlog
log = structlog.get_logger()
log.info("voice_command", session_id=sid, intent=intent, latency_ms=latency, user_id=uid)
```

---

## 14. Rollout & Rollback Plan

### 14.1 Rollout Stages

| Stage | Traffic | Criteria to Proceed |
|-------|---------|---------------------|
| Dev | Internal only | All tests pass, smoke demo OK |
| Staging | 0% production traffic | Load test passes: 50 concurrent voice commands, p95 < 2s |
| Canary | 10% production | Error rate < 1%, no SEV-1 in 24 hr |
| Full | 100% production | Error rate < 1% sustained 48 hr |

### 14.2 Rollback

```bash
# Immediate rollback (k8s)
kubectl rollout undo deployment/solaris-backend
kubectl rollout status deployment/solaris-backend

# DB rollback (Alembic)
alembic downgrade -1

# ML model rollback (MLflow)
# Set previous version to Production stage via MLflow UI or:
mlflow models set-model-version-tag fault_clf <prev_version> "stage" "Production"
```

### 14.3 Feature Flags

- `VOICE_ENABLED`: toggles entire voice feature; defaults `true`.
- `NAV_SUGGESTIONS_ENABLED`: toggles suggestion model; defaults `true`.
- `STT_PROVIDER`: `whisper_local` | `openai` | `google` — hot-switch without restart via Redis config.

---

## 15. Testing & Acceptance Criteria

### 15.1 Backend Tests

```bash
# Unit tests
pytest tests/unit/ -v
# Integration tests (requires running DB + Redis)
pytest tests/integration/ -v --env=test
# Load test
locust -f tests/load/locustfile.py --headless -u 50 -r 5 --run-time 60s
```

### 15.2 ML Tests

```bash
# Fault classifier
pytest tests/ml/test_fault_clf.py -v
# Assertions: accuracy >= 0.92, macro_f1 >= 0.88, inference_ms <= 50

# Nav suggester
pytest tests/ml/test_nav_suggester.py -v
# Assertions: precision@1 >= 0.70, precision@3 >= 0.85

# Integration: voice command → correct navigation action
pytest tests/integration/test_voice_pipeline.py -v
```

### 15.3 Test File Plan

| File | Tests |
|------|-------|
| `tests/unit/test_auth.py` | JWT creation, validation, expiry |
| `tests/unit/test_stt_service.py` | Mock STT transcription, error handling |
| `tests/unit/test_llm_service.py` | Intent parsing from known utterances |
| `tests/unit/test_session_store.py` | Redis get/set/expire context |
| `tests/unit/test_nav_features.py` | Feature vector construction |
| `tests/integration/test_voice_pipeline.py` | End-to-end voice command tests |
| `tests/integration/test_data_apis.py` | All existing REST endpoints |
| `tests/ml/test_fault_clf.py` | Model accuracy assertions |
| `tests/ml/test_nav_suggester.py` | Suggestion precision assertions |
| `tests/load/locustfile.py` | 50 concurrent users, voice + data APIs |

### 15.4 Acceptance Criteria

| Criterion | Metric | Target |
|-----------|--------|--------|
| Voice command end-to-end latency | p95 | ≤ 2,000 ms |
| Intent resolution accuracy | % correct on 200-utterance eval set | ≥ 90% |
| STT WER (solar vocabulary) | Word Error Rate | ≤ 10% |
| Nav suggestion precision@1 | % top-1 accepted | ≥ 70% |
| Fault classifier accuracy | Multi-class accuracy | ≥ 92% |
| API error rate | 5xx / total | ≤ 1% |
| Throughput | Voice commands/second (single instance) | ≥ 5 RPS |
| Uptime | Monthly | ≥ 99.5% |

---

## 16. Risk Register

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|-----------|--------|------------|
| R1 | LLM API latency spikes | Medium | High | Timeout 3 s; fallback to regex-based intent parser |
| R2 | STT accuracy poor on noisy field environments | High | High | Fine-tune Whisper on solar-domain vocab; provide text fallback |
| R3 | Nav suggestion model cold start (insufficient data) | High (Day 1) | Medium | Bootstrap with 20K synthetic sequences |
| R4 | Anthropic API key not available at hackathon | Low | High | Pre-configure Mistral 7B local fallback in `llm_service.py` |
| R5 | PostgreSQL/TimescaleDB unavailable | Low | High | Auto-fallback to SQLite in dev config |
| R6 | Redis unavailable | Low | Medium | In-memory session dict fallback (single-instance only) |
| R7 | Model drift undetected in production | Medium | Medium | Weekly PSI checks + automated retraining trigger |
| R8 | Audio format incompatibility (browser codecs) | Medium | Medium | Accept WebM + WAV; server-side conversion via ffmpeg |
| R9 | Over-fitting navigation model to synthetic data | Medium | Medium | Low regularisation; refresh weekly with real data |

---

## 17. Milestone Plan

### Milestone 1 — Day 1 (Backend Foundation + Voice API)

**Goal:** Working voice command endpoint returning navigation actions.

| # | Deliverable | File |
|---|-------------|------|
| 1.1 | Auth system (JWT) | `backend/app/api/auth.py`, `backend/app/core/security.py` |
| 1.2 | Pydantic settings | `backend/app/core/config.py` |
| 1.3 | STT service (Whisper local) | `backend/app/services/stt_service.py` |
| 1.4 | LLM intent service (Claude/local) | `backend/app/services/llm_service.py` |
| 1.5 | Session store (Redis) | `backend/app/services/session_store.py` |
| 1.6 | Voice command endpoint | `backend/app/api/voice.py` |
| 1.7 | Wire new routes into `main.py` | `backend/main.py` |
| 1.8 | Database migrations (Alembic) | `backend/alembic/versions/001_voice_tables.py` |
| 1.9 | Docker Compose with Redis | `docker-compose.yml` |
| 1.10 | Unit tests for 1.1–1.6 | `tests/unit/` |

**Validation:**
```bash
docker compose up -d
curl -X POST http://localhost:8000/api/auth/token -d '{"username":"admin","password":"admin"}'
curl -X POST http://localhost:8000/api/voice/command \
  -H "Authorization: Bearer <token>" \
  -d '{"text_input":"show me inverter 3","session_id":"s1","current_view":"dashboard"}'
# Expect: {"navigation_action":{"action":"OPEN_DEVICE","params":{"device_id":...}}}
```

---

### Milestone 2 — Day 2 (Nav Suggestion Model + WebSocket + Frontend Integration)

**Goal:** Context-aware next-view suggestions; real-time WebSocket voice; frontend chatbot widget.

| # | Deliverable | File |
|---|-------------|------|
| 2.1 | Synthetic nav data generator | `backend/app/ml/nav_model/data_gen.py` |
| 2.2 | Feature engineering | `backend/app/ml/nav_model/features.py` |
| 2.3 | Nav model training script | `backend/app/ml/nav_model/train.py` |
| 2.4 | Nav model inference | `backend/app/ml/nav_model/predict.py` |
| 2.5 | Integrate nav suggestions into voice API | `backend/app/api/voice.py` |
| 2.6 | WebSocket streaming endpoint | `backend/app/api/ws.py` |
| 2.7 | Prometheus metrics | `backend/app/core/metrics.py` |
| 2.8 | Frontend VoiceAssistant widget | `src/components/VoiceAssistant/VoiceAssistant.jsx` |
| 2.9 | Frontend nav action dispatcher | `src/services/voiceService.js` |
| 2.10 | Nav model tests | `tests/ml/test_nav_suggester.py` |

**Validation:**
```bash
python -m app.ml.nav_model.train --data data/nav_sequences.jsonl
python -m app.ml.nav_model.evaluate  # Expect precision@1 >= 0.70
# Test suggestions via API
curl -X POST http://localhost:8000/api/voice/command \
  -d '{"text_input":"show inverter 3","session_id":"s1","current_view":"plant_2"}'
# Expect: suggestions array with 2-3 items
```

---

### Milestone 3 — Day 3 (Hardening, Testing, Demo)

**Goal:** Production-ready, tested, demo-able system.

| # | Deliverable | File |
|---|-------------|------|
| 3.1 | Load tests | `tests/load/locustfile.py` |
| 3.2 | Fault clf drift monitor | `backend/app/ml/drift_monitor.py` |
| 3.3 | GitHub Actions CI | `.github/workflows/ci.yml` |
| 3.4 | Dockerfile (backend + frontend) | `backend/Dockerfile`, `Dockerfile.frontend` |
| 3.5 | k8s manifests outline | `k8s/` |
| 3.6 | Alembic migrations finalized | `backend/alembic/` |
| 3.7 | End-to-end integration tests | `tests/integration/` |
| 3.8 | MLflow experiment tracking live | `mlflow/` |
| 3.9 | Demo script with 5 showcase utterances | `docs/demo_script.md` |
| 3.10 | README update | `README.md` |

**Validation:**
```bash
pytest tests/ -v --cov=app             # All pass
locust -f tests/load/locustfile.py --headless -u 50 -r 5 --run-time 60s
# Expect: p95 voice latency < 2000ms, error rate < 1%
docker build -t solarisai:demo ./backend && docker run -p 8000:8000 solarisai:demo
```

---

## 18. Implementation Checklist

> For Antigravity Claude Opus 4.6 — follow in order.

```
SETUP
[ ] 1.  Clone repo: git clone https://github.com/AGENT47MARINE/SolarisAI.git
[ ] 2.  cd backend && pip install -r requirements.txt; verify existing endpoints work
[ ] 3.  Run python -m app.ml.train; confirm model artifacts saved

AUTH & CONFIG
[ ] 4.  Create backend/app/core/config.py with pydantic BaseSettings (DB_URL, REDIS_URL, JWT_SECRET, ANTHROPIC_API_KEY, STT_PROVIDER)
[ ] 5.  Create backend/app/core/security.py: create_access_token(), verify_token(), hash_password()
[ ] 6.  Create backend/app/api/auth.py: POST /api/auth/token with SQLAlchemy user lookup
[ ] 7.  Add JWT middleware to main.py; exclude /api/health and /api/auth/token
[ ] 8.  Write tests/unit/test_auth.py: test token creation, expiry, invalid creds

DATABASE
[ ] 9.  Install alembic; run alembic init alembic
[ ] 10. Write alembic/versions/001_voice_tables.py: CREATE TABLE users, voice_sessions, nav_events, model_versions
[ ] 11. Run alembic upgrade head; verify tables exist

STT SERVICE
[ ] 12. Add openai-whisper to requirements.txt
[ ] 13. Create backend/app/services/stt_service.py: get_model(), async transcribe(bytes) -> str
[ ] 14. Write tests/unit/test_stt_service.py with mock audio input

LLM SERVICE
[ ] 15. Add anthropic to requirements.txt
[ ] 16. Create backend/app/services/llm_service.py: parse_intent(transcript, context, entity_list) -> dict
[ ] 17. Add Mistral-7B fallback path (llama_cpp) for offline use
[ ] 18. Write tests/unit/test_llm_service.py with 10 labelled utterances

SESSION STORE
[ ] 19. Add redis[asyncio] to requirements.txt
[ ] 20. Create backend/app/services/session_store.py: get_context(), set_context(), append_nav_event()
[ ] 21. Add in-memory dict fallback if Redis connection fails
[ ] 22. Write tests/unit/test_session_store.py

VOICE API
[ ] 23. Create backend/app/api/voice.py: POST /api/voice/command (Pydantic request/response models)
[ ] 24. Implement pipeline: decode audio → STT → LLM intent → nav action → suggestions
[ ] 25. Add GET /api/voice/session/{session_id} and DELETE /api/voice/session/{session_id}
[ ] 26. Register voice router in main.py
[ ] 27. Write tests/integration/test_voice_pipeline.py: 10 utterance → nav_action tests

NAV SUGGESTION MODEL
[ ] 28. Create backend/app/ml/nav_model/data_gen.py: generate 20K synthetic sequences
[ ] 29. Create backend/app/ml/nav_model/features.py: build_feature_vector(session_context) -> np.array
[ ] 30. Create backend/app/ml/nav_model/train.py: XGBoost multi-class training + MLflow logging
[ ] 31. Create backend/app/ml/nav_model/predict.py: predict_top_k(context, k=3) -> list[dict]
[ ] 32. Run python -m app.ml.nav_model.data_gen && python -m app.ml.nav_model.train
[ ] 33. Write tests/ml/test_nav_suggester.py: assert precision@1 >= 0.70

WEBSOCKET
[ ] 34. Create backend/app/api/ws.py: WS /api/ws/voice/{session_id} (stream audio chunks, return partial transcripts + final action)
[ ] 35. Register WS router in main.py
[ ] 36. Test manually with wscat or frontend widget

METRICS & LOGGING
[ ] 37. Add prometheus-client to requirements.txt
[ ] 38. Create backend/app/core/metrics.py with all Prometheus metrics defined in §13.1
[ ] 39. Instrument voice.py with latency histograms and counters
[ ] 40. Add GET /metrics endpoint (Prometheus scrape)
[ ] 41. Add structlog to requirements.txt; configure JSON logging in main.py

DRIFT MONITOR
[ ] 42. Create backend/app/ml/drift_monitor.py: PSI calculation + alert if > 0.2
[ ] 43. Add cron job or Celery beat task to run nightly

FRONTEND (React)
[ ] 44. Create src/components/VoiceAssistant/VoiceAssistant.jsx: mic button, text input, transcript display, suggestion chips
[ ] 45. Create src/services/voiceService.js: calls POST /api/voice/command; dispatches navigation_action to React Router
[ ] 46. Add VoiceAssistant widget as overlay on all dashboard pages
[ ] 47. Wire suggestion chips to trigger follow-up navigation

DOCKER & INFRA
[ ] 48. Write backend/Dockerfile (Python 3.11-slim + ffmpeg + Whisper model)
[ ] 49. Write docker-compose.yml (backend, frontend, db, redis, mlflow)
[ ] 50. Run docker compose up --build; confirm all services healthy

CI/CD
[ ] 51. Create .github/workflows/ci.yml with jobs: backend-test, frontend-test, docker-build, deploy-staging
[ ] 52. Add pip-audit and npm audit steps to CI
[ ] 53. Add codecov integration

K8S
[ ] 54. Create k8s/backend-deployment.yaml and k8s/backend-service.yaml
[ ] 55. Create k8s/ml-training-job.yaml for fault classifier training
[ ] 56. Create k8s/secrets.yaml template (values from env)

TESTING & DEMO
[ ] 57. Write tests/load/locustfile.py: simulate 50 users sending voice commands
[ ] 58. Run full test suite: pytest tests/ -v --cov=app
[ ] 59. Run load test: locust -f tests/load/locustfile.py --headless -u 50 -r 5 --run-time 60s
[ ] 60. Assert: p95 voice latency < 2000ms, error rate < 1%, fault accuracy >= 92%, nav precision@1 >= 70%
[ ] 61. Record 3-minute demo video covering: voice nav, suggestions, fault diagnosis, text fallback
[ ] 62. Update README.md with setup instructions, architecture diagram link, and API docs URL
```

---

*End of PRD — Voice AI Solar Dashboard v1.0*  
*Prepared by: Claude Sonnet 4.6 | DyuLabs Hackathon 2026*
