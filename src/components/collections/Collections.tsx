import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Wallet, 
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  CreditCard,
  Smartphone,
  QrCode,
  Search,
  Filter,
  MapPin
} from 'lucide-react';
import { Payment } from '../../types';
import { dataService } from '../../services/dataService';

export const Collections: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [borrowerNames, setBorrowerNames] = useState<{ [key: string]: string }>({});

  // Load data on component mount
  React.useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [paymentsData, borrowersData] = await Promise.all([
          dataService.getPayments(),
          dataService.getBorrowers()
        ]);
        setPayments(paymentsData);

        const names: { [key: string]: string } = {};
        borrowersData.forEach((b: any) => { names[b.id] = b.name; });
        setBorrowerNames(names);
      } catch (err: any) {
        setError(err.message || 'Failed to load payments');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredPayments = payments.filter(payment => {
    const borrowerName = borrowerNames[payment.borrowerId] || '';
    const matchesSearch = payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.loanId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         borrowerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMethod = methodFilter === 'all' || payment.method === methodFilter;
    
    return matchesSearch && matchesMethod;
  });

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <Wallet className="w-4 h-4" />;
      case 'upi':
        return <Smartphone className="w-4 h-4" />;
      case 'phonepe':
        return <Smartphone className="w-4 h-4" />;
      case 'qr':
        return <QrCode className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'cash':
        return 'bg-green-100 text-green-700';
      case 'upi':
        return 'bg-blue-100 text-blue-700';
      case 'phonepe':
        return 'bg-purple-100 text-purple-700';
      case 'qr':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleCollectPayment = () => {
    setShowCollectModal(true);
  };

  const handleCollectPaymentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newPayment = {
      loanId: formData.get('loanId') as string,
      borrowerId: formData.get('borrowerId') as string,
      agentId: '3', // Current user ID
      amount: parseInt(formData.get('amount') as string),
      method: formData.get('method') as 'cash' | 'upi' | 'phonepe' | 'qr',
      transactionId: formData.get('transactionId') as string || undefined,
      isOffline: false
    };

    try {
      const createdPayment = await dataService.createPayment(newPayment);
      setPayments([...payments, createdPayment]);
      setShowCollectModal(false);
    } catch (error) {
      console.error('Error creating payment:', error);
    }
  };

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const todayCollections = payments.filter(p => {
    const today = new Date();
    const paymentDate = new Date(p.receivedAt);
    return paymentDate.toDateString() === today.toDateString();
  });

  const totalToday = todayCollections.reduce((sum, p) => sum + p.amount, 0);
  const cashToday = todayCollections.filter(p => p.method === 'cash').reduce((sum, p) => sum + p.amount, 0);
  const digitalToday = totalToday - cashToday;

  // Add loading/error UI
  if (loading) return <div className="text-gray-500">Loading payments...</div>;
  if (error) return <div className="bg-red-100 text-red-700 p-2 rounded">{error}</div>;
  if (!payments.length) return <div className="text-gray-500">No payments found.</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Collections</h1>
          <p className="text-gray-600 mt-1">Track and manage payment collections</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCollectPayment}
          className="bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-600 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Collect Payment</span>
        </motion.button>
      </motion.div>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Today's Total</h3>
          <p className="text-2xl font-bold text-gray-800">₹{totalToday.toLocaleString()}</p>
          <p className="text-sm text-emerald-600">{todayCollections.length} payments</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Wallet className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Cash Collections</h3>
          <p className="text-2xl font-bold text-gray-800">₹{cashToday.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Physical cash</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Smartphone className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Digital Payments</h3>
          <p className="text-2xl font-bold text-gray-800">₹{digitalToday.toLocaleString()}</p>
          <p className="text-sm text-blue-600">UPI, QR, PhonePe</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Pending Sync</h3>
          <p className="text-2xl font-bold text-gray-800">
            {payments.filter(p => p.isOffline).length}
          </p>
          <p className="text-sm text-yellow-600">Offline entries</p>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-center hover:bg-emerald-100 transition-colors"
          >
            <Wallet className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <div className="text-emerald-600 font-medium">Cash Payment</div>
            <div className="text-sm text-emerald-500 mt-1">Record cash collection</div>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center hover:bg-blue-100 transition-colors"
          >
            <QrCode className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-blue-600 font-medium">QR Payment</div>
            <div className="text-sm text-blue-500 mt-1">Scan QR code</div>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-center hover:bg-purple-100 transition-colors"
          >
            <Smartphone className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-purple-600 font-medium">UPI Payment</div>
            <div className="text-sm text-purple-500 mt-1">Digital transfer</div>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-center hover:bg-orange-100 transition-colors"
          >
            <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-orange-600 font-medium">Sync Data</div>
            <div className="text-sm text-orange-500 mt-1">Upload offline data</div>
          </motion.button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search payments by ID, loan, or borrower..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="phonepe">PhonePe</option>
              <option value="qr">QR Code</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Payments List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Collections</h3>
        <div className="space-y-4">
          {filteredPayments.map((payment, index) => (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.01 }}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-emerald-200 hover:bg-emerald-50 transition-all cursor-pointer"
              onClick={() => handleViewPayment(payment)}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${getMethodColor(payment.method)}`}>
                  {getMethodIcon(payment.method)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-800">{payment.id}</h4>
                    {payment.isOffline && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                        Offline
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {borrowerNames[payment.borrowerId]} • Loan {payment.loanId}
                  </p>
                  <p className="text-xs text-gray-500">
                    {payment.receivedAt.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-xl font-bold text-emerald-600">
                  ₹{payment.amount.toLocaleString()}
                </p>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getMethodColor(payment.method)}`}>
                    {getMethodIcon(payment.method)}
                    <span className="capitalize">{payment.method}</span>
                  </span>
                </div>
                {payment.transactionId && (
                  <p className="text-xs text-gray-400 mt-1">
                    ID: {payment.transactionId}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Collect Payment Modal */}
      {showCollectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Collect Payment</h2>
            <form className="space-y-4" onSubmit={handleCollectPaymentSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Borrower
                </label>
                <select name="borrowerId" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" required>
                  <option value="">Choose borrower</option>
                  {Object.entries(borrowerNames).map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan ID
                </label>
                <select name="loanId" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" required>
                  <option value="">Select active loan</option>
                  <option value="L001">L001 - ₹5,750 remaining</option>
                  <option value="L004">L004 - ₹4,462 remaining</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount (₹)
                </label>
                <input
                  type="number"
                  name="amount"
                  placeholder="500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select name="method" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" required>
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="phonepe">PhonePe</option>
                  <option value="qr">QR Code</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction ID (Optional)
                </label>
                <input
                  type="text"
                  name="transactionId"
                  placeholder="Enter transaction ID for digital payments"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCollectModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-emerald-600 transition-colors"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};