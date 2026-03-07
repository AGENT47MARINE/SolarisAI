import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import { AlertTriangle, Info, ShieldCheck, ChevronRight, X, Sparkles, Loader2 } from 'lucide-react';
import './Alerts.css';

const Alerts = () => {
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const data = await apiService.getAlerts();
                setAlerts(data);
                setLoading(false);
            } catch (err) {
                console.error("Alerts fetch error:", err);
                setLoading(false);
            }
        };
        fetchAlerts();
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <Loader2 className="animate-spin" size={48} color="var(--primary)" />
        </div>
    );

    const renderDiagnostic = (alert) => {
        // Mocking an AI response
        let diagnosis = "";
        let recommendation = "";

        if (alert.device_id?.includes("CHARANKA_INV")) {
            diagnosis = "The grid voltage has dropped below the operational threshold of 360V for Phase AB. Potential localized islanding event detected in the Charanka Solar Park sector.";
            recommendation = "1. Dispatch technician to check the AC breaker for CHARANKA_INV_03.\n2. Verify grid stability at the Gujarat secondary transformer.";
        } else if (alert.device_id?.includes("BHADLA")) {
            diagnosis = "The IGBT temperature has risen to 52.2°C, which is above the 50°C safety margin. This is correlated with the ongoing desert heat wave in Rajasthan.";
            recommendation = "1. Check for dust accumulation on the inverter heat sinks.\n2. Ensure cooling fans are operating at 100% duty cycle.\n3. Monitor for the next 4 hours; if temp exceeds 55°C, curtail power.";
        } else if (alert.device_id?.includes("PAVAGADA")) {
            diagnosis = "Critical Thermal Runaway Event. Core temperature has exceeded terminal thresholds (65.5°C). Immediate shutdown sequence initiated to prevent hardware damage at the Karnataka site.";
            recommendation = "1. Priority 1 Dispatch to Pavagada site immediately.\n2. Do NOT attempt restart until thermal imaging sweep is completed.";
        } else {
            diagnosis = "Communication timeout from the multi-function meter or weather station sensor due to RS485 Loop Error.";
            recommendation = "1. Check RS485 loop connection.\n2. Verify power supply to the datalogger.";
        }

        return (
            <div className="ai-diag-modal animate-fade-in">
                <div className="modal-header">
                    <div className="modal-title-area">
                        <div className="modal-icon-bg">
                            <Sparkles size={24} color="var(--primary)" />
                        </div>
                        <h2 className="modal-title">AI Fault Diagnosis</h2>
                    </div>
                    <button className="close-btn" onClick={() => setSelectedAlert(null)}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-context">
                    <div className="section-label">Event Context Log</div>
                    <div className="context-text">{alert.device_id} — {alert.message}</div>
                </div>

                <div className="modal-section">
                    <h4 className="section-label primary">Root Cause Analysis</h4>
                    <p className="rca-text">{diagnosis}</p>
                </div>

                <div className="modal-section" style={{ marginBottom: 0 }}>
                    <h4 className="section-label success">Recommended Actions</h4>
                    <div className="recommendation-box">
                        {recommendation}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="action-btn">
                        Generate Work Order
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="alerts-view animate-fade-in">
            <div className="alerts-header">
                <h1 className="alerts-title">System Alerts</h1>
            </div>

            <div className="alerts-card">
                {alerts.map(alert => (
                    <div key={alert.id} className="alert-row" onClick={() => setSelectedAlert(alert)}>
                        <div className="alert-content-left">
                            <div className="alert-icon-wrap">
                                {alert.severity === 'critical' ? (
                                    <AlertTriangle color="var(--status-critical)" size={24} />
                                ) : (
                                    <Info color="var(--status-warning)" size={24} />
                                )}
                            </div>
                            <div>
                                <div className="alert-device">{alert.device_id}</div>
                                <div className="alert-msg">{alert.message}</div>
                            </div>
                        </div>

                        <div className="alert-content-right">
                            <span className="alert-time">{new Date(alert.created_at).toLocaleTimeString()}</span>
                            <div className="ai-diag-trigger">
                                AI Diagnosis <ChevronRight size={16} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedAlert && (
                <>
                    <div className="modal-overlay" onClick={() => setSelectedAlert(null)} />
                    {renderDiagnostic(selectedAlert)}
                </>
            )}
        </div>
    );
};

export default Alerts;
