import { User, Line, Borrower, Loan, Payment, Commission, Notification } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('penny-count-token');
  console.log('API REQUEST TOKEN:', token); // Debug: verify token sent
  return token ? { Authorization: `Bearer ${token}` } : {};
}

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    let errorMsg = 'Failed to fetch';
    try {
      const data = await res.json();
      errorMsg = data.message || errorMsg;
    } catch {
      const txt = await res.text().catch(() => '');
      if (txt) errorMsg = txt;
    }
    throw new HttpError(res.status, errorMsg);
  }
  return res.json();
}

class DataService {
  // Normalize a line object from backend to frontend-friendly shape
  private normalizeLine(raw: any) {
    if (!raw) return null;
    const id = raw.id || raw._id || (raw._id && raw._id.toString && raw._id.toString());
    const createdAt = raw.createdAt ? new Date(raw.createdAt) : new Date();
    const initialCapital = raw.initialCapital !== undefined ? Number(raw.initialCapital) || 0 : 0;
    const currentBalance = raw.currentBalance !== undefined ? Number(raw.currentBalance) || 0 : initialCapital;
    const totalDisbursed = raw.totalDisbursed !== undefined ? Number(raw.totalDisbursed) || 0 : 0;
    const totalCollected = raw.totalCollected !== undefined ? Number(raw.totalCollected) || 0 : 0;
    const borrowerCount = raw.borrowerCount !== undefined ? Number(raw.borrowerCount) || 0 : 0;
    const isActive = raw.isActive === undefined ? true : Boolean(raw.isActive);
    const interestRate = raw.interestRate !== undefined ? Number(raw.interestRate) || 0 : 0;
    const defaultTenure = raw.defaultTenure !== undefined ? Number(raw.defaultTenure) || 0 : 0;

    return {
      id,
      name: raw.name || 'Unnamed Line',
      ownerId: raw.ownerId || raw.owner || undefined,
      coOwnerId: raw.coOwnerId || undefined,
      agentId: raw.agentId || undefined,
      initialCapital,
      currentBalance,
      totalDisbursed,
      totalCollected,
      borrowerCount,
      isActive,
      createdAt,
      interestRate,
      defaultTenure
    } as any;
  }
  // Normalize a user object from backend to a consistent frontend shape
  private normalizeUser(raw: any) {
    if (!raw) return null;
    const id = raw.id
      ? String(raw.id)
      : (raw._id ? (typeof raw._id === 'string' ? raw._id : (raw._id && raw._id.toString ? raw._id.toString() : String(raw._id))) : undefined);
    return {
      id,
      _id: raw._id,
      name: raw.name || 'Unnamed',
      email: raw.email,
      phone: raw.phone || '',
      role: raw.role || 'agent',
      photo: raw.photo,
      createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
      isActive: raw.isActive === undefined ? true : Boolean(raw.isActive),
      assignedLines: raw.assignedLines || []
    } as User;
  }
  // Normalize a borrower object
  private normalizeBorrower(raw: any) {
    if (!raw) return null;
    const id = raw.id || raw._id || (raw._id && raw._id.toString && raw._id.toString());
    return {
      id,
      name: raw.name || 'Unnamed',
      phone: raw.phone || '',
      address: raw.address || '',
      geolocation: raw.geolocation,
      isHighRisk: raw.isHighRisk === undefined ? false : Boolean(raw.isHighRisk),
      isDefaulter: raw.isDefaulter === undefined ? false : Boolean(raw.isDefaulter),
      totalLoans: raw.totalLoans !== undefined ? Number(raw.totalLoans) || 0 : 0,
      activeLoans: raw.activeLoans !== undefined ? Number(raw.activeLoans) || 0 : 0,
      totalRepaid: raw.totalRepaid !== undefined ? Number(raw.totalRepaid) || 0 : 0,
      createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
      lineId: raw.lineId || undefined
    } as any;
  }
  // Normalize a loan object to ensure dates and numeric fields are correct
  private normalizeLoan(raw: any) {
    if (!raw) return null;
    const id = raw.id || raw._id || (raw._id && raw._id.toString && raw._id.toString());
    const disbursedAt = raw.disbursedAt ? new Date(raw.disbursedAt) : new Date();
    const dueDate = raw.dueDate ? new Date(raw.dueDate) : new Date();
    const completedAt = raw.completedAt ? new Date(raw.completedAt) : undefined;
    const amount = raw.amount !== undefined ? Number(raw.amount) || 0 : 0;
    const interestRate = raw.interestRate !== undefined ? Number(raw.interestRate) || 0 : 0;
    const tenure = raw.tenure !== undefined ? Number(raw.tenure) || 0 : 0;
    const totalAmount = raw.totalAmount !== undefined ? Number(raw.totalAmount) || amount : amount;
    const paidAmount = raw.paidAmount !== undefined ? Number(raw.paidAmount) || 0 : 0;
    const remainingAmount = raw.remainingAmount !== undefined ? Number(raw.remainingAmount) || (totalAmount - paidAmount) : (totalAmount - paidAmount);
    const status = raw.status || 'active';
    const repaymentFrequency = raw.repaymentFrequency || 'daily';
    const nextPaymentDate = raw.nextPaymentDate ? new Date(raw.nextPaymentDate) : undefined;

    return {
      id,
      borrowerId: raw.borrowerId,
      lineId: raw.lineId,
      agentId: raw.agentId,
      amount,
      interestRate,
      tenure,
      repaymentFrequency,
      totalAmount,
      paidAmount,
      remainingAmount,
      status,
      disbursedAt,
      dueDate,
      completedAt,
      nextPaymentDate,
      dailyAmount: raw.dailyAmount !== undefined ? Number(raw.dailyAmount) : undefined,
      weeklyAmount: raw.weeklyAmount !== undefined ? Number(raw.weeklyAmount) : undefined,
      monthlyAmount: raw.monthlyAmount !== undefined ? Number(raw.monthlyAmount) : undefined
    } as any;
  }
  // USERS
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_URL}/users`, {
      headers: getAuthHeaders()
    });
    const data = await handleResponse(res);
    if (!Array.isArray(data)) return [];
    return data.map((u: any) => this.normalizeUser(u) as User);
  }
  async getUserById(id: string): Promise<User> {
    const res = await fetch(`${API_URL}/users/${id}`, { headers: getAuthHeaders() });
    if (!res.ok) {
      let errMsg = `HTTP ${res.status} ${res.statusText}`;
      try {
        const data = await res.json();
        errMsg = `HTTP ${res.status} ${data.message || res.statusText}`;
      } catch {
        // fallback to text
        try {
          const txt = await res.text();
          if (txt) errMsg = `HTTP ${res.status} ${txt}`;
        } catch {}
      }
      throw new Error(errMsg);
    }
    return res.json();
  }
  async createUser(user: Partial<User>): Promise<User> {
    const res = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(user)
    });
    return handleResponse(res);
  }
  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(updates)
    });
    return handleResponse(res);
  }
  async deleteUser(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/users/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    await handleResponse(res);
  }

  // LINES
  async getLines(): Promise<Line[]> {
    const res = await fetch(`${API_URL}/lines`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch lines');
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((l: any) => this.normalizeLine(l));
  }
  async createLine(line: Partial<Line>): Promise<Line> {
    const res = await fetch(`${API_URL}/lines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(line)
    });
    if (!res.ok) throw new Error('Failed to create line');
    const created = await res.json();
    return this.normalizeLine(created) as Line;
  }
  async updateLine(id: string, updates: Partial<Line>): Promise<Line> {
    const res = await fetch(`${API_URL}/lines/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update line');
    return res.json();
  }
  async deleteLine(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/lines/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to delete line');
  }

  // BORROWERS
  async getBorrowers(): Promise<Borrower[]> {
    const res = await fetch(`${API_URL}/borrowers`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch borrowers');
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((b: any) => this.normalizeBorrower(b));
  }
  async createBorrower(borrower: Partial<Borrower>): Promise<Borrower> {
    const res = await fetch(`${API_URL}/borrowers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(borrower)
    });
    if (!res.ok) throw new Error('Failed to create borrower');
    const created = await res.json();
    return this.normalizeBorrower(created) as Borrower;
  }
  async updateBorrower(id: string, updates: Partial<Borrower>): Promise<Borrower> {
    const res = await fetch(`${API_URL}/borrowers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update borrower');
    const updated = await res.json();
    return this.normalizeBorrower(updated) as Borrower;
  }
  async deleteBorrower(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/borrowers/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to delete borrower');
  }

  // LOANS
  async getLoans(): Promise<Loan[]> {
    const res = await fetch(`${API_URL}/loans`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch loans');
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((l: any) => this.normalizeLoan(l));
  }
  async createLoan(loan: Partial<Loan>): Promise<Loan> {
    const res = await fetch(`${API_URL}/loans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(loan)
    });
    if (!res.ok) throw new Error('Failed to create loan');
    const created = await res.json();
    return this.normalizeLoan(created) as Loan;
  }
  async updateLoan(id: string, updates: Partial<Loan>): Promise<Loan> {
    const res = await fetch(`${API_URL}/loans/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update loan');
    const updated = await res.json();
    return this.normalizeLoan(updated) as Loan;
  }
  async deleteLoan(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/loans/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to delete loan');
  }

  // PAYMENTS
  async getPayments(): Promise<Payment[]> {
    const res = await fetch(`${API_URL}/payments`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch payments');
    return res.json();
  }
  async createPayment(payment: Partial<Payment>): Promise<Payment> {
    const res = await fetch(`${API_URL}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payment)
    });
    if (!res.ok) throw new Error('Failed to create payment');
    return res.json();
  }
  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment> {
    const res = await fetch(`${API_URL}/payments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update payment');
    return res.json();
  }
  async deletePayment(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/payments/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to delete payment');
  }

  // COMMISSIONS
  async getCommissions(): Promise<Commission[]> {
    const res = await fetch(`${API_URL}/commissions`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch commissions');
    return res.json();
  }
  async createCommission(commission: Partial<Commission>): Promise<Commission> {
    const res = await fetch(`${API_URL}/commissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(commission)
    });
    if (!res.ok) throw new Error('Failed to create commission');
    return res.json();
  }
  async updateCommission(id: string, updates: Partial<Commission>): Promise<Commission> {
    const res = await fetch(`${API_URL}/commissions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update commission');
    return res.json();
  }
  async deleteCommission(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/commissions/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to delete commission');
  }

  // NOTIFICATIONS (example, read-only)
  async getNotifications(userId: string): Promise<Notification[]> {
    const res = await fetch(`${API_URL}/notifications?userId=${userId}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  }
  async markNotificationRead(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/notifications/${id}/read`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to mark notification read');
  }

  // DASHBOARD METRICS (example, protected)
  async getDashboardMetrics(userId: string, role: string): Promise<any> {
    const res = await fetch(`${API_URL}/analytics?userId=${userId}&role=${role}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
    return res.json();
  }
}

export const dataService = new DataService();