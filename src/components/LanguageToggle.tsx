import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'te' : 'en')}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative group"
      title={language === 'en' ? 'Switch to Telugu' : 'Switch to English'}
    >
      <Languages className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      <span className="absolute -bottom-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {language === 'en' ? 'తెలుగు' : 'English'}
      </span>
    </button>
  );
};
