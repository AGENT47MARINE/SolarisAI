import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';
import { invertersData } from '../data/mockData';

const DeviceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const inverter = invertersData.find(i => i.id === id);

    if (!inverter) return <div>Inverter not found</div>;

    const { telemetry } = inverter;

    return (
        <div className="view-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <button
                    onClick={() => navigate('/inverters')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="page-title" style={{ color: 'var(--text-heading)', margin: 0 }}>{inverter.deviceName}</h1>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Last updated: Today, 12:30 PM</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

                {/* Left Column: Metrics Tables */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div className="card" style={{ padding: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Grid Measurement</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Voltage AB / BC / AC</div>
                                <div style={{ fontWeight: 600 }} className="text-primary">{telemetry.voltage.ab} / {telemetry.voltage.bc} / {telemetry.voltage.ac} <span style={{ fontSize: '0.8rem' }}>V</span></div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Phase Voltage A / B / C</div>
                                <div style={{ fontWeight: 600 }} className="text-primary">{telemetry.voltage.a} / {telemetry.voltage.b} / {telemetry.voltage.c} <span style={{ fontSize: '0.8rem' }}>V</span></div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Phase Current A / B / C</div>
                                <div style={{ fontWeight: 600 }} className="text-primary">{telemetry.current.a} / {telemetry.current.b} / {telemetry.current.c} <span style={{ fontSize: '0.8rem' }}>A</span></div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Grid Frequency</div>
                                <div style={{ fontWeight: 600 }} className="text-primary">{telemetry.frequency} <span style={{ fontSize: '0.8rem' }}>Hz</span></div>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Energy & Power</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>E-Today</div>
                                <div style={{ fontWeight: 600, color: 'var(--status-normal)' }}>{inverter.todayGeneration.toFixed(2)} <span style={{ fontSize: '0.8rem' }}>kWh</span></div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Active Power</div>
                                <div style={{ fontWeight: 600, color: 'var(--status-normal)' }}>{telemetry.activePower} <span style={{ fontSize: '0.8rem' }}>kW</span></div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column: Chart */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                            <RefreshCw size={18} />
                            <h3 style={{ fontSize: '1rem', margin: 0 }}>E-Total Power - Live Trend</h3>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button style={{ padding: '4px 12px', borderRadius: '16px', border: '1px solid var(--primary)', background: 'white', color: 'var(--primary)', cursor: 'pointer' }}>Today</button>
                            <button style={{ padding: '4px 12px', borderRadius: '16px', border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer' }}>Yesterday</button>
                            <button style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: 'transparent', color: 'var(--primary)', cursor: 'pointer' }}>
                                <Download size={18} />
                            </button>
                        </div>
                    </div>

                    <div style={{ flex: 1, position: 'relative', minHeight: '300px' }}>
                        {/* CSS Mock Chart imitating the live trend graph */}
                        <div style={{ position: 'absolute', bottom: 0, left: '20px', width: 'calc(100% - 20px)', height: '100%', borderLeft: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                            {/* Grid lines */}
                            {[20, 40, 60, 80].map(p => (
                                <div key={p} style={{ position: 'absolute', bottom: `${p}%`, width: '100%', borderBottom: '1px solid #f1f5f9' }} />
                            ))}

                            {/* The Line (pure CSS trick for a curve) */}
                            <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100" style={{ position: 'absolute', bottom: 10, left: 0, overflow: 'visible' }}>
                                {telemetry.activePower > 0 ? (
                                    <path d="M 0 100 Q 30 100, 50 50 T 100 10" fill="none" stroke="var(--status-normal)" strokeWidth="1" />
                                ) : (
                                    <path d="M 0 100 L 100 100" fill="none" stroke="var(--status-critical)" strokeWidth="1" />
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
