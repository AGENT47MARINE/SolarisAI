import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import { ThermometerSun, Wind, Activity, Loader2 } from 'lucide-react';
import './SensorsList.css';

const SensorsList = () => {
    const [activeFilter, setActiveFilter] = useState('All');
    const [sensors, setSensors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSensors = async () => {
            try {
                const data = await apiService.getDevices();
                // Filter for non-inverter devices if needed, or assume all non-inverters are sensors
                const nonInverters = data.filter(d => d.category.toLowerCase() !== 'inverter');
                setSensors(nonInverters);
                setLoading(false);
            } catch (err) {
                console.error("Sensors fetch error:", err);
                setLoading(false);
            }
        };
        fetchSensors();
    }, []);

    const filtered = sensors.filter(sensor =>
        activeFilter === 'All' ? true : sensor.category.toLowerCase() === activeFilter.toLowerCase()
    );

    const getIcon = (category) => {
        switch (category.toLowerCase()) {
            case 'wms': return <Wind size={16} className="sen-icon" />;
            case 'temperature': return <ThermometerSun size={16} className="sen-icon" />;
            case 'mfm': return <Activity size={16} className="sen-icon" />;
            default: return <Activity size={16} className="sen-icon" />;
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <Loader2 className="animate-spin" size={48} color="var(--primary)" />
        </div>
    );

    return (
        <div className="sensors-view animate-fade-in">
            <div className="sen-header-row">
                <h1 className="sen-title">
                    Sensors <span className="sen-count">({filtered.length})</span>
                </h1>

                <div className="sen-controls">
                    {['All', 'WMS', 'MFM', 'Temperature'].map(tab => (
                        <button
                            key={tab}
                            className={`sen-tab ${activeFilter === tab ? 'active' : ''}`}
                            onClick={() => setActiveFilter(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="sen-table-card">
                <table className="sen-table">
                    <thead>
                        <tr>
                            <th>Device Details</th>
                            <th>Category</th>
                            <th>Manufacturer</th>
                            <th>Location / Phase</th>
                            <th>Added On</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(sensor => (
                            <tr key={sensor.id}>
                                <td>
                                    <div className="sen-name">
                                        {getIcon(sensor.category)}
                                        {sensor.device_name}
                                    </div>
                                </td>
                                <td>
                                    <span className={`tag ${sensor.category}`}>{sensor.category.toUpperCase()}</span>
                                </td>
                                <td style={{ color: 'var(--text-muted)' }}>
                                    {sensor.manufacturer}
                                </td>
                                <td>
                                    {sensor.location}
                                </td>
                                <td>
                                    <span className="sen-date">{new Date().toLocaleDateString()}</span>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                    No sensors found in this category.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SensorsList;
