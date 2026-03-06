/**
 * Voice AI API service layer.
 * Handles communication with the SolarisAI backend voice endpoints.
 */

const API_BASE = 'http://localhost:8000';

// Session ID persists across page navigations
let sessionId = localStorage.getItem('solaris_session_id');
if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('solaris_session_id', sessionId);
}

let authToken = localStorage.getItem('solaris_token');

/**
 * Authenticate and get JWT token.
 */
export async function login(username = 'admin', password = 'admin') {
    try {
        const res = await fetch(`${API_BASE}/api/auth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        if (!res.ok) throw new Error('Auth failed');
        const data = await res.json();
        authToken = data.access_token;
        localStorage.setItem('solaris_token', authToken);
        return data;
    } catch (err) {
        console.warn('Auth failed, continuing without token:', err.message);
        return null;
    }
}

/**
 * Ensure we have a valid auth token.
 */
async function ensureAuth() {
    if (!authToken) {
        await login();
    }
}

/**
 * Send a voice command (text) to the backend.
 * @param {string} textInput - The voice transcript or typed text
 * @param {string} currentView - Current route/view name
 * @returns {Promise<Object>} Navigation action and suggestions
 */
export async function sendVoiceCommand(textInput, currentView = 'dashboard') {
    await ensureAuth();

    try {
        const res = await fetch(`${API_BASE}/api/voice/command`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
            },
            body: JSON.stringify({
                text_input: textInput,
                session_id: sessionId,
                current_view: currentView,
            }),
        });

        if (res.status === 401) {
            // Token expired, re-auth and retry
            await login();
            return sendVoiceCommand(textInput, currentView);
        }

        if (!res.ok) {
            const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(err.detail || 'Voice command failed');
        }

        return await res.json();
    } catch (err) {
        console.error('Voice command error:', err);
        // Fallback: return a local parse result
        return fallbackParse(textInput);
    }
}

/**
 * Get session history.
 */
export async function getSession() {
    await ensureAuth();
    try {
        const res = await fetch(`${API_BASE}/api/voice/session/${sessionId}`, {
            headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
        });
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

/**
 * Clear session.
 */
export async function deleteSession() {
    try {
        await fetch(`${API_BASE}/api/voice/session/${sessionId}`, {
            method: 'DELETE',
            headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
        });
        sessionId = crypto.randomUUID();
        localStorage.setItem('solaris_session_id', sessionId);
    } catch {
        // Ignore
    }
}

/**
 * Map navigation action to a frontend route.
 */
export function actionToRoute(action) {
    if (!action) return null;

    const { action: intent, params = {} } = action;

    switch (intent) {
        case 'OPEN_DASHBOARD':
            return '/dashboard';
        case 'OPEN_PLANT':
            if (params.route) return `/${params.route}`;
            if (params.plant_id) return `/plants`;
            return '/plants';
        case 'OPEN_DEVICE':
            if (params.route) return `/${params.route}`;
            if (params.device_id) return `/inverters/${params.device_id}`;
            return '/inverters';
        case 'OPEN_ALERTS':
            return '/alerts';
        case 'OPEN_TELEMETRY':
            if (params.device_id) return `/inverters/${params.device_id}`;
            return '/sensors';
        case 'DIAGNOSE':
            if (params.device_id) return `/inverters/${params.device_id}`;
            return '/inverters';
        case 'GET_SUMMARY':
            return '/dashboard';
        default:
            return null;
    }
}

/**
 * Local fallback parser for when backend is unavailable.
 */
function fallbackParse(text) {
    const t = text.toLowerCase().trim();
    let intent = 'UNKNOWN';
    let params = {};

    if (t.includes('dashboard') || t.includes('home')) {
        intent = 'OPEN_DASHBOARD';
    } else if (t.includes('alert') || t.includes('warning')) {
        intent = 'OPEN_ALERTS';
    } else if (t.includes('map') || t.includes('plants')) {
        intent = 'OPEN_PLANT';
        params = { route: t.includes('map') ? 'map' : 'plants' };
    } else if (t.includes('sensor') || t.includes('weather')) {
        intent = 'OPEN_DEVICE';
        params = { route: 'sensors' };
    } else if (t.includes('inverter')) {
        const match = t.match(/inverter\s*(\d+)/);
        intent = 'OPEN_DEVICE';
        if (match) {
            params = { device_id: match[1], route: `inverters/${match[1]}` };
        } else {
            params = { route: 'inverters' };
        }
    } else if (t.includes('diagnos')) {
        intent = 'DIAGNOSE';
    }

    return {
        session_id: sessionId,
        transcript: text,
        intent,
        confidence: 0.75,
        navigation_action: { action: intent, params },
        suggestions: [],
        latency_ms: 0,
    };
}

export function getSessionId() {
    return sessionId;
}
