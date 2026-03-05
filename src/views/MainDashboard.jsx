import React, { useState } from 'react';
import { dashboardMetrics, plantsStatusData, energyGenerationData, totalDevicesData } from '../data/mockData';
import './MainDashboard.css';

// --- Radial Gauge Component ---
const RadialGauge = ({ percentage, value, label }) => {
    const radius = 80;
    const strokeWidth = 18;
    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = Math.PI * normalizedRadius; // semicircle

    // We use a clipped circle to make a semicircle gauge
    const segments = 16;
    const gapAngle = 3;
    const totalAngle = 180;
    const segmentAngle = (totalAngle - (segments - 1) * gapAngle) / segments;
    const activeSegments = Math.round((percentage / 100) * segments);

    return (
        <div className="radial-gauge-wrapper">
            <svg width="200" height="110" viewBox="0 0 200 110">
                {Array.from({ length: segments }, (_, i) => {
                    const startAngleDeg = 180 + i * (segmentAngle + gapAngle);
                    const endAngleDeg = startAngleDeg + segmentAngle;
                    const startAngle = (startAngleDeg * Math.PI) / 180;
                    const endAngle = (endAngleDeg * Math.PI) / 180;

                    const cx = 100, cy = 100;
                    const r1 = 60, r2 = 95;

                    const x1 = cx + r1 * Math.cos(startAngle);
                    const y1 = cy + r1 * Math.sin(startAngle);
                    const x2 = cx + r2 * Math.cos(startAngle);
                    const y2 = cy + r2 * Math.sin(startAngle);
                    const x3 = cx + r2 * Math.cos(endAngle);
                    const y3 = cy + r2 * Math.sin(endAngle);
                    const x4 = cx + r1 * Math.cos(endAngle);
                    const y4 = cy + r1 * Math.sin(endAngle);

                    const isActive = i < activeSegments;
                    const isHighlight = i === activeSegments - 1;

                    return (
                        <path
                            key={i}
                            d={`M ${x1} ${y1} L ${x2} ${y2} A ${r2} ${r2} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${r1} ${r1} 0 0 0 ${x1} ${y1} Z`}
                            fill={isHighlight ? '#1565C0' : isActive ? '#2D9CDB' : '#D6EAF8'}
                            rx="2"
                        />
                    );
                })}
            </svg>
            <div className="radial-gauge-center">
                <div className="gauge-value">{value} kWh</div>
                <div className="gauge-percent">{percentage}%</div>
                <div className="gauge-label">{label}</div>
            </div>
        </div>
    );
};

