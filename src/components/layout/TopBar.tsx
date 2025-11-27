import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { useOffline } from '../offline/OfflineManager';

interface TopBarProps {
  title: string;
}

export const TopBar: React.FC<TopBarProps> = ({ title }) => {
  const { user } = useAuth();
  const { isOnline } = useOffline();

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between"
    >
      {/* Left section */}
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        
        {/* Online/Offline indicator */}
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
          isOnline 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {isOnline ? (
            <Wifi className="w-4 h-4" />
          ) : (
            <WifiOff className="w-4 h-4" />
          )}
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search borrowers, loans..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-64"
          />
        </div>

        {/* Notifications */}
        <NotificationCenter />

        {/* User info */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-800">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xs">
              {user?.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};