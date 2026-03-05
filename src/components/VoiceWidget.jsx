import React, { useState } from 'react';
import { Mic, MicOff, Send } from 'lucide-react';
import { useVoice } from '../contexts/VoiceContext';
import './VoiceWidget.css';

const VoiceWidget = () => {
    const { isListening, toggleListening, transcript, lastCommand, submitTextCommand } = useVoice();
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
            {/* Visual Feedback for Listening */}
            {isListening && (
                <div className="listening-indicator animate-fade-in">
                    <div className="waves">
                        <span></span><span></span><span></span>
                    </div>
                    <p className="transcript-live">{transcript || "Listening..."}</p>
                </div>
            )}

            {/* Last Command Feedback */}
            {!isListening && lastCommand && !expanded && (
                <div className="last-command animate-fade-in tooltip">
                    " {lastCommand} "
                </div>
            )}

            {/* Main Controls */}
            <div className="voice-controls glass-panel">
                <button
                    className={`mic-btn ${isListening ? 'active pulse-primary' : ''}`}
                    onClick={toggleListening}
                    title={isListening ? "Stop listening" : "Start Voice Command"}
                >
                    {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                </button>

                <button className="expand-btn text-muted" onClick={() => setExpanded(!expanded)}>
                    {expanded ? 'Hide Text Input' : 'Type Command'}
                </button>

                {expanded && (
                    <form onSubmit={handleSubmit} className="text-command-form animate-fade-in">
                        <input
                            type="text"
                            placeholder="e.g. 'show plant map'"
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            className="command-input"
                        />
                        <button type="submit" className="send-btn">
                            <Send size={18} />
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default VoiceWidget;
