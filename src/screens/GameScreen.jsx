import { ExerciseInteractivePiano } from '@/components/exercises/InteractivePiano';
import { ExerciseMultipleChoice } from '@/components/exercises/MultipleChoice';
import { ExerciseMatchPairs } from '@/components/exercises/MatchPairs';
import { ExercisePressure } from '@/components/exercises/Pressure';
import { IconX } from '@/components/ui/Icons';

export function GameScreen({ engine, onQuit }) {
    const renderExercise = () => {
        const ex = engine.currentEx;
        if (!ex) return null;

        if (ex.type.startsWith('pressure_')) {
            return <ExercisePressure exercise={ex} onNext={engine.nextExercise} />;
        }
        if (ex.type.startsWith('match_pairs')) {
            return <ExerciseMatchPairs exercise={ex} onNext={engine.nextExercise} onRetry={engine.triggerErrorSRS} />;
        }
        if (ex.type.startsWith('mc_')) {
            return <ExerciseMultipleChoice exercise={ex} onNext={engine.nextExercise} onRetry={engine.triggerErrorSRS} />;
        }
        return <ExerciseInteractivePiano exercise={ex} onNext={engine.nextExercise} onRetry={engine.triggerErrorSRS} />;
    };

    return (
        <div className="min-h-[100dvh] w-full flex flex-col relative">
            <header className="w-full max-w-4xl mx-auto p-4 flex items-center gap-4 shrink-0">
                <button onClick={onQuit} className="text-stone-400 hover:text-stone-200 transition-colors"><IconX /></button>
                <div className="flex-1 h-4 bg-stone-700 rounded-full overflow-hidden">
                    <div className="h-full bg-themePrimary rounded-full transition-all duration-500 ease-out" style={{ width: `${engine.progress}%` }} />
                </div>
            </header>
            {renderExercise()}
        </div>
    );
}
