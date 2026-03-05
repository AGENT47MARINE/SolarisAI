import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const VoiceContext = createContext(null);

export const useVoice = () => useContext(VoiceContext);

export const VoiceProvider = ({ children }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [lastCommand, setLastCommand] = useState('');
    const [recognition, setRecognition] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        // Setup Speech Recognition
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
                    setTimeout(() => setTranscript(''), 2000);
                }
            };

            rec.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };

            rec.onend = () => {
                setIsListening(false);
            };

            setRecognition(rec);
        } else {
            console.warn("Speech Recognition API not supported in this browser.");
        }
    }, []);

    const handleCommand = useCallback((cmdText) => {
        const text = cmdText.toLowerCase().trim();
        setLastCommand(cmdText);

        // Simple Intent Parser mapping to live dashboard routes
        if (text.includes('map') || text.includes('plants')) {
            navigate('/map');
            speakFeedback('Opening plants map view');
        } else if (text.includes('inverters') || text.includes('all inverters')) {
            navigate('/inverters');
            speakFeedback('Showing all inverters');
        } else if (text.includes('sensors') || text.includes('weather') || text.includes('mfm')) {
            navigate('/sensors');
            speakFeedback('Opening sensors view');
        } else if (text.includes('bhadla') || text.includes('rajasthan') || (text.includes('inverter') && text.includes('1'))) {
            navigate('/inverters/1'); // BHADLA_INV_01
            speakFeedback('Opening diagnostics for Bhadla Solar Park Inverter');
        } else if (text.includes('kamuthi') || text.includes('tamil nadu') || (text.includes('inverter') && text.includes('2'))) {
            navigate('/inverters/2'); // KAMUTHI_INV_05
            speakFeedback('Opening diagnostics for Kamuthi Inverter');
        } else if (text.includes('charanka') || text.includes('gujarat') || (text.includes('inverter') && text.includes('3'))) {
            navigate('/inverters/4'); // CHARANKA_INV_03
            speakFeedback('Opening diagnostics for Charanka Solar Park Inverter');
        } else if (text.includes('pavagada') || text.includes('karnataka') || text.includes('thermal')) {
            navigate('/inverters/6'); // PAVAGADA_INV_02
            speakFeedback('Opening diagnostics for Pavagada thermal fault');
        } else if (text.includes('dashboard') || text.includes('home')) {
            navigate('/dashboard');
            speakFeedback('Returning to main dashboard');
        } else if (text.includes('alerts') || text.includes('warnings')) {
            navigate('/alerts');
            speakFeedback('Showing system alerts');
        } else if (text.includes('production') && text.includes('today')) {
            speakFeedback('Today\'s production is 5,714 kilowatt hours');
        } else {
            speakFeedback('Command not recognized. Please try again.');
        }
    }, [navigate]);

    const toggleListening = () => {
        if (!recognition) return;

        if (isListening) {
            recognition.stop();
            setIsListening(false);
        } else {
            setTranscript('');
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

    // Allow manual text commands as fallback
    const submitTextCommand = (text) => {
        handleCommand(text);
    };

    return (
        <VoiceContext.Provider value={{ isListening, toggleListening, transcript, lastCommand, submitTextCommand }}>
            {children}
        </VoiceContext.Provider>
    );
};
