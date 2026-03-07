import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { plantsData, invertersData } from '../data/mockData';
import { ArrowLeft, Loader2, ThermometerSun, Wind, Droplets, Sun, AlertTriangle } from 'lucide-react';
import './PlantDetails.css';

// SVG Energy Flow Diagram (Matches Slide 11)
const EnergyFlowDiagram = () => {
    return (
        <div className="energy-flow-container">
            <svg width="100%" height="280px" viewBox="0 0 800 280">
                {/* Connecting Lines */}
                <path d="M 200 140 L 400 140" stroke="var(--primary)" strokeWidth="3" strokeDasharray="6 6" className="flow-line-animate" />
                <path d="M 400 140 L 600 140" stroke="var(--status-normal)" strokeWidth="3" strokeDasharray="6 6" className="flow-line-animate" />

                <path d="M 400 140 L 400 240 L 500 240" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="4 4" className="flow-line-animate" />

                {/* Nodes */}
                {/* Solar Arrays (Left) */}
                <g transform="translate(100, 140)">
                    <circle cx="0" cy="0" r="50" fill="var(--bg-panel)" stroke="var(--primary)" strokeWidth="2" />
                    <text x="0" y="-10" textAnchor="middle" fill="var(--text-heading)" fontSize="16" fontWeight="bold">PV Array</text>
                    <text x="0" y="15" textAnchor="middle" fill="var(--primary-light)" fontSize="18" fontWeight="bold">92kW</text>
                    <text x="0" y="30" textAnchor="middle" fill="var(--text-muted)" fontSize="10">DC Power</text>
                </g>

                {/* Inverter (Center) */}
                <g transform="translate(400, 140)">
                    <rect x="-60" y="-60" width="120" height="120" rx="12" fill="var(--bg-panel)" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                    <text x="0" y="-20" textAnchor="middle" fill="var(--text-heading)" fontSize="14" fontWeight="600">Inverter Station</text>
                    <text x="0" y="5" textAnchor="middle" fill="var(--status-normal)" fontSize="20" fontWeight="bold">88kW</text>
                    <text x="0" y="25" textAnchor="middle" fill="var(--text-muted)" fontSize="11">Efficiency: 96%</text>
                    <text x="0" y="40" textAnchor="middle" fill="var(--text-muted)" fontSize="11">AC Power</text>
                </g>

                {/* Grid (Right top) */}
                <g transform="translate(680, 140)">
                    <circle cx="0" cy="0" r="50" fill="var(--bg-panel)" stroke="var(--status-normal)" strokeWidth="2" />
                    <text x="0" y="-10" textAnchor="middle" fill="var(--text-heading)" fontSize="16" fontWeight="bold">Grid Export</text>
                    <text x="0" y="15" textAnchor="middle" fill="var(--status-normal)" fontSize="18" fontWeight="bold">85kW</text>
                </g>

                {/* Local Load (Right bottom) */}
                <g transform="translate(580, 240)">
                    <circle cx="0" cy="0" r="40" fill="var(--bg-panel)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                    <text x="0" y="-5" textAnchor="middle" fill="var(--text-main)" fontSize="12">Local Load</text>
                    <text x="0" y="15" textAnchor="middle" fill="var(--text-heading)" fontSize="14" fontWeight="bold">3kW</text>
                </g>
            </svg>
        </div>
    );
};


const PlantDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [plant, setPlant] = useState(null);
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlantData = () => {
            try {
                setTimeout(() => {
                    const plantData = plantsData.find(p => p.id === id) || plantsData[0];
                    setPlant(plantData);
                    setDevices(invertersData); // mock devices
                    setLoading(false);
                }, 400);
            } catch (err) {
                console.error("Failed to fetch plant details", err);
                setLoading(false);
            }
        };
        fetchPlantData();
    }, [id]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Loader2 className="animate-spin" size={48} color="var(--primary)" />
            </div>
        );
    }

    if (!plant) {
        return <div>Plant not found</div>;
    }

    return (
        <div className="plant-details-view animate-fade-in">
            {/* Header & Weather */}
            <div className="pd-header-row">
                <div className="pd-title-area">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="page-title">{plant.name}</h1>
                        <div className="pd-subtitle">
                            <span>ID: {plant.plant_id || 'PLN-001'}</span>
                            <span className="dot-sep">•</span>
                            <span>{plant.location || 'Site Alpha, District 9'}</span>
                            <span className="dot-sep">•</span>
                            <span className="status-badge active"><span className="status-dot"></span>Active</span>
                        </div>
                    </div>
                </div>

                <div className="pd-weather-card card">
                    <div className="weather-item">
                        <ThermometerSun size={20} className="w-icon temp" />
                        <div>
                            <div className="w-val">32°C</div>
                            <div className="w-lbl">Amb. Temp</div>
                        </div>
                    </div>
                    <div className="weather-item">
                        <Sun size={20} className="w-icon irr" />
                        <div>
                            <div className="w-val">850 W/m²</div>
                            <div className="w-lbl">Irradiance</div>
                        </div>
                    </div>
                    <div className="weather-item">
                        <Wind size={20} className="w-icon wind" />
                        <div>
                            <div className="w-val">12 km/h</div>
                            <div className="w-lbl">Wind Speed</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top KPIs Row */}
            <div className="pd-kpi-grid">
                <div className="kpi-card card">
                    <div className="kpi-icon-wrap primary">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Current Power</div>
                        <div className="kpi-value highlight">{plant.current_power || '92.4'} <span className="kpi-unit">kW</span></div>
                    </div>
                </div>
                <div className="kpi-card card">
                    <div className="kpi-icon-wrap success">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Today's Energy</div>
                        <div className="kpi-value">{plant.today_gen || '450'} <span className="kpi-unit">kWh</span></div>
                    </div>
                </div>
                <div className="kpi-card card">
                    <div className="kpi-content split">
                        <div>
                            <div className="kpi-label">Performance Ratio (PR)</div>
                            <div className="kpi-value pr-val">78.5%</div>
                        </div>
                        <div className="pr-gauge">
                            {/* Simplified gauge visual */}
                            <svg width="60" height="30" viewBox="0 0 60 30">
                                <path d="M 5 25 A 25 25 0 0 1 55 25" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" strokeLinecap="round" />
                                <path d="M 5 25 A 25 25 0 0 1 45 6" fill="none" stroke="var(--status-normal)" strokeWidth="6" strokeLinecap="round" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="kpi-card card">
                    <div className="kpi-content split">
                        <div>
                            <div className="kpi-label">Capacity Util. Factor (CUF)</div>
                            <div className="kpi-value cuf-val">19.2%</div>
                        </div>
                        <div className="cuf-gauge">
                            <svg width="60" height="30" viewBox="0 0 60 30">
                                <path d="M 5 25 A 25 25 0 0 1 55 25" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" strokeLinecap="round" />
                                <path d="M 5 25 A 25 25 0 0 1 20 6" fill="none" stroke="var(--status-warning)" strokeWidth="6" strokeLinecap="round" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area: Operations Map & Energy Flow */}
            <div className="pd-main-grid">
                <div className="card energy-flow-card">
                    <div className="card-header-flex">
                        <h3 className="card-title">Live Energy Flow</h3>
                        <span className="live-indicator"><span className="pulse-dot"></span>Live</span>
                    </div>
                    <div className="energy-flow-body">
                        <EnergyFlowDiagram />
                    </div>
                </div>

                <div className="pd-side-column">
                    <div className="card devices-summary-card">
                        <h3 className="card-title">Hardware Summary</h3>
                        <div className="hw-list">
                            <div className="hw-item">
                                <span className="hw-name">Inverters</span>
                                <span className="hw-count active">12/12 Online</span>
                            </div>
                            <div className="hw-item">
                                <span className="hw-name">String Combiner Boxes</span>
                                <span className="hw-count active">24/24 Online</span>
                            </div>
                            <div className="hw-item">
                                <span className="hw-name">Weather Station (WMS)</span>
                                <span className="hw-count active">1/1 Online</span>
                            </div>
                            <div className="hw-item error">
                                <span className="hw-name">Energy Meter (MFM)</span>
                                <span className="hw-count error-text"><AlertTriangle size={12} /> Comm. Error</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default PlantDetails;
