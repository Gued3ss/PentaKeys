import { useState, useEffect, useMemo } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { useAudio } from '@/contexts/AudioContext';
import { shuffleArray } from '@/engine/musicMath';
import { ScoreRenderer } from '@/components/score/ScoreRenderer';
import { MiniKeyboard } from '@/components/piano/MiniKeyboard';
import { AbstractPiano } from '@/components/piano/AbstractPiano';
import { AbstractStaff } from '@/components/score/AbstractStaff';
import { IconArrowRight } from '@/components/ui/Icons';

export function ExerciseMatchPairs({ exercise, onNext, onRetry }) {
    const { t } = useI18n();
    const audioEngine = useAudio();
    const leftCol = useMemo(() => shuffleArray(exercise.pairs), [exercise]);
    const rightCol = useMemo(() => shuffleArray(exercise.pairs), [exercise]);

    // Decide aleatoriamente se a esquerda é Piano (true) ou Partitura (false)
    const isLeftPiano = useMemo(() => Math.random() > 0.5, [exercise.id]);

    const [selectedLeft, setSelectedLeft] = useState(null);
    const [selectedRight, setSelectedRight] = useState(null);
    const [matchedIds, setMatchedIds] = useState([]);
    const [errorIds, setErrorIds] = useState([]);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        setSelectedLeft(null); setSelectedRight(null); setMatchedIds([]); setErrorIds([]); setIsComplete(false);
    }, [exercise.id]);

    useEffect(() => {
        if (selectedLeft && selectedRight) {
            if (selectedLeft === selectedRight) {
                audioEngine.playChord(exercise.pairs.find(p => p.id === selectedLeft).keys);
                setMatchedIds(prev => {
                    const newMatched = [...prev, selectedLeft];
                    if (newMatched.length === exercise.pairs.length) setIsComplete(true);
                    return newMatched;
                });
                setSelectedLeft(null);
                setSelectedRight(null);
            } else {
                setErrorIds([selectedLeft, selectedRight]);
                onRetry(exercise);
                setTimeout(() => {
                    setSelectedLeft(null);
                    setSelectedRight(null);
                    setErrorIds([]);
                }, 600);
            }
        }
    }, [selectedLeft, selectedRight]);

    const getBtnClass = (id, isLeft) => {
        const isSelected = isLeft ? selectedLeft === id : selectedRight === id;
        const isMatched = matchedIds.includes(id);
        const isError = errorIds.includes(id);

        if (isMatched) return "bg-stone-800 border-themeSuccess opacity-50 scale-95";
        if (isError && isSelected) return "bg-red-900 border-themeError animate-shake";
        if (isSelected) return "bg-stone-700 border-themePrimary scale-105 shadow-lg";
        return "bg-themeCard border-stone-600 hover:bg-stone-700";
    };

    return (
        <main className="flex-1 flex flex-col items-center justify-center p-4 min-h-[300px] relative w-full">
            <h2 className="text-xl md:text-2xl font-bold text-stone-200 mb-6 text-center min-h-[2rem]">
                {t(exercise.instruction)}
            </h2>
            <div className="w-full max-w-4xl mx-auto grid grid-cols-2 gap-4 md:gap-6 p-2 md:p-4">
                <div className="flex flex-col gap-4 md:gap-6">
                    {leftCol.map(pair => (
                        <button key={`l_${pair.id}`}
                            disabled={matchedIds.includes(pair.id)}
                            onClick={() => { if (!selectedLeft) { setSelectedLeft(pair.id); audioEngine.playChord(pair.keys); } }}
                            className={`relative overflow-hidden rounded-2xl p-3 md:p-5 border-2 transition-all duration-200 aspect-[4/3] flex items-center justify-center ${getBtnClass(pair.id, true)}`}>
                            {isLeftPiano ? (
                                exercise.type === 'match_pairs_abstract' ? <AbstractPiano notes={pair.notes} /> : <MiniKeyboard highlightedNotes={pair.keys} />
                            ) : (
                                exercise.type === 'match_pairs_abstract' ? <AbstractStaff notes={pair.notes} isStacked={pair.isStacked} /> : <ScoreRenderer visualNotes={[[{ keys: pair.notes, clef: exercise.clef }]]} clef={exercise.clef} keySig={exercise.keySig} isMini={true} />
                            )}
                        </button>
                    ))}
                </div>
                <div className="flex flex-col gap-4 md:gap-6">
                    {rightCol.map(pair => (
                        <button key={`r_${pair.id}`}
                            disabled={matchedIds.includes(pair.id)}
                            onClick={() => { if (!selectedRight) setSelectedRight(pair.id); }}
                            className={`relative overflow-hidden rounded-2xl p-3 md:p-5 border-2 transition-all duration-200 aspect-[4/3] flex items-center justify-center ${getBtnClass(pair.id, false)}`}>
                            {!isLeftPiano ? (
                                exercise.type === 'match_pairs_abstract' ? <AbstractPiano notes={pair.notes} /> : <MiniKeyboard highlightedNotes={pair.keys} />
                            ) : (
                                exercise.type === 'match_pairs_abstract' ? <AbstractStaff notes={pair.notes} /> : <ScoreRenderer visualNotes={[[{ keys: pair.notes, clef: exercise.clef }]]} clef={exercise.clef} keySig={exercise.keySig} isMini={true} />
                            )}
                        </button>
                    ))}
                </div>
            </div>
            <div className="h-16 mt-4 flex items-center justify-center w-full">
                {isComplete && (
                    <button onClick={onNext} className="bg-themeSuccess hover:bg-themeSuccessDark text-white p-4 rounded-2xl shadow-[0_4px_0_#0891b2] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 font-bold uppercase tracking-wider">
                        {t('continue')} <IconArrowRight />
                    </button>
                )}
            </div>
        </main>
    );
}
