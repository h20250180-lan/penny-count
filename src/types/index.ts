export interface User {
  id: string;
  _id?: string;
  name: string;
  email?: string;
  phone: string;
  role: 'owner' | 'co-owner' | 'agent';
  photo?: string;
  createdAt?: Date | string;
  isActive: boolean;
  assignedLines?: string[];
}

export interface Line {
  id: string;
  name: string;
  ownerId: string;
  coOwnerId?: string;
  agentId?: string;
  initialCapital: number;
  currentBalance: number;
  totalDisbursed: number;
  totalCollected: number;
  borrowerCount: number;
  isActive: boolean;
  createdAt: Date;
  interestRate?: number;
  defaultTenure?: number;
}

export interface Borrower {
  id: string;
  lineId: string;
  name: string;
  phone: string;
  address: string;
  photo?: string;
  geolocation?: {
    lat: number;
    lng: number;
  };
  isHighRisk: boolean;
  isDefaulter: boolean;
  totalLoans: number;
  activeLoans: number;
  totalRepaid: number;
  outstandingAmount: number;
  creditScore: number;
  createdAt: Date;
  lastPaymentDate?: Date;
}

export interface Loan {
  id: string;
  borrowerId: string;
  lineId: string;
  agentId: string;
  amount: number;
  interestRate: number;
  tenure: number; // in days
  repaymentFrequency: 'daily' | 'weekly' | 'monthly';
  totalAmount: number; // principal + interest
  paidAmount: number;
  remainingAmount: number;
  status: 'active' | 'completed' | 'defaulted' | 'overdue';
  disbursedAt: Date;
  dueDate: Date;
  completedAt?: Date;
  nextPaymentDate: Date;
  dailyAmount?: number;
  weeklyAmount?: number;
  monthlyAmount?: number;
}

export interface Payment {
  id: string;
  loanId: string;
  borrowerId: string;
  agentId: string;
  amount: number;
  method: 'cash' | 'upi' | 'phonepe' | 'qr' | 'other';
  transactionId?: string;
  receivedAt: Date;
  syncedAt?: Date;
  isOffline: boolean;
  notes?: string;
}

export interface Fine {
  id: string;
  loanId: string;
  borrowerId: string;
  type: 'missed' | 'delayed' | 'partial';
  amount: number;
  reason: string;
  appliedAt: Date;
  isPaid: boolean;
}

export interface Commission {
  id: string;
  coOwnerId: string;
  lineId: string;
  amount: number;
  percentage: number;
  calculatedOn: number; // base amount
  period: string; // e.g., "2024-01"
  paidAt?: Date;
  status: 'pending' | 'paid';
}

export interface DashboardMetrics {
  totalLines: number;
  totalBorrowers: number;
  totalDisbursed: number;
  totalCollected: number;
  activeLoans: number;
  overdueLoans: number;
  collectionEfficiency: number;
  profit: number;
  cashOnHand: number;
  defaultRate: number;
  avgLoanSize: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'payment_due' | 'payment_overdue' | 'loan_approved' | 'commission_paid' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
}

export interface SystemSettings {
  defaultInterestRate: number;
  defaultTenure: number;
  latePaymentFine: number;
  missedPaymentFine: number;
  partialPaymentFine: number;
  commissionRate: number;
  maxLoanAmount: number;
  minLoanAmount: number;
}