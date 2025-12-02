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
import { Payment, Borrower, Loan } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { dataService } from '../../services/dataService';
import { useToast } from '../../contexts/ToastContext';
import { offlineQueueService } from '../../services/offlineQueueService';

export const Collections: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [borrowerNames, setBorrowerNames] = useState<{ [key: string]: string }>({});
  const [activeLoans, setActiveLoans] = useState<Loan[]>([]);
  const [selectedBorrowerId, setSelectedBorrowerId] = useState<string>('');
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ success: 0, failed: 0, total: 0 });

  // Load data on component mount
  React.useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [paymentsData, borrowersData, loansData] = await Promise.all([
          dataService.getPayments(),
          dataService.getBorrowers(),
          dataService.getLoans()
        ]);
        setPayments(paymentsData);
        setBorrowers(borrowersData);

        const names: { [key: string]: string } = {};
        borrowersData.forEach((b: Borrower) => { names[b.id] = b.name; });
        setBorrowerNames(names);

        const active = loansData.filter((l: Loan) => l.status === 'active');
        setActiveLoans(active);
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
    setSelectedBorrowerId('');
    setFilteredLoans([]);
    setShowCollectModal(true);
  };

  const handleBorrowerChange = async (borrowerId: string) => {
    setSelectedBorrowerId(borrowerId);
    if (borrowerId) {
      try {
        const loans = await dataService.getActiveLoansByBorrower(borrowerId);
        setFilteredLoans(loans);
      } catch (error) {
        console.error('Error loading borrower loans:', error);
        setFilteredLoans([]);
        showToast('Failed to load loans for this borrower', 'error');
      }
    } else {
      setFilteredLoans([]);
    }
  };

  const handleCollectPaymentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || isSubmitting) return;

    const formData = new FormData(e.currentTarget);
    const loanId = formData.get('loanId') as string;
    const amount = parseInt(formData.get('amount') as string);
    const method = formData.get('method') as 'cash' | 'upi' | 'phonepe' | 'qr';
    const transactionId = formData.get('transactionId') as string;

    if (!loanId) {
      showToast('Please select a loan', 'error');
      return;
    }

    if (!amount || amount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    const selectedLoan = filteredLoans.find(l => l.id === loanId);
    if (selectedLoan && amount > selectedLoan.remainingAmount) {
      showToast(`Payment amount cannot exceed remaining balance of ₹${selectedLoan.remainingAmount}`, 'error');
      return;
    }

    if ((method === 'upi' || method === 'phonepe' || method === 'qr') && !transactionId) {
      showToast('Transaction ID is required for digital payments', 'error');
      return;
    }

    setIsSubmitting(true);

    const newPayment = {
      loanId,
      borrowerId: selectedBorrowerId,
      agentId: user.id,
      amount,
      method,
      transactionId: transactionId || undefined,
      isOffline: false
    };

    try {
      const createdPayment = await dataService.createPayment(newPayment);
      setPayments([createdPayment, ...payments]);
      setShowCollectModal(false);
      showToast(`Payment of ₹${amount} recorded successfully!`, 'success');

      const [updatedPayments, updatedLoans] = await Promise.all([
        dataService.getPayments(),
        dataService.getLoans()
      ]);
      setPayments(updatedPayments);
      const active = updatedLoans.filter(l => l.status === 'active');
      setActiveLoans(active);
    } catch (error) {
      console.error('Error creating payment:', error);
      showToast('Failed to record payment: ' + (error instanceof Error ? error.message : String(error)), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const handleSyncData = async () => {
    if (!user) return;

    if (!navigator.onLine) {
      showToast('Cannot sync while offline', 'error');
      return;
    }

    const pendingCount = offlineQueueService.getPendingCount();
    if (pendingCount === 0) {
      showToast('No pending items to sync', 'info');
      return;
    }

    setShowSyncModal(true);
    setIsSyncing(true);
    setSyncProgress({ success: 0, failed: 0, total: pendingCount });

    try {
      const result = await offlineQueueService.syncQueue(user.id);
      setSyncProgress({ success: result.success, failed: result.failed, total: pendingCount });

      if (result.success > 0) {
        showToast(`Successfully synced ${result.success} items!`, 'success');
        const [updatedPayments, updatedLoans] = await Promise.all([
          dataService.getPayments(),
          dataService.getLoans()
        ]);
        setPayments(updatedPayments);
        const active = updatedLoans.filter(l => l.status === 'active');
        setActiveLoans(active);
      }

      if (result.failed > 0) {
        showToast(`${result.failed} items failed to sync`, 'error');
      }
    } catch (error) {
      console.error('Sync error:', error);
      showToast('Failed to sync data: ' + (error instanceof Error ? error.message : String(error)), 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const todayCollections = payments.filter(p => {
    if (!p.receivedAt) return false;
    const today = new Date();
    const paymentDate = new Date(p.receivedAt);
    return paymentDate.toDateString() === today.toDateString();
  });

  const totalToday = todayCollections.reduce((sum, p) => sum + (p.amount || 0), 0);
  const cashToday = todayCollections.filter(p => p.method === 'cash').reduce((sum, p) => sum + (p.amount || 0), 0);
  const digitalToday = totalToday - cashToday;

  // Add loading/error UI
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading payments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <p className="font-semibold">Error loading payments</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

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
          <span>{t('collectPayment')}</span>
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
            onClick={handleSyncData}
            className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-center hover:bg-orange-100 transition-colors"
          >
            <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-orange-600 font-medium">Sync Data</div>
            <div className="text-sm text-orange-500 mt-1">
              {offlineQueueService.getPendingCount() > 0
                ? `${offlineQueueService.getPendingCount()} pending items`
                : 'Upload offline data'}
            </div>
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
              <option value="all">{t('allMethods')}</option>
              <option value="cash">{t('cash')}</option>
              <option value="upi">{t('upi')}</option>
              <option value="phonepe">{t('phonepe')}</option>
              <option value="qr">{t('qrCode')}</option>
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
        {filteredPayments.length === 0 ? (
          <div className="text-center py-12">
            <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No payments found</p>
            <p className="text-gray-400 text-sm mt-2">Start collecting payments to see them here</p>
          </div>
        ) : (
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
                    {borrowerNames[payment.borrowerId] || 'Unknown'} • Loan {payment.loanId}
                  </p>
                  <p className="text-xs text-gray-500">
                    {payment.receivedAt ? new Date(payment.receivedAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xl font-bold text-emerald-600">
                  ₹{(payment.amount || 0).toLocaleString()}
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
        )}
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
                  Select Borrower *
                </label>
                <select
                  value={selectedBorrowerId}
                  onChange={(e) => handleBorrowerChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  required
                >
                  <option value="">Choose a borrower...</option>
                  {borrowers.map(borrower => (
                    <option key={borrower.id} value={borrower.id}>
                      {borrower.name} {borrower.serialNumber ? `(${borrower.serialNumber})` : ''} - {borrower.phone}
                    </option>
                  ))}
                </select>
              </div>

              {selectedBorrowerId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Loan *
                  </label>
                  {filteredLoans.length === 0 ? (
                    <div className="w-full px-3 py-3 border border-yellow-300 bg-yellow-50 rounded-lg text-yellow-700 text-sm">
                      No active loans found for this borrower
                    </div>
                  ) : (
                    <select
                      name="loanId"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      required
                    >
                      <option value="">Select a loan...</option>
                      {filteredLoans.map(loan => {
                        const daysOverdue = Math.floor((new Date().getTime() - new Date(loan.dueDate).getTime()) / (1000 * 60 * 60 * 24));
                        const isOverdue = daysOverdue > 0;
                        return (
                          <option key={loan.id} value={loan.id}>
                            ₹{loan.remainingAmount.toLocaleString()} remaining - Due: {new Date(loan.dueDate).toLocaleDateString()}
                            {isOverdue ? ` (${daysOverdue} days overdue)` : ''}
                          </option>
                        );
                      })}
                    </select>
                  )}
                </div>
              )}

              {!selectedBorrowerId && (
                <div className="w-full px-3 py-3 border border-gray-300 bg-gray-50 rounded-lg text-gray-500 text-sm">
                  Please select a borrower first to view their loans
                </div>
              )}
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
                  <option value="cash">{t('cash')}</option>
                  <option value="upi">{t('upi')}</option>
                  <option value="phonepe">{t('phonepe')}</option>
                  <option value="qr">{t('qrCode')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction ID
                  <span className="text-xs text-gray-500 ml-1">(Required for UPI/PhonePe/QR)</span>
                </label>
                <input
                  type="text"
                  name="transactionId"
                  placeholder="Enter transaction ID for digital payments"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              {selectedBorrowerId && filteredLoans.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800 font-medium mb-1">Selected Borrower Info</p>
                  <p className="text-xs text-blue-700">
                    Name: {borrowers.find(b => b.id === selectedBorrowerId)?.name}
                  </p>
                  <p className="text-xs text-blue-700">
                    Active Loans: {filteredLoans.length}
                  </p>
                  <p className="text-xs text-blue-700">
                    Total Outstanding: ₹{filteredLoans.reduce((sum, l) => sum + l.remainingAmount, 0).toLocaleString()}
                  </p>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCollectModal(false);
                    setSelectedBorrowerId('');
                    setFilteredLoans([]);
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting || !selectedBorrowerId || filteredLoans.length === 0}
                >
                  {isSubmitting ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Sync Data Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Sync Offline Data</h2>

            {isSyncing ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Syncing {syncProgress.total} items...</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${syncProgress.total > 0 ? ((syncProgress.success + syncProgress.failed) / syncProgress.total) * 100 : 0}%`
                    }}
                  ></div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium">Sync Complete!</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-green-700">✓ {syncProgress.success} items synced successfully</p>
                    {syncProgress.failed > 0 && (
                      <p className="text-sm text-red-700">✗ {syncProgress.failed} items failed</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowSyncModal(false)}
                  className="w-full bg-emerald-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-emerald-600 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};