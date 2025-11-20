import React, { createContext, useState, useContext } from 'react';

const VoiceContext = createContext();

const initialPersona = {
    type: 'Farmer',
    icon: '🌾',
    problem: 'Crop price lookup & market advice',
};

export const VoiceProvider = ({ children }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcribedText, setTranscribedText] = useState('');
    const [aiReply, setAiReply] = useState('Tap the mic to ask EthioTalk for assistance in Amharic.');
    const [currentPersona, setCurrentPersona] = useState(initialPersona);
    const [statusMessage, setStatusMessage] = useState('Ready');
    const [showWave, setShowWave] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    
    const setTranscriptionResult = (text, reply, status) => {
        setTranscribedText(text);
        setAiReply(reply);
        setStatusMessage(status);
        setIsRecording(false);
        setShowWave(false);
        setIsThinking(false);
    };

    const value = {
        isRecording,
        setIsRecording,
        transcribedText,
        setTranscribedText,
        aiReply,
        setAiReply,
        currentPersona,
        setCurrentPersona,
        statusMessage,
        setStatusMessage,
        setTranscriptionResult,
        showWave,
        setShowWave,
        isThinking,
        setIsThinking,
    };

    return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>;
};

export const useVoice = () => useContext(VoiceContext);