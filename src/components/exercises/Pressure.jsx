import { useState, useEffect, useRef } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { useAudio } from '@/contexts/AudioContext';
import { ScoreRenderer } from '@/components/score/ScoreRenderer';
import { IconArrowRight, IconStep, IconSkip } from '@/components/ui/Icons';

export function ExercisePressure({ exercise, onNext }) {
    const { t } = useI18n();
    const audioEngine = useAudio();
    const [subRound, setSubRound] = useState(0);
    const [phase, setPhase] = useState('intro');
    const [timeLeft, setTimeLeft] = useState(100);
    const [showNote, setShowNote] = useState(true);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState(null);
    const [isSwapped, setIsSwapped] = useState(false);

    const timers = useRef([]);

    const clearTimers = () => {
        timers.current.forEach(id => { clearTimeout(id); clearInterval(id); });
        timers.current = [];
    };

    useEffect(() => {
        setSubRound(0); setPhase('intro'); setTimeLeft(100); setScore(0); setFeedback(null); setIsSwapped(false);
    }, [exercise.id]);

    useEffect(() => { return () => clearTimers(); }, []);

    useEffect(() => {
        clearTimers();

        if (phase === 'play') {
            setShowNote(true);
            setTimeLeft(100);

            const currentData = exercise.rounds[subRound];
            const isIntervalPressure = exercise.type === 'pressure_step_skip' || exercise.type === 'pressure_odd_even';

            // Só toca o som no início se NÃO for um exercício de intervalo (evita trapaça pelo ouvido)
            if (!isIntervalPressure) {
                if (currentData.soundKey) audioEngine.playNote(currentData.soundKey);
                if (currentData.soundKeys) audioEngine.playChord(currentData.soundKeys);
            }

            const isSingleNote = exercise.type === 'pressure_line_space';
            const flashDuration = isSingleNote ? 900 : 1800;

            const tHide = setTimeout(() => setShowNote(false), flashDuration);
            timers.current.push(tHide);

            const totalTime = 3000;
            const interval = 50;
            const step = (interval / totalTime) * 100;

            const tCount = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev - step <= 0) {
                        clearInterval(tCount);
                        handleAnswer('timeout');
                        return 0;
                    }
                    return prev - step;
                });
            }, interval);
            timers.current.push(tCount);
        }
        else if (phase === 'feedback') {
            const tNext = setTimeout(() => {
                setFeedback(null);

                // O embaralhamento acontece EXATAMENTE na virada do round,
                // quando as cores já foram resetadas.
                setIsSwapped(Math.random() > 0.5);

                if (subRound + 1 < 10) {
                    setSubRound(sr => sr + 1);
                    setPhase('play');
                } else {
                    setPhase('summary');
                }
            }, 1000);
            timers.current.push(tNext);
        }
    }, [phase, subRound]);

    const handleAnswer = (answer) => {
        if (phase !== 'play') return;
        clearTimers();
        const isCorrect = answer === exercise.rounds[subRound].expectedAnswer;

        if (isCorrect) {
            setScore(s => s + 1);

            // Toca o som como "recompensa" se acertar o intervalo
            const currentData = exercise.rounds[subRound];
            const isIntervalPressure = exercise.type === 'pressure_step_skip' || exercise.type === 'pressure_odd_even';
            if (isIntervalPressure) {
                if (currentData.soundKey) audioEngine.playNote(currentData.soundKey);
                if (currentData.soundKeys) audioEngine.playChord(currentData.soundKeys);
            }
        }

        setFeedback(isCorrect ? 'success' : 'error');
        setPhase('feedback');
    };

    const renderButtons = () => {
        const currentData = exercise.rounds[subRound];

        let btn1, btn2;
        if (exercise.type === 'pressure_line_space') {
            btn1 = { id: 'line', label: t('line'), icon: <div className="w-8 h-8 rounded-full border-4 border-white relative"><div className="absolute top-1/2 left-[-10px] right-[-10px] h-1 bg-white -translate-y-1/2"></div></div> };
            btn2 = { id: 'space', label: t('space'), icon: <div className="w-8 h-8 rounded-full border-4 border-white relative"><div className="absolute top-[-10px] left-[-10px] right-[-10px] h-1 bg-white"></div><div className="absolute bottom-[-10px] left-[-10px] right-[-10px] h-1 bg-white"></div></div> };
        } else if (exercise.type === 'pressure_odd_even') {
            btn1 = { id: 'odd', label: t('odd'), sub: t('odd_sub') };
            btn2 = { id: 'even', label: t('even'), sub: t('even_sub') };
        } else if (exercise.type === 'pressure_step_skip') {
            btn1 = { id: 'step', label: t('step'), sub: t('step_sub'), icon: <IconStep /> };
            btn2 = { id: 'skip', label: t('skip'), sub: t('skip_sub'), icon: <IconSkip /> };
        }

        const buttons = [btn1, btn2];

        return (
            <div className="w-full max-w-md mx-auto relative h-32 mt-8">
                {buttons.map((btn, idx) => {
                    let bgClass = "bg-themeCard border-stone-600 hover:bg-stone-700";
                    if (phase === 'feedback') {
                        if (btn.id === currentData.expectedAnswer) bgClass = "bg-themeSuccess border-themeSuccessDark";
                        else bgClass = "bg-themeError border-themeErrorDark opacity-50";
                    }

                    const isRightSide = isSwapped ? idx === 0 : idx === 1;
                    const positionClass = isRightSide ? 'left-[calc(50%+0.5rem)]' : 'left-0';

                    return (
                        <button key={btn.id} disabled={phase !== 'play'}
                            onPointerDown={(e) => { e.preventDefault(); handleAnswer(btn.id); }}
                            className={`absolute w-[calc(50%-0.5rem)] h-full rounded-2xl border-2 transition-all duration-500 ease-in-out flex flex-col items-center justify-center gap-2 ${positionClass} ${bgClass}`}>
                            {btn.icon && btn.icon}
                            <span className="font-bold text-xl text-white">{btn.label}</span>
                            {btn.sub && <span className="text-xs text-stone-400 text-center">{btn.sub}</span>}
                        </button>
                    );
                })}
            </div>
        );
    };

    if (phase === 'intro') {
        return (
            <main className="flex-1 flex flex-col items-center justify-center p-4 w-full">
                <h2 className="text-2xl font-bold text-white mb-4">{t(exercise.instruction)}</h2>
                <div className="bg-themeCard p-6 rounded-2xl border-2 border-stone-700 max-w-md text-center mb-8">
                    {exercise.type === 'pressure_line_space' && <p className="text-stone-300">{t('press_ls_desc')}</p>}
                    {exercise.type === 'pressure_odd_even' && <p className="text-stone-300">{t('press_oe_desc')}</p>}
                    {exercise.type === 'pressure_step_skip' && <p className="text-stone-300">{t('press_ss_desc')}</p>}

                    <p className="text-orange-400 font-bold mt-4">{t('press_warn1')}</p>
                    <p className="text-orange-400 font-bold mt-2">{t('press_warn2')}</p>
                </div>
                <button onClick={() => setPhase('play')} className="bg-themePrimary hover:bg-themePrimaryDark text-white p-4 px-8 rounded-2xl shadow-[0_4px_0_#9f1239] active:translate-y-1 active:shadow-none transition-all font-bold uppercase tracking-wider text-xl">
                    {t('press_start')}
                </button>
            </main>
        );
    }

    if (phase === 'summary') {
        return (
            <main className="flex-1 flex flex-col items-center justify-center p-4 w-full">
                <h2 className="text-3xl font-bold text-white mb-4">{t('press_end')}</h2>
                <div className="text-6xl font-black text-themeSuccess mb-8">{score}/10</div>
                <button onClick={onNext} className="bg-themeSuccess hover:bg-themeSuccessDark text-white p-4 px-8 rounded-2xl shadow-[0_4px_0_#0891b2] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 font-bold uppercase tracking-wider">
                    {t('continue')} <IconArrowRight />
                </button>
            </main>
        );
    }

    return (
        <main className="flex-1 flex flex-col items-center justify-center p-4 min-h-[300px] relative w-full overflow-hidden">
            <h2 className="text-xl md:text-2xl font-bold text-stone-200 mb-2 text-center">
                {t(exercise.instruction)}
            </h2>
            <p className="text-stone-500 font-bold mb-6">{t('round')} {subRound + 1} {t('of')} 10</p>

            <div key={subRound} className={`w-full max-w-sm md:max-w-md bg-themeCard border-2 rounded-3xl shadow-lg flex flex-col items-center justify-center p-4 md:p-6 transition-all duration-300 aspect-[4/3] animate-slideIn
                ${feedback === 'error' ? 'border-themeError animate-shake' : ''}
                ${feedback === 'success' ? 'border-themeSuccess' : 'border-stone-700'}
            `}>
                {showNote ? (
                    <ScoreRenderer key={`flash_${subRound}`} clef={exercise.clef} keySig={exercise.keySig} visualNotes={exercise.rounds[subRound].visualNotes} hideClef={true} />
                ) : (
                    <div className="text-4xl font-bold text-stone-600">?</div>
                )}
            </div>

            <div className="w-full max-w-md h-2 bg-stone-800 rounded-full mt-6 overflow-hidden">
                <div className="h-full bg-themePrimary timer-bar" style={{ width: `${phase === 'play' ? timeLeft : 0}%` }}></div>
            </div>

            {renderButtons()}
        </main>
    );
}
