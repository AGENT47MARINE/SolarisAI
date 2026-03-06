import React, { useState } from 'react';
import { Mic, MicOff, Send, Loader2, Zap, X } from 'lucide-react';
import { useVoice } from '../contexts/VoiceContext';
import './VoiceWidget.css';

const VoiceWidget = () => {
    const {
        isListening,
        toggleListening,
        transcript,
        lastCommand,
        lastResponse,
        suggestions,
        isProcessing,
        error,
        submitTextCommand,
        acceptSuggestion,
        dismissSuggestions,
    } = useVoice();

    const [textInput, setTextInput] = useState('');
    const [expanded, setExpanded] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (textInput.trim()) {
            submitTextCommand(textInput);
            setTextInput('');
        }
    };

    return (
        <div className={`voice-widget-container ${expanded ? 'expanded' : ''}`}>
            {/* Suggestion Chips */}
            {suggestions.length > 0 && (
                <div className="suggestion-chips glass-panel animate-fade-in">
                    <div className="suggestion-header">
                        <Zap size={14} className="pulse-primary" />
                        <span>Suggested next steps</span>
                        <button className="dismiss-btn" onClick={dismissSuggestions}>
                            <X size={14} />
                        </button>
                    </div>
                    {suggestions.map((s, i) => (
                        <button
                            key={i}
                            className="suggestion-chip"
                            onClick={() => acceptSuggestion(s)}
                        >
                            <span className="chip-label">{s.label}</span>
                            <span className="chip-prob">{Math.round(s.probability * 100)}%</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Processing Indicator */}
            {isProcessing && (
                <div className="processing-indicator animate-fade-in glass-panel">
                    <Loader2 size={18} className="spin" />
                    <span>Processing command...</span>
                </div>
            )}

            {/* Visual Feedback for Listening */}
            {isListening && (
                <div className="listening-indicator animate-fade-in">
                    <div className="waves">
                        <span></span><span></span><span></span>
                    </div>
                    <p className="transcript-live">{transcript || "Listening..."}</p>
                </div>
            )}

            {/* Error feedback */}
            {error && !isListening && !isProcessing && (
                <div className="error-feedback animate-fade-in">
                    <p>{error}</p>
                </div>
            )}

            {/* Last Command + Intent Feedback */}
            {!isListening && !isProcessing && lastResponse && !expanded && (
                <div className="last-command animate-fade-in tooltip glass-panel">
                    <span className="intent-badge">{lastResponse.intent}</span>
                    <span className="command-text">"{lastCommand}"</span>
                    {lastResponse.latency_ms > 0 && (
                        <span className="latency">{lastResponse.latency_ms}ms</span>
                    )}
                </div>
            )}

            {/* Main Controls */}
            <div className="voice-controls glass-panel">
                <button
                    className={`mic-btn ${isListening ? 'active pulse-primary' : ''} ${isProcessing ? 'processing' : ''}`}
                    onClick={toggleListening}
                    disabled={isProcessing}
                    title={isListening ? "Stop listening" : "Start Voice Command"}
                >
                    {isProcessing ? (
                        <Loader2 size={24} className="spin" />
                    ) : isListening ? (
                        <MicOff size={24} />
                    ) : (
                        <Mic size={24} />
                    )}
                </button>

                <button className="expand-btn text-muted" onClick={() => setExpanded(!expanded)}>
                    {expanded ? 'Hide' : 'Type'}
                </button>

                {expanded && (
                    <form onSubmit={handleSubmit} className="text-command-form animate-fade-in">
                        <input
                            type="text"
                            placeholder="e.g. 'show inverter 3' or 'run diagnostic'"
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            className="command-input"
                            autoFocus
                        />
                        <button type="submit" className="send-btn" disabled={isProcessing}>
                            <Send size={18} />
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default VoiceWidget;
