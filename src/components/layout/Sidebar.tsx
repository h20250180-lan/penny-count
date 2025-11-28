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
  Wallet
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
      className="w-64 bg-white border-r border-gray-200 flex flex-col h-full"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {user.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">{user.name}</h2>
            <p className="text-sm text-gray-500 capitalize">{user.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
              activeSection === item.id
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </motion.button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <motion.button
          onClick={logout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center space-x-3 p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">{t('logout')}</span>
        </motion.button>
      </div>
    </motion.div>
  );
};