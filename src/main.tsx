import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ToastProvider } from './contexts/ToastContext';
import { Toaster } from './components/ui/Toaster';
import { LanguageProvider } from './contexts/LanguageContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <ToastProvider>
        <App />
        <Toaster />
      </ToastProvider>
    </LanguageProvider>
  </StrictMode>
);
