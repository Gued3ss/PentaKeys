import { useState, createContext, useContext } from 'react';
import { AudioEngine } from '@/services/AudioEngine';

const AudioContext = createContext(null);

export const AudioProvider = ({ children }) => {
    const [engine] = useState(() => new AudioEngine());
    return <AudioContext.Provider value={engine}>{children}</AudioContext.Provider>;
};

export const useAudio = () => useContext(AudioContext);
