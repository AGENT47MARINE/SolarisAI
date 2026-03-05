import React from 'react';
import { invertersData, sensorsData } from '../data/mockData';
import { Server, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

const PlantMap = () => {
    // Hardcoded visual positioning for the "Digital Twin" illusion
    // In a real app, these would come from X/Y coordinates in the telemetry data

    const getStatusColor = (status) => {
        switch (status) {
            case 'critical': return 'var(--status-critical)';
            case 'warning': return 'var(--status-warning)';
            case 'normal':
            default: return 'var(--status-normal)';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'critical': return <AlertTriangle size={16} color="white" />;
            case 'warning': return <AlertTriangle size={16} color="white" />;
            case 'normal':
            default: return <CheckCircle size={16} color="white" />;
        }
    };

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
                    {invertersData.map((inv, index) => {
                        // Fake coordinates
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
                                    background: getStatusColor(inv.telemetry.status),
                                    borderRadius: '12px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: inv.telemetry.status !== 'normal' ? `0 0 15px ${getStatusColor(inv.telemetry.status)}` : 'var(--shadow-sm)',
                                    marginBottom: '8px',
                                    color: 'white'
                                }}>
                                    <Server size={24} />
                                </div>
                                <div style={{ background: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {getStatusIcon(inv.telemetry.status)}
                                    {inv.deviceName}
                                </div>
                            </div>
                        );
                    })}

                    {sensorsData.map((sensor, index) => {
                        // Fake coordinates
                        const top = `${30 + (index * 15)}%`;
                        const left = `${60 + (index % 2 * 20)}%`;
                        const isDown = sensor.deviceName.includes("RADIATION"); // Fake down status for WMS

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
                                    background: isDown ? 'var(--status-warning)' : 'var(--primary-dark)',
                                    borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: 'var(--shadow-sm)',
                                    marginBottom: '8px',
                                    color: 'white'
                                }}>
                                    <Activity size={20} />
                                </div>
                                <div style={{ background: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, boxShadow: 'var(--shadow-sm)' }}>
                                    {sensor.deviceName}
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
