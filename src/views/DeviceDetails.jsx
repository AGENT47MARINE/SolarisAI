import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, RefreshCw, Loader2 } from 'lucide-react';
import { apiService } from '../services/apiService';

const DeviceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [device, setDevice] = useState(null);
    const [telemetry, setTelemetry] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [deviceData, telemetryData] = await Promise.all([
                    apiService.getDevice(id),
                    apiService.getDeviceTelemetry(id)
                ]);
                setDevice(deviceData);
                setTelemetry(telemetryData);
            } catch (err) {
                console.error('Failed to fetch device details:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Refresh telemetry every 30 seconds
        const interval = setInterval(async () => {
            try {
                const tel = await apiService.getDeviceTelemetry(id);
                setTelemetry(tel);
            } catch (err) {
                console.warn('Silent telemetry refresh failed');
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [id]);

    if (loading) {
        return (
            <div className="view-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Loader2 className="spin" size={48} color="var(--primary)" />
            </div>
        );
    }

    if (!device) return <div className="view-container">Device not found</div>;

    return (
        <div className="view-container animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <button
                    onClick={() => navigate('/inverters')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="page-title" style={{ color: 'var(--text-heading)', margin: 0 }}>{device.device_name}</h1>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        {telemetry ? `Last updated: ${new Date(telemetry.time).toLocaleTimeString()}` : 'No telemetry data'}
                    </span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

                {/* Left Column: Metrics Tables */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div className="card" style={{ padding: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Grid Measurement</h3>

                        {telemetry ? (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Voltage AB / BC / AC</div>
                                    <div style={{ fontWeight: 600 }} className="text-primary">{telemetry.voltage_ab.toFixed(1)} / {telemetry.voltage_bc.toFixed(1)} / {telemetry.voltage_ac.toFixed(1)} <span style={{ fontSize: '0.8rem' }}>V</span></div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Phase Current A / B / C</div>
                                    <div style={{ fontWeight: 600 }} className="text-primary">{telemetry.current_a.toFixed(1)} / {telemetry.current_b.toFixed(1)} / {telemetry.current_c.toFixed(1)} <span style={{ fontSize: '0.8rem' }}>A</span></div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Grid Frequency</div>
                                    <div style={{ fontWeight: 600 }} className="text-primary">{telemetry.frequency.toFixed(2)} <span style={{ fontSize: '0.8rem' }}>Hz</span></div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Device Temperature</div>
                                    <div style={{ fontWeight: 600 }} className="text-primary">{telemetry.temperature.toFixed(1)} <span style={{ fontSize: '0.8rem' }}>°C</span></div>
                                </div>
                            </div>
                        ) : <div style={{ color: 'var(--text-muted)' }}>No live data available</div>}
                    </div>

                    <div className="card" style={{ padding: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Energy & Power</h3>

                        {telemetry ? (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>E-Today</div>
                                    <div style={{ fontWeight: 600, color: 'var(--status-normal)' }}>{telemetry.today_generation.toFixed(2)} <span style={{ fontSize: '0.8rem' }}>kWh</span></div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Active Power</div>
                                    <div style={{ fontWeight: 600, color: 'var(--status-normal)' }}>{telemetry.active_power.toFixed(2)} <span style={{ fontSize: '0.8rem' }}>kW</span></div>
                                </div>
                            </div>
                        ) : <div style={{ color: 'var(--text-muted)' }}>No live data available</div>}
                    </div>

                </div>

                {/* Right Column: Chart */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                            <RefreshCw size={18} />
                            <h3 style={{ fontSize: '1rem', margin: 0 }}>Power Output - Live Trend</h3>
                        </div>
                    </div>

                    <div style={{ flex: 1, position: 'relative', minHeight: '300px' }}>
                        <div style={{ position: 'absolute', bottom: 10, left: '20px', width: 'calc(100% - 20px)', height: 'calc(100% - 10px)', borderLeft: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                            {[25, 50, 75, 100].map(p => (
                                <div key={p} style={{ position: 'absolute', bottom: `${p}%`, width: '100%', borderBottom: '1px dashed #e2e8f0' }}>
                                    <span style={{ position: 'absolute', left: '-25px', top: '-8px', fontSize: '10px', color: '#94a3b8' }}>{p}%</span>
                                </div>
                            ))}

                            <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100" style={{ position: 'absolute', bottom: 0, left: 0, overflow: 'visible' }}>
                                {telemetry && Array.isArray(telemetry) && telemetry.length > 0 ? (
                                    (() => {
                                        // Reverse the telemetry array so oldest is on the left
                                        const chartData = [...telemetry].reverse();
                                        const maxPower = Math.max(...chartData.map(t => t.active_power), 10); // Ensure scale > 0

                                        const points = chartData.map((t, i) => {
                                            const x = (i / Math.max(chartData.length - 1, 1)) * 100;
                                            const y = 100 - ((t.active_power / maxPower) * 100);
                                            return `${x},${y}`;
                                        }).join(' ');

                                        const isOffline = chartData[chartData.length - 1].active_power === 0;

                                        return (
                                            <polyline
                                                points={points}
                                                fill="none"
                                                stroke={isOffline ? "var(--status-critical)" : "var(--status-normal)"}
                                                strokeWidth="2"
                                                strokeLinejoin="round"
                                            />
                                        );
                                    })()
                                ) : (
                                    telemetry && !Array.isArray(telemetry) && telemetry.active_power > 0 ? (
                                        <path d="M 0 100 Q 30 100, 50 50 T 100 10" fill="none" stroke="var(--status-normal)" strokeWidth="1" />
                                    ) : (
                                        <path d="M 0 100 L 100 100" fill="none" stroke="var(--status-critical)" strokeWidth="1" />
                                    )
                                )}
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeviceDetails;
