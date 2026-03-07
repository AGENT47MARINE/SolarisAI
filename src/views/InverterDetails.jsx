import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invertersData } from '../data/mockData';
import { ArrowLeft, Loader2, Activity, Zap, Thermometer, Battery, Waves } from 'lucide-react';
import './InverterDetails.css';

// SVG Line Chart for Volts & Amps
const TelemetryChart = ({ data, color, type }) => {
    const width = 800;
    const height = 180;
    const max = Math.max(...data) * 1.1;
    const min = Math.min(...data) * 0.9;
    const spread = (max - min) || 1;

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / spread) * (height - 20) - 10;
        return `${x},${y}`;
    }).join(' ');

    const areaPoints = `0,${height} ${points} ${width},${height}`;

    return (
        <div className="telemetry-chart-container">
            <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                <defs>
                    <linearGradient id={`grad-${type}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                        <stop offset="100%" stopColor={color} stopOpacity="0.05" />
                    </linearGradient>
                </defs>
                {/* Background Grid */}
                <line x1="0" y1={height / 4} x2="100%" y2={height / 4} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1={height / 2} x2="100%" y2={height / 2} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1={(height / 4) * 3} x2="100%" y2={(height / 4) * 3} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />

                <polygon points={areaPoints} fill={`url(#grad-${type})`} />
                <polyline
                    points={points}
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="telemetry-line-anim"
                />
            </svg>
            <div className="telemetry-labels y-axis">
                <span>{max.toFixed(0)}</span>
                <span>{((max + min) / 2).toFixed(0)}</span>
                <span>{min.toFixed(0)}</span>
            </div>
            <div className="telemetry-labels x-axis">
                <span>06:00</span>
                <span>10:00</span>
                <span>14:00</span>
                <span>18:00</span>
                <span>22:00</span>
            </div>
        </div>
    );
};

// AC/DC Gauges
const PowerGauge = ({ value, max, label, unit, color }) => {
    const percentage = Math.min((value / max) * 100, 100);
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="power-gauge">
            <svg width="120" height="120" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                <circle
                    cx="50" cy="50" r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    transform="rotate(-90 50 50)"
                    style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                />
            </svg>
            <div className="gauge-overlay">
                <div className="gauge-val">{value}</div>
                <div className="gauge-unit">{unit}</div>
            </div>
            <div className="gauge-label">{label}</div>
        </div>
    );
};

const InverterDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [device, setDevice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('grid'); // 'grid' or 'telemetry'

    useEffect(() => {
        setTimeout(() => {
            const data = invertersData.find(d => d.id === id) || invertersData[0];
            setDevice(data);
            setLoading(false);
        }, 500);
    }, [id]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Loader2 className="animate-spin" size={48} color="var(--primary)" />
            </div>
        );
    }

    if (!device) return <div>Device not found</div>;

    // Mock data for charts
    const voltData = [412, 415, 411, 408, 414, 415, 418, 413, 410, 412];
    const currData = [55, 58, 62, 75, 80, 78, 70, 65, 55, 40];
    const freqData = [50.01, 50.05, 49.98, 49.95, 50.10, 50.02, 50.00, 49.90, 50.05, 50.02];

    return (
        <div className="inv-details-view animate-fade-in">
            {/* Header */}
            <div className="inv-d-header">
                <div className="inv-d-title-area">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="page-title">{device.deviceName || device.device_name}</h1>
                        <div className="inv-d-subtitle">
                            <span>{device.manufacturer} Inverter</span>
                            <span className="dot-sep">•</span>
                            <span>{device.location}</span>
                            <span className="dot-sep">•</span>
                            <span className={`status-badge ${device.telemetry.status}`}>
                                <span className="status-dot"></span>{device.telemetry.status.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="inv-d-tabs">
                    <button
                        className={`inv-tab ${activeTab === 'grid' ? 'active' : ''}`}
                        onClick={() => setActiveTab('grid')}
                    >
                        Grid Parameters
                    </button>
                    <button
                        className={`inv-tab ${activeTab === 'telemetry' ? 'active' : ''}`}
                        onClick={() => setActiveTab('telemetry')}
                    >
                        Telemetry Charts
                    </button>
                </div>
            </div>

            {/* Top KPI row */}
            <div className="inv-d-kpis">
                <div className="kpi-card card">
                    <div className="kpi-icon-wrap primary"><Zap size={24} /></div>
                    <div className="kpi-content">
                        <div className="kpi-label">Active Power</div>
                        <div className="kpi-value highlight">{device.telemetry.activePower.toFixed(1)} <span className="kpi-unit">kW</span></div>
                    </div>
                </div>
                <div className="kpi-card card">
                    <div className="kpi-icon-wrap" style={{ color: '#F2C94C', background: 'rgba(242, 201, 76, 0.1)' }}>
                        <Waves size={24} /></div>
                    <div className="kpi-content">
                        <div className="kpi-label">Frequency</div>
                        <div className="kpi-value">{device.telemetry.frequency.toFixed(2)} <span className="kpi-unit">Hz</span></div>
                    </div>
                </div>
                <div className="kpi-card card">
                    <div className="kpi-icon-wrap" style={{ color: '#EB5757', background: 'rgba(235, 87, 87, 0.1)' }}>
                        <Thermometer size={24} /></div>
                    <div className="kpi-content">
                        <div className="kpi-label">Internal Temp.</div>
                        <div className="kpi-value" style={device.telemetry.temperature > 50 ? { color: 'var(--status-critical)' } : {}}>{device.telemetry.temperature} <span className="kpi-unit">°C</span></div>
                    </div>
                </div>
                <div className="kpi-card card">
                    <div className="kpi-icon-wrap" style={{ color: '#9B51E0', background: 'rgba(155, 81, 224, 0.1)' }}>
                        <Battery size={24} /></div>
                    <div className="kpi-content">
                        <div className="kpi-label">Total Energy</div>
                        <div className="kpi-value">{(device.totalGeneration || device.total_gen)?.toFixed(1)} <span className="kpi-unit">kWh</span></div>
                    </div>
                </div>
            </div>

            {/* Main Content Area based on Tabs */}
            {activeTab === 'grid' && (
                <div className="inv-d-main-grid">
                    {/* Electrical Parameters */}
                    <div className="card elec-params-card">
                        <h3 className="card-title">Live Grid Parameters</h3>

                        <div className="params-bicolor-grid">
                            <div className="param-column">
                                <h4 className="column-head">Voltage (V)</h4>
                                <div className="param-item">
                                    <span className="p-lbl">Phase R-Y</span>
                                    <span className="p-val">{device.telemetry.voltage.ab} V</span>
                                </div>
                                <div className="param-item">
                                    <span className="p-lbl">Phase Y-B</span>
                                    <span className="p-val">{device.telemetry.voltage.bc} V</span>
                                </div>
                                <div className="param-item">
                                    <span className="p-lbl">Phase B-R</span>
                                    <span className="p-val">{device.telemetry.voltage.ac} V</span>
                                </div>
                            </div>
                            <div className="param-divider"></div>
                            <div className="param-column">
                                <h4 className="column-head">Current (A)</h4>
                                <div className="param-item">
                                    <span className="p-lbl">Phase R</span>
                                    <span className="p-val">{device.telemetry.current.a} A</span>
                                </div>
                                <div className="param-item">
                                    <span className="p-lbl">Phase Y</span>
                                    <span className="p-val">{device.telemetry.current.b} A</span>
                                </div>
                                <div className="param-item">
                                    <span className="p-lbl">Phase B</span>
                                    <span className="p-val">{device.telemetry.current.c} A</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* DC to AC Conversion Gauges */}
                    <div className="card conv-gauges-card">
                        <h3 className="card-title">Power Conversion</h3>
                        <div className="gauges-container">
                            <PowerGauge value={58.2} max={100} label="DC Input Power" unit="kW" color="#F2C94C" />
                            <div className="conv-arrow">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                <span className="eff-lbl">96% Eff.</span>
                            </div>
                            <PowerGauge value={device.telemetry.activePower} max={100} label="AC Output Power" unit="kW" color="var(--primary)" />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'telemetry' && (
                <div className="inv-d-telemetry-grid">
                    <div className="card chart-card">
                        <div className="chart-header">
                            <h3 className="card-title">Voltage Trend (Phase R-Y)</h3>
                            <button className="chart-download"><Activity size={16} /></button>
                        </div>
                        <TelemetryChart data={voltData} color="#F2C94C" type="volt" />
                    </div>

                    <div className="card chart-card">
                        <div className="chart-header">
                            <h3 className="card-title">Current Trend (Phase R)</h3>
                            <button className="chart-download"><Activity size={16} /></button>
                        </div>
                        <TelemetryChart data={currData} color="var(--primary)" type="curr" />
                    </div>

                    <div className="card chart-card">
                        <div className="chart-header">
                            <h3 className="card-title">Grid Frequency</h3>
                            <button className="chart-download"><Activity size={16} /></button>
                        </div>
                        <TelemetryChart data={freqData} color="#56CCF2" type="freq" />
                    </div>
                </div>
            )}

        </div>
    );
};

export default InverterDetails;
