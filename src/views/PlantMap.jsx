import React, { useState, useEffect } from 'react';
import { Server, Activity, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { apiService } from '../services/apiService';

const PlantMap = () => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiService.getDevices()
            .then(data => {
                setDevices(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch devices for map", err);
                setLoading(false);
            });
    }, []);

    const inverters = devices.filter(d => d.category === 'inverter');
    const sensors = devices.filter(d => d.category !== 'inverter');

    const getStatusColor = (status) => {
        switch (status) {
            case 'alert':
            case 'critical': return 'var(--status-critical)';
            case 'partially-active':
            case 'warning': return 'var(--status-warning)';
            case 'active':
            case 'normal':
            default: return 'var(--status-normal)';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'alert':
            case 'critical': return <AlertTriangle size={16} color="white" />;
            case 'partially-active':
            case 'warning': return <AlertTriangle size={16} color="white" />;
            case 'active':
            case 'normal':
            default: return <CheckCircle size={16} color="white" />;
        }
    };

    if (loading) {
        return (
            <div className="view-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Loader2 className="spin" size={48} color="var(--primary)" />
            </div>
        );
    }

    return (
        <div className="view-container">
            <div className="page-header" style={{ paddingLeft: 0, paddingRight: 0 }}>
                <h1 className="page-title" style={{ color: 'var(--primary-dark)' }}>Digital Twin Plant Map</h1>
                <p style={{ color: 'var(--text-muted)' }}>Live spatial view of Goa Shipyard Ltd, Vasco</p>
            </div>

            <div className="card" style={{ height: '600px', position: 'relative', overflow: 'hidden', background: '#f8fafc', border: '1px solid #cbd5e1', marginTop: '1rem' }}>

                {/* Background Grid Pattern */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    opacity: 0.5
                }} />

                {/* Legend */}
                <div style={{ position: 'absolute', top: '20px', right: '20px', background: 'white', padding: '12px', borderRadius: '8px', boxShadow: 'var(--shadow-sm)', zIndex: 10 }}>
                    <h4 style={{ fontSize: '0.875rem', marginBottom: '8px' }}>Legend</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', marginBottom: '4px' }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--status-normal)' }}></div> Normal
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', marginBottom: '4px' }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--status-warning)' }}></div> Warning
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--status-critical)' }}></div> Fault/Offline
                    </div>
                </div>

                {/* Nodes Rendering */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>

                    {/* Generating Map Nodes from data */}
                    {inverters.map((inv, index) => {
                        // Fake coordinates based on index to spread them out
                        const top = `${20 + (index * 20)}%`;
                        const left = `${15 + (index % 2 * 30)}%`;

                        return (
                            <div key={inv.id} style={{
                                position: 'absolute',
                                top, left,
                                transform: 'translate(-50%, -50%)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                zIndex: 5
                            }}>
                                <div style={{
                                    width: '48px', height: '48px',
                                    background: getStatusColor(inv.status),
                                    borderRadius: '12px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: inv.status !== 'active' ? `0 0 15px ${getStatusColor(inv.status)}` : 'var(--shadow-sm)',
                                    marginBottom: '8px',
                                    color: 'white'
                                }}>
                                    <Server size={24} />
                                </div>
                                <div style={{ background: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {getStatusIcon(inv.status)}
                                    {inv.device_name}
                                </div>
                            </div>
                        );
                    })}

                    {sensors.map((sensor, index) => {
                        // Fake coordinates
                        const top = `${30 + (index * 15)}%`;
                        const left = `${60 + (index % 2 * 20)}%`;

                        return (
                            <div key={sensor.id} style={{
                                position: 'absolute',
                                top, left,
                                transform: 'translate(-50%, -50%)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                zIndex: 5
                            }}>
                                <div style={{
                                    width: '40px', height: '40px',
                                    background: getStatusColor(sensor.status),
                                    borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: 'var(--shadow-sm)',
                                    marginBottom: '8px',
                                    color: 'white'
                                }}>
                                    <Activity size={20} />
                                </div>
                                <div style={{ background: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {getStatusIcon(sensor.status)}
                                    {sensor.device_name}
                                </div>
                            </div>
                        );
                    })}

                </div>
            </div>
        </div>
    );
};

export default PlantMap;
