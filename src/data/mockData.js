// Solar Dashboard - Mock Dataset matching Figma design

export const dashboardMetrics = {
    userName: "Dhruti",
    siteName: "Solar Operations",
    todayProduction: 20, // kWh shown in gauge
    totalProduction: 42800, // kWh
    totalCapacity: 42800, // kWp
    co2Reduced: 1030, // shown as 1.03k
    coalSaved: 1.4, // Tons
    treesPlanted: 155000, // shown as 155K
    efficiency: 50.75, // %
    activeAlerts: 4,
};

export const plantsStatusData = {
    total: 45,
    active: 30,
    alert: 10,
    partiallyActive: 10,
    expired: 10,
};

// Energy generation bar chart data (monthly - Sep 2026)
export const energyGenerationData = [
    { day: 1, value: 28 },
    { day: 2, value: 34 },
    { day: 3, value: 35 },
    { day: 4, value: 35 },
    { day: 5, value: 32 },
    { day: 6, value: 30 },
    { day: 7, value: 28 },
    { day: 8, value: 30 },
    { day: 9, value: 32 },
    { day: 10, value: 35 },
    { day: 11, value: 36 },
    { day: 12, value: 34 },
    { day: 13, value: 30 },
    { day: 14, value: 32 },
    { day: 15, value: 31 },
    { day: 16, value: 29 },
    { day: 17, value: 30 },
    { day: 18, value: 33 },
    { day: 19, value: 35 },
    { day: 20, value: 40 },
    { day: 21, value: 22 },
    { day: 22, value: 18 },
];

// Plants data matching Figma (Plants page with cards)
export const plantsData = [
    {
        id: "p1",
        name: "Dehgam Plant",
        lastUpdated: "50 min ago",
        status: "active",
        todayGen: 4567,
        totalGen: 4567,
        devices: 55,
        chartData: [5, 8, 10, 15, 20, 28, 35, 42, 48, 50, 50],
    },
    {
        id: "p2",
        name: "Charanka Plant",
        lastUpdated: "50 min ago",
        status: "active",
        todayGen: 4567,
        totalGen: 4567,
        devices: 55,
        chartData: [5, 8, 10, 15, 20, 28, 35, 42, 48, 50, 50],
    },
    {
        id: "p3",
        name: "Bhadla Plant",
        lastUpdated: "2 hrs ago",
        status: "partially-active",
        todayGen: 3200,
        totalGen: 12400,
        devices: 48,
        chartData: [10, 18, 25, 30, 28, 22, 18, 15, 12, 10, 8],
    },
    {
        id: "p4",
        name: "Kamuthi Plant",
        lastUpdated: "1 hr ago",
        status: "active",
        todayGen: 5120,
        totalGen: 18900,
        devices: 62,
        chartData: [8, 12, 18, 24, 30, 38, 44, 48, 50, 50, 48],
    },
    {
        id: "p5",
        name: "Rewa Plant",
        lastUpdated: "10 mins ago",
        status: "alert",
        todayGen: 1200,
        totalGen: 8900,
        devices: 40,
        chartData: [35, 30, 25, 20, 18, 15, 12, 8, 5, 3, 2],
    },
];

// Total devices breakdown for horizontal bar
export const totalDevicesData = {
    mfm: 6,
    wfm: 1,
    slms: 3,
    inverters: 4,
    total: 14,
};

