import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, RefreshCw, Activity, Zap, Cpu } from 'lucide-react';
import { invertersData } from '../data/mockData';
import './DeviceDetails.css';

// SVG String Current Heatmap
const StringHeatmap = () => {
    const hours = 24;
    const strings = 12;

    // Generate procedural heatmap data showing solar curve
    const cells = [];
    for (let s = 1; s <= strings; s++) {
        for (let h = 0; h < hours; h++) {
            let intensity = 0;
            // Simulated daylight curve (6AM to 6PM)
            if (h > 6 && h < 18) {
                const peek = 12; // Noon
                const dist = Math.abs(peek - h);
                intensity = Math.max(0, 100 - (dist * 15));

                // Add some random noise
                intensity += Math.random() * 10 - 5;

                // Simulate a faulty string (String 4 is underperforming)
                if (s === 4) intensity *= 0.4;
            }

            // Map intensity to a color scale
            let bg = 'rgba(255,255,255,0.02)'; // Night
            if (intensity > 80) bg = '#EB5757'; // Hot (High current)
            else if (intensity > 50) bg = 'var(--primary)'; // Normal
            else if (intensity > 20) bg = 'rgba(77, 166, 255, 0.4)'; // Low
            else if (intensity > 0) bg = 'rgba(77, 166, 255, 0.1)'; // Very Low

            cells.push({ s, h, intensity, bg });
        }
    }

    return (
        <div className="heatmap-container">
            <div className="heatmap-legend">
                <span>0A</span>
                <div className="legend-bar"></div>
                <span>9.5A</span>
            </div>
            <div className="heatmap-grid">
                {/* Y-Axis Labels (Strings) */}
                {Array.from({ length: strings }).map((_, i) => (
                    <div key={`y-${i}`} className="hm-y-label">STR {i + 1}</div>
                ))}

                {/* Grid Cells */}
                {cells.map((cell, i) => (
                    <div
                        key={i}
                        className="hm-cell"
                        style={{
                            gridRow: cell.s,
                            gridColumn: cell.h + 2,
                            background: cell.bg
                        }}
                        title={`String ${cell.s} at ${cell.h}:00 - Intensity: ${cell.intensity.toFixed(1)}`}
                    ></div>
                ))}
            </div>

            {/* X-Axis Labels (Hours) */}
            <div className="hm-x-labels">
                <div></div> {/* Filler for Y axis column */}
                {Array.from({ length: 24 }).map((_, i) => (
                    <div key={`x-${i}`} className="hm-x-label">{i % 3 === 0 ? i : ''}</div>
                ))}
            </div>
        </div>
    );
};


const DeviceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const inverter = invertersData.find(i => i.id === id);
    const [activeTab, setActiveTab] = useState('heatmap'); // 'heatmap' or 'trend'

    if (!inverter) return <div>Device not found</div>;

    const { telemetry } = inverter;

    return (
        <div className="device-details-view animate-fade-in">
            {/* Header */}
            <div className="dd-header">
                <div className="dd-title-area">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="page-title">{inverter.deviceName || inverter.device_name}</h1>
                        <div className="dd-subtitle">
                            <span>CT & String Analytics</span>
                            <span className="dot-sep">•</span>
                            <span>{inverter.location}</span>
                            <span className="dot-sep">•</span>
                            <span>Last updated: Just now</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPIs */}
            <div className="dd-kpis">
                <div className="kpi-card card">
                    <div className="kpi-icon-wrap primary"><Zap size={24} /></div>
                    <div className="kpi-content">
                        <div className="kpi-label">Active Power</div>
                        <div className="kpi-value highlight">{telemetry.activePower.toFixed(1)} <span className="kpi-unit">kW</span></div>
                    </div>
                </div>
                <div className="kpi-card card">
                    <div className="kpi-icon-wrap" style={{ color: '#F2C94C', background: 'rgba(242, 201, 76, 0.1)' }}>
                        <Cpu size={24} /></div>
                    <div className="kpi-content">
                        <div className="kpi-label">Total Strings</div>
                        <div className="kpi-value">12 <span className="kpi-unit">Connected</span></div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="dd-main-grid">

                {/* Left Col: Metrics */}
                <div className="device-overview-card card">

                    <div className="metrics-group">
                        <h3 className="metrics-title"><Activity size={18} /> Grid Measurement</h3>
                        <div className="metrics-grid">
                            <div className="metric-item">
                                <div className="m-lbl">Voltage AB / BC / AC</div>
                                <div className="m-val">{telemetry.voltage.ab} / {telemetry.voltage.bc} / {telemetry.voltage.ac} <span className="m-unit">V</span></div>
                            </div>
                            <div className="metric-item">
                                <div className="m-lbl">Phase Voltage A / B / C</div>
                                <div className="m-val">{telemetry.voltage.a} / {telemetry.voltage.b} / {telemetry.voltage.c} <span className="m-unit">V</span></div>
                            </div>
                            <div className="metric-item">
                                <div className="m-lbl">Phase Current A / B / C</div>
                                <div className="m-val highlight">{telemetry.current.a} / {telemetry.current.b} / {telemetry.current.c} <span className="m-unit">A</span></div>
                            </div>
                            <div className="metric-item">
                                <div className="m-lbl">Grid Frequency</div>
                                <div className="m-val">{telemetry.frequency.toFixed(2)} <span className="m-unit">Hz</span></div>
                            </div>
                        </div>
                    </div>

                    <div className="metrics-group">
                        <h3 className="metrics-title"><Zap size={18} /> Energy & Power</h3>
                        <div className="metrics-grid">
                            <div className="metric-item">
                                <div className="m-lbl">E-Today</div>
                                <div className="m-val highlight">{(inverter.todayGeneration || inverter.today_gen)?.toFixed(2)} <span className="m-unit">kWh</span></div>
                            </div>
                            <div className="metric-item">
                                <div className="m-lbl">E-Total</div>
                                <div className="m-val">{(inverter.totalGeneration || inverter.total_gen)?.toFixed(1)} <span className="m-unit">kWh</span></div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Col: Analytics (Heatmap/Trend) */}
                <div className="analytics-card card">
                    <div className="chart-header">
                        <div className="chart-title-flex">
                            <RefreshCw size={18} />
                            <h3 className="card-title" style={{ margin: 0 }}>String Current Heatmap</h3>
                        </div>
                        <div className="chart-controls">
                            <button className="time-btn active">Today</button>
                            <button className="time-btn">Yesterday</button>
                            <button className="icon-btn" title="Download Data"><Download size={16} /></button>
                        </div>
                    </div>

                    <StringHeatmap />
                </div>

            </div>
        </div>
    );
};

export default DeviceDetails;
