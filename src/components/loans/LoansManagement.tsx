import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  CreditCard,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Eye,
  Edit
} from 'lucide-react';
import { Loan, Borrower } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { dataService } from '../../services/dataService';
import { useToast } from '../../contexts/ToastContext';

// Mock data
const mockLoans: Loan[] = [
  {
    id: 'L001',
    borrowerId: '1',
    lineId: '1',
    agentId: '3',
    amount: 10000,
    interestRate: 2.5,
    tenure: 30,
    repaymentFrequency: 'daily',
    totalAmount: 10750,
    paidAmount: 5000,
    remainingAmount: 5750,
    status: 'active',
    disbursedAt: new Date('2024-02-01'),
    dueDate: new Date('2024-03-02'),
    nextPaymentDate: new Date('2024-02-02')
  },
  {
    id: 'L002',
    borrowerId: '2',
    lineId: '1',
    agentId: '3',
    amount: 15000,
    interestRate: 2.0,
    tenure: 45,
    repaymentFrequency: 'weekly',
    totalAmount: 15675,
    paidAmount: 15675,
    remainingAmount: 0,
    status: 'completed',
    disbursedAt: new Date('2024-01-15'),
    dueDate: new Date('2024-03-01'),
    completedAt: new Date('2024-02-28'),
    nextPaymentDate: new Date('2024-02-20')
  },
  {
    id: 'L003',
    borrowerId: '3',
    lineId: '2',
    agentId: '3',
    amount: 8000,
    interestRate: 3.0,
    tenure: 20,
    repaymentFrequency: 'daily',
    totalAmount: 8480,
    paidAmount: 2000,
    remainingAmount: 6480,
    status: 'overdue',
    disbursedAt: new Date('2024-01-20'),
    dueDate: new Date('2024-02-09'),
    nextPaymentDate: new Date('2024-02-01')
  },
  {
    id: 'L004',
    borrowerId: '4',
    lineId: '1',
    agentId: '3',
    amount: 12000,
    interestRate: 2.2,
    tenure: 35,
    repaymentFrequency: 'weekly',
    totalAmount: 12462,
    paidAmount: 8000,
    remainingAmount: 4462,
    status: 'active',
    disbursedAt: new Date('2024-02-10'),
    dueDate: new Date('2024-03-16'),
    nextPaymentDate: new Date('2024-02-11')
  },
  {
    id: 'L005',
    borrowerId: '5',
    lineId: '2',
    agentId: '3',
    amount: 5000,
    interestRate: 2.8,
    tenure: 15,
    repaymentFrequency: 'daily',
    totalAmount: 5210,
    paidAmount: 0,
    remainingAmount: 5210,
    status: 'defaulted',
    disbursedAt: new Date('2024-01-10'),
    dueDate: new Date('2024-01-25'),
    nextPaymentDate: new Date('2024-01-11')
  }
];

// Local borrower cache populated from backend
const emptyBorrowerMap: { [key: string]: string } = {};

