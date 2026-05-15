import { useI18n } from '@/contexts/I18nContext';
import { IconLoader } from '@/components/ui/Icons';

export function LoadingScreen() {
    const { t } = useI18n();
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-themeBg text-white">
            <IconLoader />
            <h2 className="mt-4 text-xl font-bold text-stone-300 animate-pulse">{t('loading')}</h2>
        </div>
    );
}
