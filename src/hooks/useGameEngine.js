import { useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';

export function useGameEngine(initialConfig, onQuit) {
    const { t } = useI18n();
    const [queue, setQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const start = (generatedQueue) => {
        setQueue(generatedQueue);
        setCurrentIndex(0);
    };

    const nextExercise = () => {
        if (currentIndex + 1 < queue.length) {
            setCurrentIndex(c => c + 1);
        } else {
            alert(t('done'));
            onQuit();
        }
    };

    const triggerErrorSRS = (currentEx) => {
        if (currentEx.retryCount < 2) {
            setQueue(prev => [...prev, { ...currentEx, id: currentEx.id + '_retry', retryCount: currentEx.retryCount + 1 }]);
        }
    };

    return {
        queue,
        currentEx: queue[currentIndex],
        progress: queue.length > 0 ? ((currentIndex + 1) / queue.length) * 100 : 0,
        start,
        nextExercise,
        triggerErrorSRS
    };
}
