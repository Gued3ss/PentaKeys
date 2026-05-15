import { useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { useAudio } from '@/contexts/AudioContext';
import { useGameEngine } from '@/hooks/useGameEngine';
import { generateSession } from '@/engine/generator';
import { LoadingScreen } from '@/screens/LoadingScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { GameScreen } from '@/screens/GameScreen';

export default function App() {
    const { t } = useI18n();
    const [screen, setScreen] = useState('home');
    const [config, setConfig] = useState({
        clef: 'treble', keySig: 'C', numExercises: 10, range: 'small',
        types: ['single_note', 'guided_interval', 'match_pairs_single']
    });

    const engine = useGameEngine(config, () => setScreen('home'));
    const audioEngine = useAudio();

    const handleStart = async () => {
        if (config.types.length === 0) { alert(t('select_one')); return; }

        setScreen('loading');

        try {
            await audioEngine.init();
            const generatedQueue = generateSession(config);
            engine.start(generatedQueue);
            setScreen('playing');
        } catch (e) {
            console.error("Erro na inicialização:", e);
            alert(t('err_audio'));
            setScreen('home');
        }
    };

    if (screen === 'loading') {
        return <LoadingScreen />;
    }

    if (screen === 'home') {
        return <HomeScreen config={config} setConfig={setConfig} onStart={handleStart} />;
    }

    return <GameScreen engine={engine} onQuit={() => setScreen('home')} />;
}
