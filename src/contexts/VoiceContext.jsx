import React, { createContext, useState, useEffect, useCallback, useContext, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { sendVoiceCommand, actionToRoute, login } from '../services/voiceService';

const VoiceContext = createContext(null);

export const useVoice = () => useContext(VoiceContext);

export const VoiceProvider = ({ children }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [lastCommand, setLastCommand] = useState('');
    const [lastResponse, setLastResponse] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [recognition, setRecognition] = useState(null);
    const [backendAvailable, setBackendAvailable] = useState(true);

    const navigate = useNavigate();
    const location = useLocation();
    const locationRef = useRef(location.pathname);

    // Keep locationRef in sync
    useEffect(() => {
        locationRef.current = location.pathname;
    }, [location.pathname]);

    // Authenticate with backend on mount
    useEffect(() => {
        login().then(result => {
            setBackendAvailable(!!result);
        }).catch(() => {
            setBackendAvailable(false);
        });
    }, []);

    // Setup Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const rec = new SpeechRecognition();
            rec.continuous = false;
            rec.interimResults = true;
            rec.lang = 'en-US';

            rec.onresult = (event) => {
                let currentTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    currentTranscript += event.results[i][0].transcript;
                }
                setTranscript(currentTranscript);

                if (event.results[0].isFinal) {
                    handleCommand(currentTranscript);
                }
            };

            rec.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
                setError('Speech recognition failed. Try typing your command.');
            };

            rec.onend = () => {
                setIsListening(false);
            };

            setRecognition(rec);
        }
    }, []);

    const getCurrentView = useCallback(() => {
        const path = locationRef.current;
        if (path.includes('/dashboard')) return 'dashboard';
        if (path.includes('/map')) return 'map';
        if (path.includes('/inverters/')) return `device_${path.split('/inverters/')[1]}`;
        if (path.includes('/inverters')) return 'inverters';
        if (path.includes('/plants')) return 'plants';
        if (path.includes('/sensors')) return 'sensors';
        if (path.includes('/alerts')) return 'alerts';
        return 'dashboard';
    }, []);

    const handleCommand = useCallback(async (cmdText) => {
        const text = cmdText.trim();
        if (!text) return;

        setLastCommand(text);
        setIsProcessing(true);
        setError(null);

        try {
            // Send to backend voice API
            const response = await sendVoiceCommand(text, getCurrentView());
            setLastResponse(response);

            // Extract navigation action
            const route = actionToRoute(response.navigation_action);

            if (route) {
                navigate(route);
                speakFeedback(_getNavFeedback(response.intent, response.navigation_action));
            } else if (response.intent === 'UNKNOWN') {
                speakFeedback('Command not recognized. Please try again.');
            }

            // Update suggestions
            if (response.suggestions && response.suggestions.length > 0) {
                setSuggestions(response.suggestions);
            }

            // Clear transcript after delay
            setTimeout(() => setTranscript(''), 2000);
        } catch (err) {
            console.error('Voice command error:', err);
            setError('Failed to process command. Please try again.');
            // Fallback to local navigation
            _fallbackNavigate(text);
        } finally {
            setIsProcessing(false);
        }
    }, [navigate, getCurrentView]);

    const _fallbackNavigate = useCallback((text) => {
        const t = text.toLowerCase();
        if (t.includes('dashboard') || t.includes('home')) {
            navigate('/dashboard');
            speakFeedback('Returning to main dashboard');
        } else if (t.includes('alert')) {
            navigate('/alerts');
            speakFeedback('Showing system alerts');
        } else if (t.includes('map') || t.includes('plants')) {
            navigate('/map');
            speakFeedback('Opening plants map');
        } else if (t.includes('inverter')) {
            navigate('/inverters');
            speakFeedback('Showing inverters');
        } else if (t.includes('sensor')) {
            navigate('/sensors');
            speakFeedback('Opening sensors view');
        } else {
            speakFeedback('Command not recognized');
        }
    }, [navigate]);

    const toggleListening = () => {
        if (!recognition) return;

        if (isListening) {
            recognition.stop();
            setIsListening(false);
        } else {
            setTranscript('');
            setError(null);
            recognition.start();
            setIsListening(true);
        }
    };

    const speakFeedback = (message) => {
        if ('speechSynthesis' in window) {
            const msg = new SpeechSynthesisUtterance(message);
            msg.rate = 1.0;
            msg.pitch = 1.0;
            window.speechSynthesis.speak(msg);
        }
    };

    const submitTextCommand = (text) => {
        handleCommand(text);
    };

    const acceptSuggestion = (suggestion) => {
        const route = _suggestionToRoute(suggestion);
        if (route) {
            navigate(route);
            speakFeedback(`Opening ${suggestion.label}`);
            setSuggestions([]);
        }
    };

    const dismissSuggestions = () => {
        setSuggestions([]);
    };

    return (
        <VoiceContext.Provider value={{
            isListening,
            toggleListening,
            transcript,
            lastCommand,
            lastResponse,
            suggestions,
            isProcessing,
            error,
            backendAvailable,
            submitTextCommand,
            acceptSuggestion,
            dismissSuggestions,
        }}>
            {children}
        </VoiceContext.Provider>
    );
};

function _getNavFeedback(intent, action) {
    if (!action) return 'Navigating...';
    const params = action.params || {};

    switch (intent) {
        case 'OPEN_DASHBOARD': return 'Opening main dashboard';
        case 'OPEN_PLANT': return `Opening ${params.plant_name || 'plant view'}`;
        case 'OPEN_DEVICE': return `Opening ${params.device_name || 'device details'}`;
        case 'OPEN_ALERTS': return 'Showing system alerts';
        case 'OPEN_TELEMETRY': return `Showing telemetry for ${params.device_name || 'device'}`;
        case 'DIAGNOSE': return `Running AI diagnostic on ${params.device_name || 'device'}`;
        case 'GET_SUMMARY': return 'Getting dashboard summary';
        default: return 'Navigating...';
    }
}

function _suggestionToRoute(suggestion) {
    if (!suggestion || !suggestion.view) return null;
    const view = suggestion.view;

    if (view === 'dashboard') return '/dashboard';
    if (view === 'alerts') return '/alerts';
    if (view === 'map') return '/map';
    if (view === 'sensors') return '/sensors';
    if (view === 'inverters') return '/inverters';
    if (view.startsWith('alerts_device_')) return '/alerts';
    if (view.startsWith('diagnose_')) {
        const deviceId = view.replace('diagnose_', '');
        return `/inverters/${deviceId}`;
    }
    if (view.startsWith('plant_')) return '/plants';
    if (view.includes('_INV_')) return `/inverters/${view}`;
    return '/dashboard';
}
