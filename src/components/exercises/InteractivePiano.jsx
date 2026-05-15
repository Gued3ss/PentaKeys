import { useState, useEffect } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { useAudio } from '@/contexts/AudioContext';
import { ScoreRenderer } from '@/components/score/ScoreRenderer';
import { VirtualPiano } from '@/components/piano/VirtualPiano';
import { IconArrowRight } from '@/components/ui/Icons';

export function ExerciseInteractivePiano({ exercise, onNext, onRetry }) {
    const { t } = useI18n();
    const audioEngine = useAudio();
    const [userInput, setUserInput] = useState([]);
    const [correctKeys, setCorrectKeys] = useState([]);
    const [wrongKeys, setWrongKeys] = useState([]);
    const [status, setStatus] = useState('idle');
    const [hasCrashed, setHasCrashed] = useState(false);

    useEffect(() => {
        setUserInput([]); setCorrectKeys([]); setWrongKeys([]); setStatus('idle'); setHasCrashed(false);
    }, [exercise.id]);

    const handleKeyPress = (note) => {
        if (status !== 'idle') return;
        audioEngine.playNote(note);

        const newUserInput = [...userInput, note];
        setUserInput(newUserInput);
        const expected = exercise.expectedKeys;

        if (exercise.type === 'chord') {
            if (newUserInput.length === expected.length) {
                setStatus('evaluating');
                const sortedInput = [...newUserInput].sort();
                const sortedExpected = [...expected].sort();
                const isCorrect = JSON.stringify(sortedInput) === JSON.stringify(sortedExpected);

                if (isCorrect) {
                    setCorrectKeys(expected);
                    setStatus('success');
                } else {
                    setCorrectKeys(newUserInput.filter(k => expected.includes(k)));
                    setWrongKeys(newUserInput.filter(k => !expected.includes(k)));
                    onRetry(exercise);
                    setTimeout(() => { setStatus('idle'); setUserInput([]); setCorrectKeys([]); setWrongKeys([]); }, 1000);
                }
            }
        } else {
            const step = newUserInput.length - 1;
            if (newUserInput[step] !== expected[step]) {
                setStatus('evaluating');
                setCorrectKeys(newUserInput.slice(0, -1));
                setWrongKeys([note]);
                onRetry(exercise);
                setTimeout(() => { setStatus('idle'); setUserInput([]); setCorrectKeys([]); setWrongKeys([]); }, 1000);
            } else if (newUserInput.length === expected.length) {
                setStatus('evaluating');
                setCorrectKeys(expected);
                setStatus('success');
            }
        }
    };

    return (
        <>
            <main className="flex-1 flex flex-col items-center justify-center p-4 min-h-[300px] relative w-full">
                <h2 className="text-xl md:text-2xl font-bold text-stone-200 mb-6 text-center min-h-[2rem]">
                    {t(exercise.instruction)}
                </h2>
                <div className={`w-full max-w-sm md:max-w-md bg-themeCard border-2 rounded-3xl shadow-lg flex flex-col items-center justify-center p-4 md:p-6 transition-all duration-300 aspect-[4/3]
                    ${status === 'error' ? 'border-themeError animate-shake' : ''}
                    ${status === 'success' ? 'border-themeSuccess' : 'border-stone-700'}
                `}>
                    {hasCrashed ? (
                        <div className="text-center">
                            <p className="text-themeError mb-4">{t('err_score')}</p>
                            <button onClick={onNext} className="bg-stone-700 px-4 py-2 rounded-lg">{t('skip_ex')}</button>
                        </div>
                    ) : (
                        <ScoreRenderer key={exercise.id} clef={exercise.clef} keySig={exercise.keySig} visualNotes={exercise.visualNotes} onCrash={() => setHasCrashed(true)} />
                    )}
                </div>
                <div className="h-16 mt-4 flex items-center justify-center w-full">
                    {status === 'success' ? (
                        <button onClick={onNext} className="bg-themeSuccess hover:bg-themeSuccessDark text-white p-4 rounded-2xl shadow-[0_4px_0_#0891b2] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 font-bold uppercase tracking-wider">
                            {t('continue')} <IconArrowRight />
                        </button>
                    ) : exercise.type === 'chord' && status === 'idle' ? (
                        <p className="text-themeHint text-sm font-medium animate-pulse">{t('select_keys', { n: exercise.expectedKeys.length })}</p>
                    ) : null}
                </div>
            </main>
            <footer className="w-full shrink-0 pb-safe">
                <VirtualPiano
                    onKeyPress={handleKeyPress}
                    selectedKeys={userInput}
                    correctKeys={correctKeys}
                    wrongKeys={wrongKeys}
                    hintKey={exercise.hintKey}
                    disabled={status === 'evaluating' || status === 'success' || status === 'error'}
                />
            </footer>
        </>
    );
}
