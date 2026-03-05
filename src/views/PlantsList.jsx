import React, { useState } from 'react';
import { plantsData } from '../data/mockData';
import './PlantsList.css';

// Mini Line Chart using SVG
const MiniLineChart = ({ data }) => {
    const width = 260;
    const height = 70;
    const max = Math.max(...data);
    const min = Math.min(...data);

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / (max - min || 1)) * (height - 10) - 5;
        return `${x},${y}`;
    }).join(' ');

    const areaPoints = `0,${height} ${points} ${width},${height}`;

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2D9CDB" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#2D9CDB" stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon points={areaPoints} fill="url(#lineGradient)" />
            <polyline
                points={points}
                fill="none"
                stroke="#2D9CDB"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Y-axis labels approximate */}
            <text x="2" y="12" fontSize="9" fill="#94a3b8">50</text>
            <text x="2" y="42" fontSize="9" fill="#94a3b8">30</text>
            <text x="2" y="68" fontSize="9" fill="#94a3b8">10</text>
        </svg>
    );
};

const STATUS_CONFIG = {
    active: { label: 'Active', color: '#27AE60' },
    'partially-active': { label: 'Partially Active', color: '#F2994A' },
    alert: { label: 'Alert', color: '#EB5757' },
    expired: { label: 'Expired', color: '#64748b' },
};

const PlantCard = ({ plant, onClick }) => {
    const status = STATUS_CONFIG[plant.status] || STATUS_CONFIG.active;
    return (
        <div className="plant-card card" onClick={onClick}>
            <div className="plant-card-header">
                <div>
                    <div className="plant-name">{plant.name}</div>
                    <div className="plant-updated">{plant.lastUpdated}</div>
                </div>
                <div className="plant-status-badge">
                    <span className="status-dot" style={{ background: status.color }} />
                    <span className="status-text" style={{ color: status.color }}>{status.label}</span>
                </div>
            </div>

            <div className="plant-metrics">
                <div className="plant-metric">
                    <div className="plant-metric-label">Today</div>
                    <div className="plant-metric-value">{plant.todayGen}Kwh</div>
                </div>
                <div className="plant-metric">
                    <div className="plant-metric-label">Total</div>
                    <div className="plant-metric-value">{plant.totalGen}Kwh</div>
                </div>
                <div className="plant-metric">
                    <div className="plant-metric-label">Devices</div>
                    <div className="plant-metric-value devices">{plant.devices}</div>
                </div>
            </div>

            <div className="plant-chart-area">
                <div className="chart-label">Active Power</div>
                <MiniLineChart data={plant.chartData} />
                <div className="chart-x-labels">
                    {['00:00', '2:00', '3:00', '00:00', '2:00', '3:00', '2:00'].map((t, i) => (
                        <span key={i}>{t}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

const PlantsList = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // grid or list

    const filtered = plantsData.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="plants-view">
            {/* Breadcrumb */}
            <div className="breadcrumb">
                <span className="breadcrumb-link">Dashboard</span>
                <span className="breadcrumb-sep"> / </span>
                <span className="breadcrumb-current">Plants</span>
            </div>

            {/* Header */}
            <div className="plants-header">
                <h1 className="plants-title">
                    Plants <span className="plants-count">({plantsData.length})</span>
                </h1>

                <div className="plants-controls">
                    <button className="filter-btn">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M0 2h16v2L10 9v5l-4-2V9L0 4V2z" />
                        </svg>
                        Filter
                    </button>
                    <div className="view-toggle">
                        <button
                            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <rect x="0" y="0" width="6" height="6" rx="1" />
                                <rect x="10" y="0" width="6" height="6" rx="1" />
                                <rect x="0" y="10" width="6" height="6" rx="1" />
                                <rect x="10" y="10" width="6" height="6" rx="1" />
                            </svg>
                        </button>
                        <button
                            className={`view-btn ${viewMode === 'map' ? 'active' : ''}`}
                            onClick={() => setViewMode('map')}
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M1 8h14M8 1a11 11 0 010 14M8 1a11 11 0 000 14" stroke="currentColor" strokeWidth="1.5" fill="none" />
                            </svg>
                        </button>
                    </div>
                    <div className="search-bar">
                        <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="6.5" cy="6.5" r="5.5" stroke="#94a3b8" strokeWidth="1.5" />
                            <line x1="11" y1="11" x2="15" y2="15" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search Devices"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>
            </div>

            {/* Plants Grid */}
            <div className="plants-grid">
                {filtered.map(plant => (
                    <PlantCard
                        key={plant.id}
                        plant={plant}
                        onClick={() => { }}
                    />
                ))}
                {filtered.length === 0 && (
                    <div className="no-results">No plants match your search.</div>
                )}
            </div>
        </div>
    );
};

export default PlantsList;
