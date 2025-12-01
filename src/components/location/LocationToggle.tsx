import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, MapPinOff } from 'lucide-react';
import { useLocation } from '../../contexts/LocationContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

export const LocationToggle: React.FC = () => {
  const { user } = useAuth();
  const { isTracking, toggleTracking } = useLocation();
  const { t } = useLanguage();

  if (user?.role !== 'agent') return null;

  return (
    <motion.button
      onClick={toggleTracking}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-md ${
        isTracking
          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
      }`}
    >
      {isTracking ? (
        <>
          <MapPin className="w-4 h-4 animate-pulse" />
          <span>{t('trackingOn')}</span>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
        </>
      ) : (
        <>
          <MapPinOff className="w-4 h-4" />
          <span>{t('trackingOff')}</span>
        </>
      )}
    </motion.button>
  );
};