// --- Dotted Map Component (Gujarat region) ---
const PlantMap = ({ statusData }) => {
    // Generate a dotted Gujarat-like region shape
    const dots = [];
    const mapDots = [
        // Rough Gujarat shape coordinates (row, col)
        [0, 4], [0, 5], [1, 3], [1, 4], [1, 5], [1, 6], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7],
        [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [3, 7], [3, 8], [4, 1], [4, 2], [4, 3], [4, 4], [4, 5], [4, 6], [4, 7], [4, 8], [4, 9],
        [5, 0], [5, 1], [5, 2], [5, 3], [5, 4], [5, 5], [5, 6], [5, 7], [5, 8], [5, 9], [5, 10],
        [6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [6, 6], [6, 7], [6, 8], [6, 9],
        [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [7, 7], [7, 8],
        [8, 2], [8, 3], [8, 4], [8, 5], [8, 6], [8, 7],
        [9, 3], [9, 4], [9, 5], [9, 6], [10, 4], [10, 5], [11, 5]
    ];

    // Status plant markers (col * 14 + 8 = x, row * 14 + 8 = y approx)
    const markers = [
        { row: 2, col: 5, color: '#EB5757' },  // Alert
        { row: 4, col: 7, color: '#F2994A' },  // Partial
        { row: 6, col: 3, color: '#2D9CDB' },  // Active
        { row: 7, col: 6, color: '#2D9CDB' },  // Active
        { row: 5, col: 9, color: '#F2994A' },  // Partial
    ];

    return (
        <div className="plant-map">
            <svg width="180" height="180" viewBox="0 0 180 180">
                {mapDots.map(([row, col], i) => {
                    const x = col * 15 + 10;
                    const y = row * 15 + 10;
                    return <circle key={i} cx={x} cy={y} r={3.5} fill="#C5D8E8" opacity="0.7" />;
                })}
                {markers.map((m, i) => {
                    const x = m.col * 15 + 10;
                    const y = m.row * 15 + 10;
                    return (
                        <g key={i}>
                            <circle cx={x} cy={y} r={7} fill={m.color} opacity="0.25" />
                            <circle cx={x} cy={y} r={4} fill={m.color} />
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

// --- Net Zero Footprint Bubble Chart ---
const NetZeroFootprint = ({ co2, coal, trees }) => {
    return (
        <div className="net-zero-wrapper">
            <div className="nz-bubble nz-co2">
                <div className="nz-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C7.6 2 4 5.6 4 10c0 2.9 1.6 5.5 4 7h8c2.4-1.5 4-4.1 4-7 0-4.4-3.6-8-8-8z" fill="#27AE60" />
                        <path d="M12 14v6M8 20h8" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </div>
                <div className="nz-value">{co2}</div>
                <div className="nz-label">co2 reduced</div>
            </div>
            <div className="nz-bubbles-right">
                <div className="nz-bubble nz-trees">
                    <div className="nz-value-sm">{trees}</div>
                    <div className="nz-label-sm">Trees Planted</div>
                </div>
                <div className="nz-bubble nz-coal">
                    <div className="nz-value-sm">{coal}</div>
                    <div className="nz-label-sm">Coal Saved</div>
                </div>
            </div>
        </div>
    );
};

// --- Device Progress Bar ---
const DeviceBar = ({ data }) => {
    const total = data.mfm + data.wfm + data.slms + data.inverters;
    const items = [
        { label: 'MFM', count: data.mfm, color: '#2D9CDB', width: (data.mfm / total) * 100 },
        { label: 'WFM', count: data.wfm, color: '#64B5F6', width: (data.wfm / total) * 100 },
        { label: 'SLMS', count: data.slms, color: '#90CAF9', width: (data.slms / total) * 100 },
        { label: 'Inverters', count: data.inverters, color: '#BBDEFB', width: (data.inverters / total) * 100 },
    ];
    return (
        <div className="device-bar-wrapper">
            <div className="device-bar-track">
                {items.map((item, i) => (
                    <div key={i} className="device-bar-segment" style={{ width: `${item.width}%`, background: item.color }} />
                ))}
            </div>
            <div className="device-bar-legend">
                {items.map((item, i) => (
                    <div key={i} className="device-legend-item">
                        <span className="device-legend-dot" style={{ background: item.color }} />
                        <span className="device-legend-label">{item.label} - {item.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Energy Chart ---
const EnergyChart = ({ data }) => {
    const max = Math.max(...data.map(d => d.value));
    const [activeTab, setActiveTab] = useState('energy');
    const [activePeriod, setActivePeriod] = useState('Yearly');

    return (
        <div className="energy-chart-card card">
            <div className="energy-chart-header">
                <div className="energy-tabs">
                    <button
                        className={`energy-tab ${activeTab === 'energy' ? 'active' : ''}`}
                        onClick={() => setActiveTab('energy')}
                    >
                        Energy Generation
                    </button>
                    <button
                        className={`energy-tab ${activeTab === 'revenue' ? 'active' : ''}`}
                        onClick={() => setActiveTab('revenue')}
                    >
                        Revenue
                    </button>
                </div>
                <div className="energy-controls">
                    <button className="date-nav">‹</button>
                    <span className="date-label">September 2026</span>
                    <button className="date-nav">›</button>
                    <div className="period-tabs">
                        {['Monthly', 'Yearly', 'Lifetime'].map(p => (
                            <button
                                key={p}
                                className={`period-tab ${activePeriod === p ? 'active' : ''}`}
                                onClick={() => setActivePeriod(p)}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                    <button className="download-btn">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 10L4 6h3V1h2v5h3L8 10zM13 13H3v-2H1v4h14v-4h-2v2z" />
                        </svg>
                    </button>
                </div>
            </div>
            <div className="energy-chart-body">
                <div className="chart-y-label">Kwh</div>
                <div className="bars-container">
                    {data.map((d, i) => {
                        const heightPct = (d.value / max) * 100;
                        const isHighlight = d.value === max;
                        return (
                            <div key={i} className="bar-item">
                                {isHighlight && (
                                    <div className="bar-tooltip">
                                        <div className="bar-tooltip-date">20/5/2025</div>
                                        <div className="bar-tooltip-val">{d.value}</div>
                                    </div>
                                )}
                                <div
                                    className="bar-rect"
                                    style={{
                                        height: `${heightPct}%`,
                                        background: isHighlight ? '#1565C0' : '#90CAF9',
                                    }}
                                />
                                <div className="bar-label">{d.day}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const MainDashboard = () => {
    return (
        <div className="dashboard-view">
            {/* Breadcrumb */}
            <div className="breadcrumb">
                <span className="breadcrumb-link">Dashboard</span>
            </div>

            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <div className="dashboard-greeting">Namaste, {dashboardMetrics.userName}!</div>
                    <div className="dashboard-title">Solar Performance Overview</div>
                </div>
            </div>

            {/* Top Row: Energy Production | Plants Status | Net Zero */}
            <div className="dashboard-top-row">

                {/* Left: Total Energy Production */}
                <div className="card energy-production-card">
                    <div className="card-title">Total Energy Production</div>
                    <RadialGauge
                        percentage={50.75}
                        value={20}
                        label="Today's generation"
                    />
                    <div className="production-stats">
                        <div className="production-stat">
                            <div className="stat-label">Total Production</div>
                            <div className="stat-value">{(dashboardMetrics.totalProduction).toFixed(1)} kWh</div>
                        </div>
                        <div className="production-stat-divider" />
                        <div className="production-stat">
                            <div className="stat-label">Total Capacity</div>
                            <div className="stat-value">{(dashboardMetrics.totalCapacity).toFixed(1)} kWh</div>
                        </div>
                    </div>
                </div>

                {/* Mid: Plants Status */}
                <div className="card plants-status-card">
                    <div className="card-title">Plants Status</div>
                    <div className="plants-status-body">
                        <div className="plants-status-left">
                            <div className="plants-total-count">{plantsStatusData.total}</div>
                            <div className="plants-total-label">Total Plants</div>
                            <div className="plants-status-grid">
                                <div className="status-item">
                                    <span className="status-val active">{plantsStatusData.active}</span>
                                    <span className="status-lbl">Active</span>
                                </div>
                                <div className="status-item">
                                    <span className="status-val alert">{plantsStatusData.alert}</span>
                                    <span className="status-lbl">Alert</span>
                                </div>
                                <div className="status-item">
                                    <span className="status-val partial">{plantsStatusData.partiallyActive}</span>
                                    <span className="status-lbl">Partially Active</span>
                                </div>
                                <div className="status-item">
                                    <span className="status-val expired">{plantsStatusData.expired}</span>
                                    <span className="status-lbl">Expired</span>
                                </div>
                            </div>
                        </div>
                        <PlantMap statusData={plantsStatusData} />
                    </div>
                </div>

                {/* Right: Net Zero Footprint */}
                <div className="card net-zero-card">
                    <div className="card-title">Net Zero Footprint</div>
                    <NetZeroFootprint
                        co2="1.03k"
                        coal="1.4 T"
                        trees="155K"
                    />
                </div>
            </div>

            {/* Bottom Row: Total Devices | Energy Chart */}
            <div className="dashboard-bottom-row">
                {/* Left: Total Devices */}
                <div className="card devices-card">
                    <div className="card-title">Total Devices</div>
                    <DeviceBar data={totalDevicesData} />
                </div>

                {/* Right: Energy Generation Chart */}
                <EnergyChart data={energyGenerationData} />
            </div>
        </div>
    );
};

export default MainDashboard;
