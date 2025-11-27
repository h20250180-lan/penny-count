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

interface DashboardCardsProps {
  metrics: DashboardMetrics;
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({ metrics }) => {
  const { user } = useAuth();

  const getCardsForRole = () => {
    if (user?.role === 'owner') {
      return [
        {
          title: 'Total Lines',
          value: metrics.totalLines,
          icon: Building2,
          color: 'bg-blue-500',
          change: '+2 this month',
          trend: 'up'
        },
        {
          title: 'Total Disbursed',
          value: `₹${metrics.totalDisbursed?.toLocaleString()}`,
          icon: DollarSign,
          color: 'bg-green-500',
          change: '+12% from last month',
          trend: 'up'
        },
        {
          title: 'Total Collected',
          value: `₹${metrics.totalCollected?.toLocaleString()}`,
          icon: Wallet,
          color: 'bg-emerald-500',
          change: '+8% from last month',
          trend: 'up'
        },
        {
          title: 'Net Profit',
          value: `₹${metrics.profit?.toLocaleString()}`,
          icon: TrendingUp,
          color: 'bg-purple-500',
          change: '+15% from last month',
          trend: 'up'
        },
        {
          title: 'Active Borrowers',
          value: metrics.totalBorrowers,
          icon: Users,
          color: 'bg-indigo-500',
          change: '+5 this week',
          trend: 'up'
        },
        {
          title: 'Overdue Loans',
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
          title: 'My Lines',
          value: metrics.totalLines,
          icon: Building2,
          color: 'bg-blue-500',
          change: 'Active lines',
          trend: 'neutral'
        },
        {
          title: 'Total Disbursed',
          value: `₹${metrics.totalDisbursed?.toLocaleString()}`,
          icon: DollarSign,
          color: 'bg-green-500',
          change: '+8% this month',
          trend: 'up'
        },
        {
          title: 'Collections',
          value: `₹${metrics.totalCollected?.toLocaleString()}`,
          icon: Wallet,
          color: 'bg-emerald-500',
          change: `${metrics.collectionEfficiency}% efficiency`,
          trend: 'up'
        },
        {
          title: 'Commission Earned',
          value: `₹${(metrics.profit * 0.1)?.toLocaleString()}`,
          icon: TrendingUp,
          color: 'bg-purple-500',
          change: 'This month',
          trend: 'up'
        }
      ];
    }

    // Agent role
    return [
      {
        title: 'My Borrowers',
        value: metrics.totalBorrowers,
        icon: Users,
        color: 'bg-blue-500',
        change: 'Active borrowers',
        trend: 'neutral'
      },
      {
        title: 'Active Loans',
        value: metrics.activeLoans,
        icon: CreditCard,
        color: 'bg-green-500',
        change: 'Currently active',
        trend: 'neutral'
      },
      {
        title: 'Cash on Hand',
        value: `₹${metrics.cashOnHand?.toLocaleString()}`,
        icon: Wallet,
        color: 'bg-emerald-500',
        change: 'Available for lending',
        trend: 'neutral'
      },
      {
        title: 'Collection Rate',
        value: `${metrics.collectionEfficiency}%`,
        icon: TrendingUp,
        color: 'bg-purple-500',
        change: 'This month',
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