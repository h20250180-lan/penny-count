import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  TrendingUp,
  UserCheck,
  Settings,
  LogOut,
  Building2,
  Wallet,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const getNavigationItems = (role: string, t: (key: string) => string) => {
  const baseItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
  ];

  if (role === 'owner') {
    return [
      ...baseItems,
      { id: 'lines', label: t('linesManagement'), icon: Building2 },
      { id: 'users', label: t('usersAgents'), icon: Users },
      { id: 'locations', label: 'Agent Locations', icon: MapPin },
      { id: 'borrowers', label: t('allBorrowers'), icon: UserCheck },
      { id: 'loans', label: t('loanOverview'), icon: CreditCard },
      { id: 'analytics', label: t('analytics'), icon: TrendingUp },
      { id: 'settings', label: t('settings'), icon: Settings },
    ];
  }

  if (role === 'co-owner') {
    return [
      ...baseItems,
      { id: 'lines', label: t('myLines'), icon: Building2 },
      { id: 'agents', label: t('myAgents'), icon: Users },
      { id: 'locations', label: 'Agent Locations', icon: MapPin },
      { id: 'borrowers', label: t('borrowers'), icon: UserCheck },
      { id: 'loans', label: t('loans'), icon: CreditCard },
      { id: 'commissions', label: t('commissions'), icon: Wallet },
      { id: 'analytics', label: t('reports'), icon: TrendingUp },
    ];
  }

  // Agent role
  return [
    ...baseItems,
    { id: 'borrowers', label: t('myBorrowers'), icon: UserCheck },
    { id: 'loans', label: t('activeLoans'), icon: CreditCard },
    { id: 'collections', label: t('collections'), icon: Wallet },
    { id: 'payments', label: t('payments'), icon: TrendingUp },
  ];
};

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  if (!user) return null;

  const navigationItems = getNavigationItems(user.role, t);

  return (
    <motion.div
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className="w-64 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 flex flex-col h-full shadow-lg"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
            <span className="text-white font-bold text-lg">
              {user.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <h2 className="font-bold text-gray-900">{user.name}</h2>
            <p className="text-xs font-medium text-emerald-600 capitalize px-2 py-0.5 bg-emerald-50 rounded-full inline-block">{user.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navigationItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`w-full flex items-center space-x-3 p-3.5 rounded-xl transition-all duration-200 ${
              activeSection === item.id
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200 scale-105'
                : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-md'
            }`}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <item.icon className={`w-5 h-5 ${activeSection === item.id ? 'text-white' : ''}`} />
            <span className="font-semibold text-sm">{item.label}</span>
            {activeSection === item.id && (
              <motion.div
                layoutId="activeIndicator"
                className="ml-auto w-2 h-2 bg-white rounded-full"
              />
            )}
          </motion.button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200/50 bg-white">
        <motion.button
          onClick={logout}
          whileHover={{ scale: 1.02, x: 4 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center space-x-3 p-3.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-semibold text-sm">{t('logout')}</span>
        </motion.button>
      </div>
    </motion.div>
  );
};