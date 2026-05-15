import { useState, useEffect } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { useAudio } from '@/contexts/AudioContext';
import { getClefForNote, getPianoKey } from '@/engine/musicMath';
import { ScoreRenderer } from '@/components/score/ScoreRenderer';
import { MiniKeyboard } from '@/components/piano/MiniKeyboard';
import { IconArrowRight } from '@/components/ui/Icons';

export function ExerciseMultipleChoice({ exercise, onNext, onRetry }) {
    const { t } = useI18n();
    const audioEngine = useAudio();
    const [selectedOption, setSelectedOption] = useState(null);
    const [status, setStatus] = useState('idle');

    useEffect(() => {
        setSelectedOption(null); setStatus('idle');
    }, [exercise.id]);

    const handleOptionClick = (option) => {
        if (status !== 'idle') return;
        setSelectedOption(option);

        const soundNote = exercise.type === 'mc_keys_to_staff' ? getPianoKey(option, exercise.keySig) : option;
        audioEngine.playNote(soundNote);

        if (option === exercise.expectedAnswer) {
            setStatus('success');
        } else {
            setStatus('error');
            onRetry(exercise);
            setTimeout(() => { setStatus('idle'); setSelectedOption(null); }, 1500);
        }
    };

    return (
        <main className="flex-1 flex flex-col items-center justify-center p-4 min-h-[300px] relative w-full">
            <h2 className="text-xl md:text-2xl font-bold text-stone-200 mb-6 text-center min-h-[2rem]">
                {t(exercise.instruction)}
            </h2>
            <div className={`w-full max-w-sm md:max-w-md bg-themeCard border-2 rounded-3xl shadow-lg flex flex-col items-center justify-center p-4 md:p-6 transition-all duration-300 aspect-[4/3]
                ${status === 'error' ? 'border-themeError animate-shake' : ''}
                ${status === 'success' ? 'border-themeSuccess' : 'border-stone-700'}
            `}>
                {exercise.type === 'mc_keys_to_staff' ? (
                    <div className="w-full h-full flex items-center justify-center"><MiniKeyboard highlightedNotes={[exercise.questionKey]} /></div>
                ) : (
                    <ScoreRenderer key={exercise.id} clef={exercise.clef} keySig={exercise.keySig} visualNotes={exercise.visualNotes} />
                )}
            </div>

            <div className="w-full max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-4 mt-4">
                {exercise.options.map((opt, i) => {
                    const isSelected = selectedOption === opt;
                    const isCorrect = opt === exercise.expectedAnswer;

                    let btnClass = "bg-themeCard border-2 border-stone-600 shadow-[0_4px_0_#57534e] hover:bg-stone-700";
                    if (status === 'success' && isSelected) btnClass = "bg-stone-800 border-2 border-themeSuccess shadow-[0_4px_0_#0891b2]";
                    else if (status === 'error') {
                        if (isSelected) btnClass = "bg-stone-800 border-2 border-themeError shadow-[0_4px_0_#b91c1c] animate-shake";
                        else if (isCorrect) btnClass = "bg-stone-800 border-2 border-themeSuccess shadow-[0_4px_0_#0891b2]";
                    }

                    return (
                        <button key={i} onClick={() => handleOptionClick(opt)} disabled={status !== 'idle'}
                            className={`relative rounded-2xl p-4 flex items-center justify-center transition-all active:translate-y-1 active:shadow-none aspect-[4/3] ${btnClass}`}>
                            {exercise.type === 'mc_staff_to_keys'
                                ? <MiniKeyboard highlightedNotes={[opt]} />
                                : <ScoreRenderer visualNotes={[[{ keys: [opt], clef: getClefForNote(opt, exercise.clef) }]]} clef={exercise.clef} keySig={exercise.keySig} isMini={true} />
                            }
                        </button>
                    );
                })}
            </div>
            <div className="h-16 mt-2 flex items-center justify-center w-full">
                {status === 'success' && (
                    <button onClick={onNext} className="bg-themeSuccess hover:bg-themeSuccessDark text-white p-4 rounded-2xl shadow-[0_4px_0_#0891b2] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 font-bold uppercase tracking-wider">
                        {t('continue')} <IconArrowRight />
                    </button>
                )}
            </div>
        </main>
    );
}
