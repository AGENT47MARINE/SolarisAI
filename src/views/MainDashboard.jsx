import React, { useState } from 'react';
import apiService from '../services/apiService';
import { Loader2 } from 'lucide-react';
import './MainDashboard.css';

// --- Radial Gauge Component (Updated for glassmorphism) ---
const RadialGauge = ({ percentage, value, label }) => {
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

                    // Neon blue for active, subtle glass border for inactive
                    let fill = 'rgba(255, 255, 255, 0.05)';
                    if (isActive) fill = 'var(--primary)';
                    if (isHighlight) fill = 'var(--primary-light)';

                    return (
                        <path
                            key={i}
                            d={`M ${x1} ${y1} L ${x2} ${y2} A ${r2} ${r2} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${r1} ${r1} 0 0 0 ${x1} ${y1} Z`}
                            fill={fill}
                            className={isActive ? "gauge-segment-active" : ""}
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

// --- India Dotted Map Component (Updated for glassmorphism) ---
const IndiaDottedMap = () => {
    const mapDots = [
        [0, 4], [0, 5], [1, 3], [1, 4], [1, 5], [1, 6], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7],
        [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [3, 7], [3, 8], [4, 1], [4, 2], [4, 3], [4, 4], [4, 5], [4, 6], [4, 7], [4, 8], [4, 9],
        [5, 0], [5, 1], [5, 2], [5, 3], [5, 4], [5, 5], [5, 6], [5, 7], [5, 8], [5, 9], [5, 10],
        [6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [6, 6], [6, 7], [6, 8], [6, 9],
        [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [7, 7], [7, 8],
        [8, 2], [8, 3], [8, 4], [8, 5], [8, 6], [8, 7],
        [9, 3], [9, 4], [9, 5], [9, 6], [10, 4], [10, 5], [11, 5]
    ];

    const markers = [
        { row: 2, col: 5, color: 'var(--status-critical)' },
        { row: 4, col: 7, color: 'var(--status-warning)' },
        { row: 6, col: 3, color: 'var(--primary)' },
        { row: 7, col: 6, color: 'var(--primary)' },
        { row: 5, col: 9, color: 'var(--status-warning)' },
    ];

    return (
        <div className="plant-map">
            <svg width="180" height="180" viewBox="0 0 180 180">
                {mapDots.map(([row, col], i) => {
                    const x = col * 15 + 10;
                    const y = row * 15 + 10;
                    return <circle key={i} cx={x} cy={y} r={3.5} fill="rgba(255,255,255,0.15)" />;
                })}
                {markers.map((m, i) => {
                    const x = m.col * 15 + 10;
                    const y = m.row * 15 + 10;
                    return (
                        <g key={i} className="map-marker">
                            <circle cx={x} cy={y} r={12} fill={m.color} opacity="0.2" className="marker-pulse" />
                            <circle cx={x} cy={y} r={5} fill={m.color} />
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

// --- Net Zero Footprint (Glassmorphism update) ---
const NetZeroFootprint = ({ co2, coal, trees }) => {
    return (
        <div className="net-zero-wrapper">
            <div className="nz-bubble nz-co2">
                <div className="nz-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C7.6 2 4 5.6 4 10c0 2.9 1.6 5.5 4 7h8c2.4-1.5 4-4.1 4-7 0-4.4-3.6-8-8-8z" fill="var(--status-normal)" />
                        <path d="M12 14v6M8 20h8" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </div>
                <div className="nz-value">{co2}</div>
                <div className="nz-label">CO2 Reduced</div>
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

// --- Device Progress Bar (Dark theme variables) ---
const DeviceBar = ({ data }) => {
    const total = data.mfm + data.wfm + data.slms + data.inverters;
    const items = [
        { label: 'MFM', count: data.mfm, color: 'var(--primary)', width: (data.mfm / total) * 100 },
        { label: 'WFM', count: data.wfm, color: 'var(--primary-light)', width: (data.wfm / total) * 100 },
        { label: 'SLMS', count: data.slms, color: 'rgba(77, 166, 255, 0.5)', width: (data.slms / total) * 100 },
        { label: 'Inverters', count: data.inverters, color: 'var(--text-muted)', width: (data.inverters / total) * 100 },
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
const EnergyChart = ({ energyData, revenueData, chartPeriod, setChartPeriod, chartDate, setChartDate }) => {
    const [activeTab, setActiveTab] = useState('energy');

    const displayData = activeTab === 'energy' ? energyData : revenueData;
    const max = Math.max(...displayData.map(d => d.value), 1);
    const unit = activeTab === 'energy' ? 'kWh' : 'INR';

    const handlePrevDate = () => {
        const newDate = new Date(chartDate);
        if (chartPeriod === 'Monthly') newDate.setMonth(newDate.getMonth() - 1);
        else if (chartPeriod === 'Yearly') newDate.setFullYear(newDate.getFullYear() - 1);
        else newDate.setFullYear(newDate.getFullYear() - 5);
        setChartDate(newDate);
    };

    const handleNextDate = () => {
        const newDate = new Date(chartDate);
        if (chartPeriod === 'Monthly') newDate.setMonth(newDate.getMonth() + 1);
        else if (chartPeriod === 'Yearly') newDate.setFullYear(newDate.getFullYear() + 1);
        else newDate.setFullYear(newDate.getFullYear() + 5);
        setChartDate(newDate);
    };

    const formatLabel = () => {
        if (chartPeriod === 'Monthly') return chartDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        if (chartPeriod === 'Yearly') return chartDate.getFullYear().toString();
        return "Lifetime";
    };

    const handleDownload = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Date,Value (" + unit + ")\n"
            + displayData.map(d => `${d.day},${d.value}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `solaris_data_${activeTab}_${chartPeriod.toLowerCase()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="card energy-chart-card">
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
                    <button className="date-nav" onClick={handlePrevDate}>‹</button>
                    <span className="date-label">{formatLabel()}</span>
                    <button className="date-nav" onClick={handleNextDate}>›</button>
                    <div className="period-tabs">
                        {['Monthly', 'Yearly', 'Lifetime'].map(p => (
                            <button
                                key={p}
                                className={`period-tab ${chartPeriod === p ? 'active' : ''}`}
                                onClick={() => setChartPeriod(p)}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                    <button className="download-btn" onClick={handleDownload} title="Export CSV">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 10L4 6h3V1h2v5h3L8 10zM13 13H3v-2H1v4h14v-4h-2v2z" />
                        </svg>
                    </button>
                </div>
            </div>
            <div className="energy-chart-body">
                <div className="chart-y-label">{unit}</div>
                <div className="bars-container">
                    {displayData.map((d, i) => {
                        const heightPct = (d.value / max) * 100;
                        const isHighlight = d.value === max;
                        return (
                            <div key={i} className="bar-item">
                                <div className="bar-tooltip">
                                    <div className="bar-tooltip-date">{d.day}</div>
                                    <div className="bar-tooltip-val">{d.value.toLocaleString()} {unit}</div>
                                </div>
                                <div
                                    className="bar-rect"
                                    style={{
                                        height: `${heightPct}%`,
                                        background: isHighlight ? 'var(--primary)' : 'rgba(77, 166, 255, 0.3)',
                                        boxShadow: isHighlight ? '0 0 10px rgba(77,166,255,0.4)' : 'none'
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
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chartPeriod, setChartPeriod] = useState('Yearly');
    const [chartDate, setChartDate] = useState(new Date(2026, 8, 1)); // Default Sep 2026

    React.useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const data = await apiService.getDashboardMetrics(chartPeriod, chartDate.getMonth() + 1, chartDate.getFullYear());
                setMetrics(data);
                setLoading(false);
            } catch (err) {
                console.error("Dashboard error:", err);
                setError(err.message);
                setLoading(false);
            }
        };
        fetchMetrics();
        // Polling for live dashboard feel
        const interval = setInterval(fetchMetrics, 5000);
        return () => clearInterval(interval);
    }, [chartPeriod, chartDate]);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <Loader2 className="animate-spin" size={48} color="var(--primary)" />
        </div>
    );

    if (error) return <div className="error-message">Error: {error}</div>;

    return (
        <div className="dashboard-content">
            <div className="dashboard-header">
                <div>
                    <h1 className="page-title">Solar Performance Overview</h1>
                    <p className="page-subtitle">Namaste! Here's your portfolio summary.</p>
                </div>
            </div>

            {/* Top Row: Energy Production | Plants Status | Net Zero */}
            <div className="dashboard-top-row">

                {/* Left: Total Energy Production */}
                <div className="card energy-production-card">
                    <h3 className="card-title">Total Energy Production</h3>
                    <RadialGauge
                        percentage={metrics.efficiency_pct}
                        value={metrics.today_production_kwh.toFixed(1)}
                        label="Today's Generation"
                    />
                    <div className="production-stats">
                        <div className="production-stat">
                            <div className="stat-label">Total Production</div>
                            <div className="stat-value">{metrics.total_production_kwh.toLocaleString()} kWh</div>
                        </div>
                        <div className="production-stat-divider" />
                        <div className="production-stat">
                            <div className="stat-label">Total Capacity</div>
                            <div className="stat-value">{metrics.total_capacity_kwp.toLocaleString()} kWp</div>
                        </div>
                    </div>
                </div>

                {/* Mid: Plants Status */}
                <div className="card plants-status-card">
                    <h3 className="card-title">Plants Status</h3>
                    <div className="plants-status-body">
                        <div className="plants-status-left">
                            <div className="plants-total-count">{metrics.total_plants}</div>
                            <div className="plants-total-label">Total Plants</div>
                            <div className="plants-status-grid">
                                <div className="status-item">
                                    <span className="status-val active">{metrics.active_plants}</span>
                                    <span className="status-lbl">Active</span>
                                </div>
                                <div className="status-item">
                                    <span className="status-val alert">{metrics.alert_plants}</span>
                                    <span className="status-lbl">Alert</span>
                                </div>
                                <div className="status-item">
                                    <span className="status-val partial">{metrics.partially_active_plants}</span>
                                    <span className="status-lbl">Partial</span>
                                </div>
                                <div className="status-item">
                                    <span className="status-val inactive">{metrics.expired_plants}</span>
                                    <span className="status-lbl">Inactive</span>
                                </div>
                            </div>
                        </div>
                        <IndiaDottedMap />
                    </div>
                </div>

                {/* Right: Net Zero Footprint */}
                <div className="card net-zero-card">
                    <h3 className="card-title">Net Zero Footprint</h3>
                    <NetZeroFootprint
                        co2={`${metrics.co2_reduced_tons < 1000 ? metrics.co2_reduced_tons.toFixed(2) : (metrics.co2_reduced_tons / 1000).toFixed(2) + 'k'}`}
                        coal={`${metrics.coal_saved_tons.toFixed(1)} T`}
                        trees={`${metrics.trees_planted < 1000 ? metrics.trees_planted : (metrics.trees_planted / 1000).toFixed(0) + 'K'}`}
                    />
                </div>
            </div>

            {/* Bottom Row: Total Devices | Energy Chart */}
            <div className="dashboard-bottom-row">
                {/* Left: Total Devices */}
                <div className="card devices-card">
                    <h3 className="card-title">Total Devices</h3>
                    <DeviceBar data={{
                        inverters: metrics.device_breakdown.inverter || 0,
                        mfm: metrics.device_breakdown.mfm || 0,
                        slms: metrics.device_breakdown.slms || 0,
                        wfm: metrics.device_breakdown.wms || 0,
                    }} />
                </div>

                {/* Right: Energy Generation Chart */}
                <EnergyChart
                    energyData={metrics.energy_chart}
                    revenueData={metrics.revenue_chart}
                    chartPeriod={chartPeriod}
                    setChartPeriod={setChartPeriod}
                    chartDate={chartDate}
                    setChartDate={setChartDate}
                />
            </div>
        </div>
    );
};

export default MainDashboard;
