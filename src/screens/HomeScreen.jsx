import { useI18n } from '@/contexts/I18nContext';
import { IconMusic } from '@/components/ui/Icons';

export function HomeScreen({ config, setConfig, onStart }) {
    const { t, lang, setLang } = useI18n();

    const toggleType = (type) => {
        setConfig(prev => {
            const types = prev.types.includes(type) ? prev.types.filter(t => t !== type) : [...prev.types, type];
            return { ...prev, types };
        });
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 py-10 relative">
            {/* Botão de Idioma */}
            <button onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')} className="absolute top-4 right-4 bg-themeCard border border-stone-700 text-stone-300 px-4 py-2 rounded-full font-bold hover:bg-stone-700 transition-colors">
                {lang === 'pt' ? '🇺🇸 EN' : '🇧🇷 PT'}
            </button>

            <div className="w-full max-w-lg bg-themeCard p-6 md:p-8 rounded-3xl shadow-2xl border border-stone-700">
                <div className="flex flex-col items-center justify-center gap-2 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-themePrimary p-3 rounded-2xl text-white"><IconMusic /></div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-white">{t('title')}</h1>
                    </div>
                    <p className="text-stone-400 font-medium">{t('subtitle')}</p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-stone-400 mb-2 uppercase tracking-wider">{t('qty')}</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[10, 20, 30].map(num => (
                                <button key={num} onClick={() => setConfig({ ...config, numExercises: num })}
                                    className={`py-2 rounded-xl font-bold text-sm transition-all ${config.numExercises === num ? 'bg-themePrimary text-white shadow-[0_4px_0_#9f1239]' : 'bg-stone-700 text-stone-300 hover:bg-stone-600'}`}>
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-stone-400 mb-2 uppercase tracking-wider">{t('clef')}</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['treble', 'bass', 'grand'].map(c => (
                                <button key={c} onClick={() => setConfig({ ...config, clef: c })}
                                    className={`py-2 rounded-xl font-bold text-sm transition-all ${config.clef === c ? 'bg-themePrimary text-white shadow-[0_4px_0_#9f1239]' : 'bg-stone-700 text-stone-300 hover:bg-stone-600'}`}>
                                    {t(c)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-stone-400 mb-2 uppercase tracking-wider">{t('range')}</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[{ id: 'small', l: 'small' }, { id: 'medium', l: 'medium' }, { id: 'full', l: 'full' }].map(r => (
                                <button key={r.id} onClick={() => setConfig({ ...config, range: r.id })}
                                    className={`py-2 rounded-xl font-bold text-sm transition-all ${config.range === r.id ? 'bg-themePrimary text-white shadow-[0_4px_0_#9f1239]' : 'bg-stone-700 text-stone-300 hover:bg-stone-600'}`}>
                                    {t(r.l)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-stone-400 mb-2 uppercase tracking-wider">{t('scale')}</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[{ id: 'C', l: 'c_maj' }, { id: 'G', l: 'g_maj' }, { id: 'F', l: 'f_maj' }, { id: 'Eb', l: 'eb_maj' }].map(s => (
                                <button key={s.id} onClick={() => setConfig({ ...config, keySig: s.id })}
                                    className={`py-2 rounded-xl font-bold text-sm transition-all ${config.keySig === s.id ? 'bg-themePrimary text-white shadow-[0_4px_0_#9f1239]' : 'bg-stone-700 text-stone-300 hover:bg-stone-600'}`}>
                                    {t(s.l)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-stone-400 mb-2 uppercase tracking-wider">{t('exercises')}</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { id: 'pressure_line_space', l: 'pressure_line_space' }, { id: 'mc_staff_to_keys', l: 'mc_staff_to_keys' },
                                { id: 'pressure_step_skip', l: 'pressure_step_skip' }, { id: 'mc_keys_to_staff', l: 'mc_keys_to_staff' }
                                { id: 'pressure_odd_even', l: 'pressure_odd_even' }, { id: 'single_note', l: 'single_note' },
                                { id: 'match_pairs', l: 'match_pairs' }, { id: 'match_pairs_single', l: 'match_pairs_single' },
                                { id: 'match_pairs_abstract', l: 'match_pairs_abstract' }, { id: 'sequence', l: 'sequence' },
                                { id: 'pressure_line_space', l: 'pressure_line_space' }, { id: 'pressure_odd_even', l: 'pressure_odd_even' },
                                { id: 'guided_interval', l: 'guided_interval' }, { id: 'chord', l: 'chord' }
                            ].map(t_obj => (
                                <button key={t_obj.id} onClick={() => toggleType(t_obj.id)}
                                    className={`py-2 px-2 rounded-xl font-bold text-xs transition-all border-2 ${config.types.includes(t_obj.id) ? 'bg-stone-700 border-themePrimary text-white' : 'bg-transparent border-stone-700 text-stone-500 hover:border-stone-500'}`}>
                                    {t(t_obj.l)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button onClick={onStart} className="w-full mt-4 bg-themePrimary hover:bg-themePrimaryDark text-white font-bold py-4 rounded-2xl shadow-[0_6px_0_#9f1239] active:translate-y-1 active:shadow-none transition-all text-xl uppercase tracking-wider">
                        {t('start')}
                    </button>
                </div>
            </div>
        </div>
    );
}
