import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { AlertTriangle, Info, ShieldCheck, ChevronRight, X, Loader2 } from 'lucide-react';

const Alerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [diagnosis, setDiagnosis] = useState(null);
    const [diagnosing, setDiagnosing] = useState(false);

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = () => {
        apiService.getAlerts()
            .then(data => {
                setAlerts(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch alerts:', err);
                setLoading(false);
            });
    };

    const handleDiagnose = async (alert) => {
        setSelectedAlert(alert);
        setDiagnosing(true);
        setDiagnosis(null);

        try {
            const result = await apiService.diagnoseDevice(alert.device_id, alert.id);
            setDiagnosis(result);
        } catch (err) {
            console.error('Diagnosis failed:', err);
        } finally {
            setDiagnosing(false);
        }
    };

    const renderDiagnostic = (alert) => {
        return (
            <div className="glass-panel animate-scale-in" style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1000,
                width: '600px',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '2rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: 'var(--primary-glow)', padding: '8px', borderRadius: '50%' }}>
                            <ShieldCheck size={24} color="var(--primary)" />
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--primary-dark)' }}>AI Fault Diagnosis</h2>
                    </div>
                    <button onClick={() => setSelectedAlert(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Event Context</h4>
                    <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{alert.device_name} - {alert.message}</div>
                </div>

                {diagnosing ? (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                        <Loader2 className="spin" size={40} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                        <div style={{ color: 'var(--text-muted)' }}>Analyzing telemetry and running ML inference...</div>
                    </div>
                ) : diagnosis ? (
                    <div className="animate-fade-in">
                        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h4 style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '8px' }}>Root Cause Analysis</h4>
                                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-heading)' }}>{diagnosis.fault_class}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Confidence</div>
                                <div style={{ fontWeight: 600, color: 'var(--status-normal)' }}>{(diagnosis.confidence * 100).toFixed(1)}%</div>
                            </div>
                        </div>

                        <p style={{ lineHeight: '1.6', color: 'var(--text-heading)', marginBottom: '1.5rem', padding: '1rem', background: '#eff6ff', borderRadius: '8px' }}>
                            {diagnosis.root_cause}
                        </p>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ fontSize: '0.9rem', color: 'var(--status-normal)', marginBottom: '8px' }}>Recommended Actions</h4>
                            <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                                {diagnosis.recommendations.map((rec, i) => (
                                    <li key={i} style={{ marginBottom: '0.5rem', color: 'var(--text-heading)' }}>{rec}</li>
                                ))}
                            </ul>
                        </div>

                        <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estimated Downtime</div>
                                <div style={{ fontWeight: 600 }}>{diagnosis.estimated_downtime}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Severity</div>
                                <div style={{ fontWeight: 600, color: diagnosis.severity === 'critical' ? 'var(--status-critical)' : 'var(--status-warning)' }}>
                                    {diagnosis.severity.toUpperCase()}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Model</div>
                                <div style={{ fontWeight: 500, fontSize: '0.8rem' }}>{diagnosis.model_version}</div>
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                                Generate Work Order
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{ color: 'var(--status-critical)', padding: '1rem', textAlign: 'center' }}>
                        Failed to generate diagnosis. Please try again.
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="view-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Loader2 className="spin" size={48} color="var(--primary)" />
            </div>
        );
    }

    return (
        <div className="view-container animate-fade-in">
            <div className="page-header" style={{ paddingLeft: 0 }}>
                <h1 className="page-title">System Alerts ({alerts.length})</h1>
            </div>

            <div className="card" style={{ padding: 0 }}>
                {alerts.map(alert => (
                    <div key={alert.id} style={{
                        padding: '1.5rem',
                        borderBottom: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease'
                    }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        onClick={() => handleDiagnose(alert)}
                    >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                            {alert.severity === 'critical' ? (
                                <AlertTriangle color="var(--status-critical)" size={24} style={{ marginTop: '2px' }} />
                            ) : (
                                <Info color="var(--status-warning)" size={24} style={{ marginTop: '2px' }} />
                            )}
                            <div>
                                <div style={{ fontWeight: 600, color: 'var(--text-heading)', marginBottom: '4px', fontSize: '1.1rem' }}>
                                    {alert.device_name || alert.device_id}
                                </div>
                                <div style={{ color: 'var(--text-muted)' }}>{alert.message}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                {new Date(alert.created_at).toLocaleTimeString()}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontWeight: 600 }}>
                                AI Diagnosis <ChevronRight size={16} />
                            </div>
                        </div>
                    </div>
                ))}
                {alerts.length === 0 && (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        System status: Nominal. No active alerts.
                    </div>
                )}
            </div>

            {selectedAlert && (
                <>
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 999 }} onClick={() => setSelectedAlert(null)} />
                    {renderDiagnostic(selectedAlert)}
                </>
            )}
        </div>
    );
};

export default Alerts;
