/**
 * SolarisAI Central API service layer.
 * Connects the React frontend to the FastAPI backend.
 */

const API_BASE = 'http://localhost:8000';

/**
 * Get the current auth token from local storage.
 */
function getAuthHeader() {
    const token = localStorage.getItem('solaris_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

/**
 * Common fetch wrapper with error handling.
 */
async function apiFetch(endpoint, options = {}) {
    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader(),
                ...options.headers,
            },
        });

        if (!res.ok) {
            if (res.status === 401) {
                // In production, trigger sign-out/re-auth
                console.warn('Unauthorized access to API');
            }
            const err = await res.json().catch(() => ({ detail: 'Network error' }));
            throw new Error(err.detail || `API Error: ${res.status}`);
        }

        return await res.json();
    } catch (err) {
        console.error(`Fetch error [${endpoint}]:`, err.message);
        throw err;
    }
}

export const apiService = {
    // Dashboard
    getDashboardMetrics: () => apiFetch('/api/dashboard/metrics'),

    // Plants
    getPlants: () => apiFetch('/api/plants'),
    getPlant: (id) => apiFetch(`/api/plants/${id}`),

    // Devices / Inverters
    getDevices: () => apiFetch('/api/devices'),
    getDevice: (id) => apiFetch(`/api/devices/${id}`),
    getDeviceTelemetry: (id) => apiFetch(`/api/devices/${id}/telemetry`),

    // Alerts
    getAlerts: () => apiFetch('/api/alerts'),
    acknowledgeAlert: (id) => apiFetch(`/api/alerts/${id}/acknowledge`, { method: 'POST' }),

    // AI Diagnosis
    diagnoseDevice: (deviceId, alertId = null) =>
        apiFetch('/api/ai/diagnose', {
            method: 'POST',
            body: JSON.stringify({ device_id: deviceId, alert_id: alertId }),
        }),
};
