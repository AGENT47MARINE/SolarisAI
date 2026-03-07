const API_BASE_URL = 'http://localhost:8000/api';

const apiService = {
    // Dashboard Metrics
    getDashboardMetrics: async (period = 'Yearly', month, year) => {
        let url = `${API_BASE_URL}/dashboard/metrics?period=${period}`;
        if (month !== undefined) url += `&month=${month}`;
        if (year !== undefined) url += `&year=${year}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch dashboard metrics');
        return response.json();
    },

    // Plants
    getPlants: async () => {
        const response = await fetch(`${API_BASE_URL}/plants`);
        if (!response.ok) throw new Error('Failed to fetch plants');
        return response.json();
    },

    getPlantDetails: async (plantId) => {
        const response = await fetch(`${API_BASE_URL}/plants/${plantId}`);
        if (!response.ok) throw new Error('Failed to fetch plant details');
        return response.json();
    },

    // Inverters / Devices
    getDevices: async () => {
        const response = await fetch(`${API_BASE_URL}/devices`);
        if (!response.ok) throw new Error('Failed to fetch devices');
        return response.json();
    },

    getDeviceDetails: async (deviceId) => {
        const response = await fetch(`${API_BASE_URL}/devices/${deviceId}`);
        if (!response.ok) throw new Error('Failed to fetch device details');
        return response.json();
    },

    getDeviceTelemetry: async (deviceId) => {
        const response = await fetch(`${API_BASE_URL}/devices/${deviceId}/telemetry`);
        if (!response.ok) throw new Error('Failed to fetch telemetry');
        return response.json();
    },

    // Alerts
    getAlerts: async () => {
        const response = await fetch(`${API_BASE_URL}/alerts`);
        if (!response.ok) throw new Error('Failed to fetch alerts');
        return response.json();
    },

    // AI Diagnosis
    diagnoseDevice: async (deviceId) => {
        const response = await fetch(`${API_BASE_URL}/ai/diagnose/${deviceId}`, {
            method: 'POST'
        });
        if (!response.ok) throw new Error('Failed to run AI diagnosis');
        return response.json();
    }
};

export default apiService;
