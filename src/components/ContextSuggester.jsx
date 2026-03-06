import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Lightbulb, X } from 'lucide-react';
import { useVoice } from '../contexts/VoiceContext';

const ContextSuggester = () => {
    const location = useLocation();
    const { suggestions, acceptSuggestion, dismissSuggestions, lastResponse } = useVoice();
    const [localSuggestion, setLocalSuggestion] = useState(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // If we have AI-powered suggestions from the voice response, don't show local ones
        if (suggestions && suggestions.length > 0) {
            setVisible(false);
            return;
        }

        // Generate context-based suggestion on route change
        setVisible(false);
        const timer = setTimeout(() => {
            const path = location.pathname;
            let suggestion = null;

            if (path.includes('/dashboard')) {
                suggestion = {
                    text: "Would you like to review the underperforming inverters?",
                    action: "show inverters",
                    view: "inverters",
                    label: "View all inverters",
                    probability: 0.65,
                };
            } else if (path.match(/\/inverters\/\w+/)) {
                suggestion = {
                    text: "Should I run an AI diagnostic on this inverter?",
                    action: "run diagnostic",
                    view: "diagnose",
                    label: "Run AI diagnostic",
                    probability: 0.72,
                };
            } else if (path === '/inverters') {
                suggestion = {
                    text: "Do you want to check the thermal fault at Pavagada Solar Park?",
                    action: "open pavagada",
                    view: "device_PAVAGADA_INV_02",
                    label: "Check Pavagada inverter",
                    probability: 0.68,
                };
            } else if (path.includes('/alerts')) {
                suggestion = {
                    text: "Want to diagnose the device with the most critical alerts?",
                    action: "diagnose critical",
                    view: "diagnose",
                    label: "Diagnose critical alerts",
                    probability: 0.60,
                };
            } else if (path.includes('/sensors')) {
                suggestion = {
                    text: "Should I compare irradiance data across plants?",
                    action: "show dashboard",
                    view: "dashboard",
                    label: "View comparison dashboard",
                    probability: 0.55,
                };
            }

            setLocalSuggestion(suggestion);
            if (suggestion) setVisible(true);
        }, 2500);

        return () => clearTimeout(timer);
    }, [location.pathname, suggestions]);

    if (!visible || !localSuggestion) return null;

    return (
        <div className="context-suggester animate-fade-in glass-panel" style={{
            position: 'absolute',
            bottom: '120px',
            right: '2.5rem',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            maxWidth: '350px',
            borderLeft: '3px solid var(--primary)',
            zIndex: 900,
            borderRadius: '12px',
        }}>
            <div style={{ color: 'var(--primary)' }}>
                <Lightbulb size={24} className="pulse-primary" />
            </div>
            <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                    {localSuggestion.text}
                </p>
                <button
                    onClick={() => {
                        acceptSuggestion(localSuggestion);
                        setVisible(false);
                    }}
                    style={{
                        background: 'var(--primary)',
                        color: 'var(--bg-dark)',
                        border: 'none',
                        padding: '4px 14px',
                        borderRadius: '12px',
                        fontSize: '0.78rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                    }}
                >
                    Yes, {localSuggestion.action}
                </button>
            </div>
            <button
                onClick={() => setVisible(false)}
                style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    alignSelf: 'flex-start',
                    padding: '2px',
                }}
            >
                <X size={16} />
            </button>
        </div>
    );
};

export default ContextSuggester;
