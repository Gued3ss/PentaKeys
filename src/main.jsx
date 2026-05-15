import { createRoot } from 'react-dom/client';
import { I18nProvider } from '@/contexts/I18nContext';
import { AudioProvider } from '@/contexts/AudioContext';
import App from '@/App';
import './index.css';

createRoot(document.getElementById('root')).render(
    <I18nProvider>
        <AudioProvider>
            <App />
        </AudioProvider>
    </I18nProvider>
);
