import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import { Loader2, Search, Filter, LayoutGrid, Map as MapIcon } from 'lucide-react';
import './PlantsList.css';

// Mini Line Chart using SVG (Updated for dark theme)
const MiniLineChart = ({ data }) => {
    const width = 280;
    const height = 60;

    // Fallback if data is empty or too small
    if (!data || data.length < 2) {
        return (
            <div style={{ width: '100%', height: height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Not enough data
            </div>
        );
    }

    const max = Math.max(...data);
    const min = Math.min(...data);
    const spread = (max - min) || 1;

    // Calculate points fitting 100% of SVG width
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / spread) * (height - 5) - 2;
        return `${x},${y}`;
    }).join(' ');

    const areaPoints = `0,${height} ${points} ${width},${height}`;

    return (
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ display: 'block' }}>
            <defs>
                <linearGradient id="lineGradientDark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon points={areaPoints} fill="url(#lineGradientDark)" />
            <polyline
                points={points}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

const STATUS_CONFIG = {
    active: { label: 'Active', color: 'var(--status-normal)' },
    'partially-active': { label: 'Partially Active', color: 'var(--status-warning)' },
    alert: { label: 'Alert', color: 'var(--status-critical)' },
    expired: { label: 'Inactive', color: 'var(--status-inactive)' },
};

const PlantCard = ({ plant, onClick }) => {
    const status = STATUS_CONFIG[plant.status] || STATUS_CONFIG.active;
    return (
        <div className="plant-card card" onClick={onClick}>
            <div className="plant-card-header">
                <div>
                    <div className="plant-name">{plant.name}</div>
                    <div className="plant-updated">{plant.last_updated}</div>
                </div>
                <div className="plant-status-badge">
                    <span className="status-dot" style={{ background: status.color, boxShadow: `0 0 8px ${status.color}` }} />
                    <span className="status-text" style={{ color: status.color }}>{status.label}</span>
                </div>
            </div>

            <div className="plant-metrics">
                <div className="plant-metric">
                    <div className="plant-metric-label">Today</div>
                    <div className="plant-metric-value highlight">{plant.today_gen} kWh</div>
                </div>
                <div className="plant-metric">
                    <div className="plant-metric-label">Total</div>
                    <div className="plant-metric-value">{plant.total_gen.toLocaleString()} kWh</div>
                </div>
                <div className="plant-metric">
                    <div className="plant-metric-label">Devices</div>
                    <div className="plant-metric-value">{plant.device_count}</div>
                </div>
            </div>

            <div className="plant-chart-area">
                <div className="chart-label">Active Power History</div>
                <MiniLineChart data={plant.chart_data} />
            </div>
        </div>
    );
};

const PlantsList = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [plants, setPlants] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPlants = async () => {
            try {
                const data = await apiService.getPlants();
                setPlants(data);
                setLoading(false);
            } catch (err) {
                console.error("Plants fetch error:", err);
                setLoading(false);
            }
        };
        fetchPlants();
    }, []);

    const filtered = plants.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Loader2 className="animate-spin" size={48} color="var(--primary)" />
            </div>
        );
    }

    return (
        <div className="plants-view">
            <div className="plants-header">
                <h1 className="plants-title">
                    Plants <span className="plants-count">({plants.length})</span>
                </h1>

                <div className="plants-controls">
                    <button className="filter-btn">
                        <Filter size={16} />
                        Filter
                    </button>
                    <div className="view-toggle">
                        <button className="view-btn active">
                            <LayoutGrid size={18} />
                        </button>
                        <button className="view-btn" onClick={() => navigate('/map')}>
                            <MapIcon size={18} />
                        </button>
                    </div>
                    <div className="search-bar">
                        <Search className="search-icon" size={16} />
                        <input
                            type="text"
                            placeholder="Search plants by name..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>
            </div>

            <div className="plants-grid">
                {filtered.map(plant => (
                    <PlantCard
                        key={plant.id}
                        plant={plant}
                        onClick={() => navigate(`/plants/${plant.id}`)}
                    />
                ))}
                {filtered.length === 0 && (
                    <div className="no-results">No plants match your search Criteria.</div>
                )}
            </div>
        </div>
    );
};

export default PlantsList;
