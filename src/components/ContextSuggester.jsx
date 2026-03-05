import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Lightbulb, X } from 'lucide-react';
import { useVoice } from '../contexts/VoiceContext';

const ContextSuggester = () => {
    const location = useLocation();
    const { submitTextCommand } = useVoice();
    const [suggestion, setSuggestion] = useState(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Generate context based on route
        setVisible(false);

        setTimeout(() => {
            const path = location.pathname;
            if (path.includes('/dashboard')) {
                setSuggestion({
                    text: "Would you like to review the underperforming inverters?",
                    action: "show inverters"
                });
            } else if (path.includes('/inverters/')) {
                setSuggestion({
                    text: "Should I show recent alerts for this inverter?",
                    action: "show alerts"
                });
            } else if (path === '/inverters') {
                setSuggestion({
                    text: "Do you want to check the thermal fault at Pavagada Solar Park?",
                    action: "open pavagada"
                });
            } else if (path.includes('/alerts')) {
                setSuggestion({
                    text: "Do you want to run an AI diagnostic on these alerts?",
                    action: "run diagnostic"
                });
            } else if (path.includes('/sensors')) {
                setSuggestion({
                    text: "Should I show the current radiation data?",
                    action: "show radiation"
                });
            } else {
                setSuggestion(null);
            }

            if (suggestion) setVisible(true);
        }, 1000);
    }, [location.pathname]);

    if (!visible || !suggestion) return null;

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
            zIndex: 900
        }}>
            <div style={{ color: 'var(--primary)' }}>
                <Lightbulb size={24} className="pulse-primary" />
            </div>
            <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{suggestion.text}</p>
                <button
                    onClick={() => {
                        submitTextCommand(suggestion.action);
                        setVisible(false);
                    }}
                    style={{
                        background: 'var(--primary)',
                        color: 'var(--bg-dark)',
                        border: 'none',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    Yes, {suggestion.action}
                </button>
            </div>
            <button
                onClick={() => setVisible(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', alignSelf: 'flex-start' }}
            >
                <X size={16} />
            </button>
        </div>
    );
};

export default ContextSuggester;
