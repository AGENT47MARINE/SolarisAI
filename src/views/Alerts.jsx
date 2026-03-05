import React, { useState } from 'react';
import { alertsData } from '../data/mockData';
import { AlertTriangle, Info, ShieldCheck, ChevronRight, X } from 'lucide-react';

const Alerts = () => {
    const [selectedAlert, setSelectedAlert] = useState(null);

    const renderDiagnostic = (alert) => {
        // Mocking an AI response
        let diagnosis = "";
        let recommendation = "";

        if (alert.device.includes("CHARANKA_INV")) {
            diagnosis = "The grid voltage has dropped below the operational threshold of 360V for Phase AB. Potential localized islanding event detected in the Charanka Solar Park sector.";
            recommendation = "1. Dispatch technician to check the AC breaker for CHARANKA_INV_03.\n2. Verify grid stability at the Gujarat secondary transformer.";
        } else if (alert.device.includes("BHADLA")) {
            diagnosis = "The IGBT temperature has risen to 52.2°C, which is above the 50°C safety margin. This is correlated with the ongoing desert heat wave in Rajasthan.";
            recommendation = "1. Check for dust accumulation on the inverter heat sinks.\n2. Ensure cooling fans are operating at 100% duty cycle.\n3. Monitor for the next 4 hours; if temp exceeds 55°C, curtail power.";
        } else if (alert.device.includes("PAVAGADA")) {
            diagnosis = "Critical Thermal Runaway Event. Core temperature has exceeded terminal thresholds (65.5°C). Immediate shutdown sequence initiated to prevent hardware damage at the Karnataka site.";
            recommendation = "1. Prio-1 Dispatch to Pavagada site immediately.\n2. Do NOT attempt restart until thermal imaging sweep is completed.";
        } else {
            diagnosis = "Communication timeout from the multi-function meter or weather station sensor due to RS485 Loop Error.";
            recommendation = "1. Check RS485 loop connection.\n2. Verify power supply to the datalogger.";
        }

        return (
            <div className="glass-panel" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000, width: '600px', padding: '2rem' }}>
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
                    <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{alert.device} - {alert.message}</div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '8px' }}>Root Cause Analysis</h4>
                    <p style={{ lineHeight: '1.6', color: 'var(--text-heading)' }}>{diagnosis}</p>
                </div>

                <div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--status-normal)', marginBottom: '8px' }}>Recommended Actions</h4>
                    <pre style={{ fontFamily: 'var(--font-base)', lineHeight: '1.6', color: 'var(--text-heading)', whiteSpace: 'pre-wrap' }}>
                        {recommendation}
                    </pre>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                        Generate Work Order
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="view-container">
            <div className="page-header" style={{ paddingLeft: 0 }}>
                <h1 className="page-title">System Alerts</h1>
            </div>

            <div className="card" style={{ padding: 0 }}>
                {alertsData.map(alert => (
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
                        onClick={() => setSelectedAlert(alert)}
                    >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                            {alert.type === 'critical' ? (
                                <AlertTriangle color="var(--status-critical)" size={24} style={{ marginTop: '2px' }} />
                            ) : (
                                <Info color="var(--status-warning)" size={24} style={{ marginTop: '2px' }} />
                            )}
                            <div>
                                <div style={{ fontWeight: 600, color: 'var(--text-heading)', marginBottom: '4px', fontSize: '1.1rem' }}>{alert.device}</div>
                                <div style={{ color: 'var(--text-muted)' }}>{alert.message}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{alert.time}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontWeight: 600 }}>
                                AI Diagnosis <ChevronRight size={16} />
                            </div>
                        </div>
                    </div>
                ))}
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
