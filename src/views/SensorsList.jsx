import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { Loader2 } from 'lucide-react';

const SensorsList = () => {
    const [sensors, setSensors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        apiService.getDevices()
            .then(data => {
                // Filter out inverters since this is the sensors (environmental/metering) view
                const nonInverters = data.filter(d => d.category !== 'inverter');
                setSensors(nonInverters);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch sensors:', err);
                setLoading(false);
            });
    }, []);

    const filteredSensors = sensors.filter(s => {
        if (filter === 'All') return true;
        if (filter === 'WMS') return s.category === 'wms' || s.category === 'weather';
        if (filter === 'MFM') return s.category === 'mfm';
        if (filter === 'Temperature') return s.category === 'temperature';
        return true;
    });

    if (loading) {
        return (
            <div className="view-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Loader2 className="spin" size={48} color="var(--primary)" />
            </div>
        );
    }

    return (
        <div className="view-container animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 className="page-title" style={{ color: 'var(--primary-dark)' }}>Sensors ({filteredSensors.length})</h1>

                <div style={{ display: 'flex', gap: '8px', background: 'white', padding: '4px', borderRadius: '24px', border: '1px solid #cbd5e1' }}>
                    {['All', 'WMS', 'MFM', 'Temperature'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                border: filter === f ? '1px solid var(--primary)' : 'none',
                                background: 'transparent',
                                color: filter === f ? 'var(--primary)' : 'var(--text-muted)',
                                borderRadius: '20px',
                                padding: '6px 20px',
                                fontWeight: 500,
                                cursor: 'pointer'
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="card" style={{ padding: '0' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Device Name</th>
                            <th>Category</th>
                            <th>Manufacturer</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSensors.map(sensor => (
                            <tr key={sensor.id}>
                                <td style={{ fontWeight: 500 }}>{sensor.device_name}</td>
                                <td><span className={`tag ${sensor.category}`}>{sensor.category}</span></td>
                                <td><span style={{ color: 'var(--text-muted)' }}>{sensor.manufacturer}</span></td>
                                <td>
                                    <span className={`status-badge ${sensor.status}`}>
                                        {sensor.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {filteredSensors.length === 0 && (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                    No sensors found matching the filter.
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
