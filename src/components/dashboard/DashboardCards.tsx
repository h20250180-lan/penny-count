import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  DollarSign,
  AlertTriangle,
  Building2,
  Wallet
} from 'lucide-react';
import { DashboardMetrics } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface DashboardCardsProps {
  metrics: DashboardMetrics;
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({ metrics }) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const getCardsForRole = () => {
    if (user?.role === 'owner') {
      return [
        {
          title: t('totalLines'),
          value: metrics.totalLines,
          icon: Building2,
          color: 'bg-blue-500',
          change: `+2 ${t('thisMonth')}`,
          trend: 'up'
        },
        {
          title: t('totalDisbursed'),
          value: `₹${metrics.totalDisbursed?.toLocaleString()}`,
          icon: DollarSign,
          color: 'bg-green-500',
          change: `+12% ${t('fromLastMonth')}`,
          trend: 'up'
        },
        {
          title: t('totalCollected'),
          value: `₹${metrics.totalCollected?.toLocaleString()}`,
          icon: Wallet,
          color: 'bg-emerald-500',
          change: `+8% ${t('fromLastMonth')}`,
          trend: 'up'
        },
        {
          title: t('netProfit'),
          value: `₹${metrics.profit?.toLocaleString()}`,
          icon: TrendingUp,
          color: 'bg-purple-500',
          change: `+15% ${t('fromLastMonth')}`,
          trend: 'up'
        },
        {
          title: t('activeBorrowers'),
          value: metrics.totalBorrowers,
          icon: Users,
          color: 'bg-indigo-500',
          change: '+5 this week',
          trend: 'up'
        },
        {
          title: t('overdueLoans'),
          value: metrics.overdueLoans,
          icon: AlertTriangle,
          color: 'bg-red-500',
          change: '-3 from last week',
          trend: 'down'
        }
      ];
    }

    if (user?.role === 'co-owner') {
      return [
        {
          title: t('myLines'),
          value: metrics.totalLines,
          icon: Building2,
          color: 'bg-blue-500',
          change: t('active'),
          trend: 'neutral'
        },
        {
          title: t('totalDisbursed'),
          value: `₹${metrics.totalDisbursed?.toLocaleString()}`,
          icon: DollarSign,
          color: 'bg-green-500',
          change: `+8% ${t('thisMonth')}`,
          trend: 'up'
        },
        {
          title: t('collections'),
          value: `₹${metrics.totalCollected?.toLocaleString()}`,
          icon: Wallet,
          color: 'bg-emerald-500',
          change: `${metrics.collectionEfficiency}% efficiency`,
          trend: 'up'
        },
        {
          title: t('commissions'),
          value: `₹${(metrics.profit * 0.1)?.toLocaleString()}`,
          icon: TrendingUp,
          color: 'bg-purple-500',
          change: t('thisMonth'),
          trend: 'up'
        }
      ];
    }

    // Agent role
    return [
      {
        title: t('myBorrowers'),
        value: metrics.totalBorrowers,
        icon: Users,
        color: 'bg-blue-500',
        change: t('active'),
        trend: 'neutral'
      },
      {
        title: t('activeLoans'),
        value: metrics.activeLoans,
        icon: CreditCard,
        color: 'bg-green-500',
        change: t('active'),
        trend: 'neutral'
      },
      {
        title: t('balance'),
        value: `₹${metrics.cashOnHand?.toLocaleString()}`,
        icon: Wallet,
        color: 'bg-emerald-500',
        change: t('availableCredit'),
        trend: 'neutral'
      },
      {
        title: t('collections'),
        value: `${metrics.collectionEfficiency}%`,
        icon: TrendingUp,
        color: 'bg-purple-500',
        change: t('thisMonth'),
        trend: metrics.collectionEfficiency > 85 ? 'up' : 'down'
      }
    ];
  };

  const cards = getCardsForRole();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${card.color}`}>
              <card.icon className="w-6 h-6 text-white" />
            </div>
            {card.trend === 'up' && (
              <TrendingUp className="w-5 h-5 text-green-500" />
            )}
            {card.trend === 'down' && (
              <TrendingDown className="w-5 h-5 text-red-500" />
            )}
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">{card.title}</h3>
            <p className="text-2xl font-bold text-gray-800 mb-2">{card.value}</p>
            <p className={`text-sm ${
              card.trend === 'up' ? 'text-green-600' : 
              card.trend === 'down' ? 'text-red-600' : 
              'text-gray-500'
            }`}>
              {card.change}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};