export const invertersData = [
    {
        id: "1",
        deviceName: "DEHGAM_INV_01",
        category: "inverter",
        manufacturer: "Mindra",
        location: "Dehgam, Gujarat",
        totalGeneration: 154180.70,
        todayGeneration: 1484.20,
        createdOn: "01/15/2024, 10:20 AM",
        telemetry: {
            voltage: { ab: 415.2, bc: 414.1, ac: 415.5, a: 240.4, b: 239.1, c: 240.8 },
            current: { a: 55.2, b: 54.8, c: 55.6 },
            frequency: 50.02,
            activePower: 52.5,
            temperature: 52.2,
            status: "warning"
        }
    },
    {
        id: "2",
        deviceName: "CHARANKA_INV_05",
        category: "inverter",
        manufacturer: "ABB",
        location: "Charanka, Gujarat",
        totalGeneration: 145261.70,
        todayGeneration: 1451.70,
        createdOn: "03/12/2024, 11:15 AM",
        telemetry: {
            voltage: { ab: 408.2, bc: 410.1, ac: 409.5, a: 236.4, b: 237.1, c: 236.8 },
            current: { a: 42.2, b: 41.8, c: 42.6 },
            frequency: 49.98,
            activePower: 38.5,
            temperature: 42.5,
            status: "normal"
        }
    },
    {
        id: "3",
        deviceName: "BHADLA_INV_12",
        category: "inverter",
        manufacturer: "Mindra",
        location: "Bhadla, Rajasthan",
        totalGeneration: 120243.90,
        todayGeneration: 1242.70,
        createdOn: "05/22/2024, 09:15 AM",
        telemetry: {
            voltage: { ab: 411.2, bc: 412.1, ac: 411.5, a: 238.4, b: 239.1, c: 238.8 },
            current: { a: 25.2, b: 24.8, c: 25.6 },
            frequency: 50.01,
            activePower: 22.5,
            temperature: 40.2,
            status: "normal"
        }
    },
    {
        id: "4",
        deviceName: "KAMUTHI_INV_03",
        category: "inverter",
        manufacturer: "Sungrow",
        location: "Kamuthi, Tamil Nadu",
        totalGeneration: 126413.00,
        todayGeneration: 100.50,
        createdOn: "08/14/2024, 02:19 PM",
        telemetry: {
            voltage: { ab: 0, bc: 0, ac: 0, a: 0, b: 0, c: 0 },
            current: { a: 0, b: 0, c: 0 },
            frequency: 0,
            activePower: 0,
            temperature: 30.1,
            status: "critical"
        }
    },
    {
        id: "5",
        deviceName: "REWA_INV_08",
        category: "inverter",
        manufacturer: "Mindra",
        location: "Rewa, Madhya Pradesh",
        totalGeneration: 98413.00,
        todayGeneration: 950.50,
        createdOn: "11/04/2024, 04:30 PM",
        telemetry: {
            voltage: { ab: 412.2, bc: 413.1, ac: 412.5, a: 239.4, b: 240.1, c: 239.8 },
            current: { a: 48.2, b: 47.8, c: 48.6 },
            frequency: 49.95,
            activePower: 45.0,
            temperature: 41.5,
            status: "normal"
        }
    },
    {
        id: "6",
        deviceName: "PAVAGADA_INV_02",
        category: "inverter",
        manufacturer: "ABB",
        location: "Pavagada, Karnataka",
        totalGeneration: 110413.00,
        todayGeneration: 1150.50,
        createdOn: "02/18/2025, 10:10 AM",
        telemetry: {
            voltage: { ab: 410.2, bc: 411.1, ac: 410.5, a: 238.4, b: 238.1, c: 238.8 },
            current: { a: 50.2, b: 49.8, c: 50.6 },
            frequency: 50.05,
            activePower: 48.0,
            temperature: 65.5,
            status: "critical"
        }
    }
];

export const sensorsData = [
    { id: "s1", deviceName: "DEHGAM_WMS_01", category: "wms", manufacturer: "Weather Monitoring", location: "Gujarat", createdOn: "01/15/2024" },
    { id: "s2", deviceName: "CHARANKA_TEMP_01", category: "temperature", manufacturer: "Weather Monitoring", location: "Gujarat", createdOn: "03/12/2024" },
    { id: "s3", deviceName: "BHADLA_MFM_01", category: "mfm", manufacturer: "Schneider Electric", location: "Rajasthan", createdOn: "05/22/2024" },
    { id: "s4", deviceName: "KAMUTHI_MFM_02", category: "mfm", manufacturer: "Schneider Electric", location: "Tamil Nadu", createdOn: "08/14/2024" },
    { id: "s5", deviceName: "REWA_WMS_02", category: "wms", manufacturer: "Weather Monitoring", location: "Madhya Pradesh", createdOn: "11/04/2024" },
    { id: "s6", deviceName: "PAVAGADA_TEMP_02", category: "temperature", manufacturer: "Weather Monitoring", location: "Karnataka", createdOn: "02/18/2025" }
];

export const alertsData = [
    { id: 1, type: "critical", device: "KAMUTHI_INV_03", message: "Grid Under Voltage / Lost Communication - Potential Local Islanding", time: "10 mins ago", location: "Tamil Nadu" },
    { id: 2, type: "warning", device: "DEHGAM_INV_01", message: "Elevated IGBT Temperature Details (52.2°C) - Desert Heat Wave", time: "1 hr ago", location: "Gujarat" },
    { id: 3, type: "warning", device: "BHADLA_MFM_01", message: "Sensor communication timeout - RS485 Loop Error", time: "2 hrs ago", location: "Rajasthan" },
    { id: 4, type: "critical", device: "PAVAGADA_INV_02", message: "Thermal Runaway Imminent - Core Temp (65.5°C)", time: "5 mins ago", location: "Karnataka" }
];
