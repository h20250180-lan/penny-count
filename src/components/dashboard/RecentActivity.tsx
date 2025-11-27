import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  // CheckCircle,
  AlertCircle,
  User
} from 'lucide-react';
import { dataService } from '../../services/dataService';

interface Activity {
  id: string;
  type: 'loan_disbursed' | 'payment_received' | 'loan_overdue' | 'new_borrower';
  title: string;
  description: string;
  amount?: number;
  time: string;
  status: 'success' | 'warning' | 'info';
}

export const RecentActivity: React.FC<{ onViewAll?: (section: string) => void }> = ({ onViewAll }) => {
  const [activities, setActivities] = React.useState<Activity[]>([]);

  React.useEffect(() => {
    const loadActivities = async () => {
      try {
        // Generate activities from recent payments and loans
        const [payments, loans, borrowers] = await Promise.all([
          dataService.getPayments(),
          dataService.getLoans(),
          dataService.getBorrowers()
        ]);

        const recentActivities: Activity[] = [];

        // Add recent payments
        payments.slice(-3).forEach((payment, index) => {
          const borrower = borrowers.find(b => b.id === payment.borrowerId);
          recentActivities.push({
            id: `payment-${payment.id}`,
            type: 'payment_received',
            title: 'Payment Received',
            description: `${borrower?.name || 'Unknown'} paid ₹${payment.amount} for loan #${payment.loanId}`,
            amount: payment.amount,
            time: `${index + 1} hours ago`,
            status: 'success'
          });
        });

        // Add recent loans
        loans.slice(-2).forEach((loan, index) => {
          const borrower = borrowers.find(b => b.id === loan.borrowerId);
          recentActivities.push({
            id: `loan-${loan.id}`,
            type: 'loan_disbursed',
            title: 'Loan Disbursed',
            description: `New loan of ₹${loan.amount} disbursed to ${borrower?.name || 'Unknown'}`,
            amount: loan.amount,
            time: `${index + 3} hours ago`,
            status: 'info'
          });
        });

        setActivities(recentActivities.slice(0, 5));
      } catch (error) {
        console.error('Error loading activities:', error);
      }
    };

    loadActivities();
  }, []);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'payment_received':
        return <ArrowDownLeft className="w-5 h-5 text-green-500" />;
      case 'loan_disbursed':
        return <ArrowUpRight className="w-5 h-5 text-blue-500" />;
      case 'loan_overdue':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'new_borrower':
        return <User className="w-5 h-5 text-purple-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Activity['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-red-50 border-red-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
        <button
          onClick={() => {
            if (onViewAll) onViewAll('loans');
            else window.dispatchEvent(new CustomEvent('navigate', { detail: { section: 'loans' } }));
          }}
          className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
        >
          View All
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`flex items-start space-x-4 p-4 rounded-lg border ${getStatusColor(activity.status)}`}
          >
            <div className="flex-shrink-0 p-2 bg-white rounded-full border border-gray-200">
              {getActivityIcon(activity.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-800">{activity.title}</h3>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
              {activity.amount && (
                <p className="text-sm font-semibold text-gray-800 mt-1">
                  ₹{activity.amount.toLocaleString()}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};