export const LoansManagement: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loans, setLoans] = useState<Loan[]>(mockLoans);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [borrowerMap, setBorrowerMap] = useState<{ [key: string]: string }>(emptyBorrowerMap);

  const [lines, setLines] = React.useState<any[]>([]);

  // Load data on component mount
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [loansData, borrowersData, linesData] = await Promise.all([
          dataService.getLoans(),
          dataService.getBorrowers(),
          dataService.getLines()
        ]);
        setLoans(loansData);
        setLines(linesData);
        const map: { [key: string]: string } = {};
        borrowersData.forEach((br: Borrower) => { map[br.id] = br.name; });
        setBorrowerMap(map);
      } catch (error) {
        console.error('Error loading loans:', error);
      }
    };

    loadData();
  }, []);

  const filteredLoans = loans.filter(loan => {
  const borrowerName = borrowerMap[loan.borrowerId] || '';
    const matchesSearch = loan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         borrowerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'overdue':
        return 'bg-yellow-100 text-yellow-700';
      case 'defaulted':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4" />;
      case 'defaulted':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleCreateLoan = () => {
    setShowCreateModal(true);
  };

  const { push: pushToast } = useToast();

  const handleCreateLoanSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const amount = parseInt(formData.get('amount') as string);
    const interestRate = parseFloat(formData.get('interestRate') as string);
    const tenure = parseInt(formData.get('tenure') as string);
    const totalAmount = amount + (amount * interestRate / 100);
    
    const newLoan = {
      borrowerId: formData.get('borrowerId') as string,
      lineId: formData.get('lineId') as string,
      agentId: user!.id,
      amount,
      interestRate,
      tenure,
      repaymentFrequency: formData.get('repaymentFrequency') as 'daily' | 'weekly' | 'monthly',
      totalAmount,
      dueDate: new Date(Date.now() + tenure * 24 * 60 * 60 * 1000)
    };

    try {
      const createdLoan = await dataService.createLoan(newLoan);
      setLoans([...loans, createdLoan]);
      setShowCreateModal(false);
      pushToast({ type: 'success', message: 'Loan created successfully' });
    } catch (error) {
      console.error('Error creating loan:', error);
      pushToast({ type: 'error', message: (error as any)?.message || 'Failed to create loan' });
    }
  };

  const handleViewLoan = (loan: Loan) => {
    setSelectedLoan(loan);
    setShowDetailsModal(true);
  };

  const getTitle = () => {
    switch (user?.role) {
      case 'owner':
        return 'Loan Overview';
      case 'co-owner':
        return 'Loans';
      case 'agent':
        return 'Active Loans';
      default:
        return 'Loans';
    }
  };

  const calculateProgress = (loan: Loan) => {
    const total = Number(loan.totalAmount) || 0;
    const paid = Number(loan.paidAmount) || 0;
    if (total <= 0) return 0;
    return (paid / total) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{getTitle()}</h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'agent' 
              ? 'Manage loan disbursements and track repayments'
              : 'Monitor loan performance across all lines'
            }
          </p>
        </div>
        {(user?.role === 'agent' || user?.role === 'owner' || user?.role === 'co-owner') && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateLoan}
            className="bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-600 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>New Loan</span>
          </motion.button>
        )}
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Loans</h3>
          <p className="text-2xl font-bold text-gray-800">{loans.length}</p>
          <p className="text-sm text-gray-500">All time</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Active Loans</h3>
          <p className="text-2xl font-bold text-gray-800">
            {loans.filter(l => l.status === 'active').length}
          </p>
          <p className="text-sm text-green-600">Currently running</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Overdue</h3>
          <p className="text-2xl font-bold text-gray-800">
            {loans.filter(l => l.status === 'overdue' || l.status === 'defaulted').length}
          </p>
          <p className="text-sm text-yellow-600">Needs attention</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Disbursed</h3>
          <p className="text-2xl font-bold text-gray-800">
            ₹{loans.reduce((sum, loan) => sum + loan.amount, 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">Principal amount</p>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search loans by ID or borrower name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
              <option value="defaulted">Defaulted</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Loans Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Loan ID</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Borrower</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Amount</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Progress</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Due Date</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Status</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLoans.map((loan, index) => (
                <motion.tr
                  key={loan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-800">{loan.id}</p>
                      <p className="text-sm text-gray-500">{loan.repaymentFrequency}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-800">{borrowerMap[loan.borrowerId] || loan.borrowerId}</p>
                      {/* ID removed - show only borrower name for clarity */}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-800">₹{loan.amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">{loan.interestRate}% interest</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">₹{loan.paidAmount.toLocaleString()}</span>
                        <span className="text-gray-600">₹{loan.totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(0, Number(calculateProgress(loan))) )}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">{Number(calculateProgress(loan)).toFixed(1)}% completed</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-800">{loan.dueDate.toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(loan.status)}`}>
                      {getStatusIcon(loan.status)}
                      <span className="capitalize">{loan.status}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleViewLoan(loan)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                      {user?.role === 'agent' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <TrendingUp className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Create Loan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Loan</h2>
            <form className="space-y-4" onSubmit={handleCreateLoanSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Borrower
                </label>
                <select name="borrowerId" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" required>
                  <option value="">Choose borrower</option>
                  {Object.entries(borrowerMap).length > 0 ? (
                    Object.entries(borrowerMap).map(([id, name]) => (
                      <option key={id} value={id}>{name}</option>
                    ))
                  ) : (
                    <option value="">No borrowers loaded</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Line
                </label>
                <select name="lineId" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" required>
                  <option value="">Choose line</option>
                  {lines.map(line => (
                    <option key={line.id} value={line.id}>{line.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Amount (₹)
                </label>
                <input
                  type="number"
                  name="amount"
                  placeholder="10000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interest Rate (%)
                </label>
                <input
                  type="number"
                  name="interestRate"
                  step="0.1"
                  placeholder="2.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tenure (Days)
                </label>
                <input
                  type="number"
                  name="tenure"
                  placeholder="30"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Repayment Frequency
                </label>
                <select name="repaymentFrequency" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" required>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-emerald-600 transition-colors"
                >
                  Create Loan
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Loan Details Modal */}
      {showDetailsModal && selectedLoan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Loan Details - {selectedLoan.id}</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Status and Progress */}
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedLoan.status)}`}>
                  {getStatusIcon(selectedLoan.status)}
                  <span className="capitalize">{selectedLoan.status}</span>
                </span>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-800">{calculateProgress(selectedLoan)}%</p>
                  <p className="text-sm text-gray-500">Completed</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Paid: ₹{selectedLoan.paidAmount.toLocaleString()}</span>
                  <span className="text-gray-600">Total: ₹{selectedLoan.totalAmount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-emerald-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${calculateProgress(selectedLoan)}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500">Remaining: ₹{selectedLoan.remainingAmount.toLocaleString()}</p>
              </div>

              {/* Loan Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Loan Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Borrower:</span>
                      <span className="font-medium">{borrowerMap[selectedLoan.borrowerId] || selectedLoan.borrowerId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Principal:</span>
                      <span className="font-medium">₹{selectedLoan.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Interest Rate:</span>
                      <span className="font-medium">{selectedLoan.interestRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tenure:</span>
                      <span className="font-medium">{selectedLoan.tenure} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Frequency:</span>
                      <span className="font-medium capitalize">{selectedLoan.repaymentFrequency}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Timeline</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Disbursed:</span>
                      <span className="font-medium">{selectedLoan.disbursedAt.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Due Date:</span>
                      <span className="font-medium">{selectedLoan.dueDate.toLocaleDateString()}</span>
                    </div>
                    {selectedLoan.completedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Completed:</span>
                        <span className="font-medium text-green-600">{selectedLoan.completedAt.toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {user?.role === 'agent' && selectedLoan.status === 'active' && (
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-emerald-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <TrendingUp className="w-5 h-5" />
                    <span>Record Payment</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Edit className="w-5 h-5" />
                    <span>Edit Terms</span>
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};