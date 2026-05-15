import { useState, createContext, useContext } from 'react';
import { DICTIONARY } from '@/constants/dictionary';

const I18nContext = createContext(null);

export const I18nProvider = ({ children }) => {
    const [lang, setLang] = useState('pt');
    const t = (key, params = {}) => {
        let str = DICTIONARY[lang][key] || key;
        Object.keys(params).forEach(k => { str = str.replace(`{${k}}`, params[k]); });
        return str;
    };
    return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);
