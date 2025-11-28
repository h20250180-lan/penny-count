import React from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, Users, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface QuickActionsProps {
  onAction: (action: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onAction }) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const getActionsForRole = () => {
    if (user?.role === 'agent') {
      return [
        {
          id: 'collect-payment',
          title: t('collectPayment'),
          description: t('recordCollection'),
          icon: TrendingUp,
          color: 'emerald'
        },
        {
          id: 'new-loan',
          title: t('newLoan'),
          description: t('disburseLoan'),
          icon: Plus,
          color: 'blue'
        },
        {
          id: 'add-borrower',
          title: t('addBorrower'),
          description: t('newCustomer'),
          icon: Users,
          color: 'purple'
        },
        {
          id: 'sync-data',
          title: t('syncData'),
          description: t('uploadOfflineData'),
          icon: FileText,
          color: 'orange'
        }
      ];
    }

    return [
      {
        id: 'create-line',
        title: t('createLine'),
        description: t('newLendingLine'),
        icon: Plus,
        color: 'emerald'
      },
      {
        id: 'add-agent',
        title: t('addAgent'),
        description: t('assignNewAgent'),
        icon: Users,
        color: 'blue'
      },
      {
        id: 'view-reports',
        title: t('viewReports'),
        description: t('analyticsInsights'),
        icon: FileText,
        color: 'purple'
      },
      {
        id: 'export-data',
        title: t('exportData'),
        description: t('downloadReports'),
        icon: TrendingUp,
        color: 'orange'
      }
    ];
  };

  const actions = getActionsForRole();

  const getColorClasses = (color: string) => {
    const colors = {
      emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100',
      blue: 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100',
      purple: 'bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100',
      orange: 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100'
    };
    return colors[color as keyof typeof colors] || colors.emerald;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <h2 className="text-lg font-semibold text-gray-800 mb-6">{t('quickActions')}</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => (
          <motion.button
            key={action.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAction(action.id)}
            className={`p-4 border rounded-lg text-center transition-colors ${getColorClasses(action.color)}`}
          >
            <action.icon className="w-8 h-8 mx-auto mb-2" />
            <div className="font-medium">{action.title}</div>
            <div className="text-sm mt-1 opacity-75">{action.description}</div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};