import { supabase } from '../lib/supabase';
import { User, Line, Borrower, Loan, Payment, Commission, Notification, DashboardMetrics } from '../types';

class DataService {
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getUserById(id: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('User not found');
    return data;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getLines(): Promise<Line[]> {
    const { data, error } = await supabase
      .from('lines')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(line => ({
      id: line.id,
      name: line.name,
      ownerId: line.owner_id,
      coOwnerId: line.co_owner_id,
      agentId: line.agent_id,
      initialCapital: Number(line.initial_capital),
      currentBalance: Number(line.current_balance),
      totalDisbursed: Number(line.total_disbursed),
      totalCollected: Number(line.total_collected),
      borrowerCount: line.borrower_count,
      interestRate: Number(line.interest_rate),
      defaultTenure: line.default_tenure,
      isActive: line.is_active,
      createdAt: new Date(line.created_at)
    }));
  }

  async createLine(line: Partial<Line>): Promise<Line> {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('lines')
      .insert({
        name: line.name,
        owner_id: user?.id,
        co_owner_id: line.coOwnerId,
        agent_id: line.agentId,
        initial_capital: line.initialCapital || 0,
        current_balance: line.initialCapital || 0,
        interest_rate: line.interestRate || 10,
        default_tenure: line.defaultTenure || 30,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      ownerId: data.owner_id,
      coOwnerId: data.co_owner_id,
      agentId: data.agent_id,
      initialCapital: Number(data.initial_capital),
      currentBalance: Number(data.current_balance),
      totalDisbursed: Number(data.total_disbursed),
      totalCollected: Number(data.total_collected),
      borrowerCount: data.borrower_count,
      interestRate: Number(data.interest_rate),
      defaultTenure: data.default_tenure,
      isActive: data.is_active,
      createdAt: new Date(data.created_at)
    };
  }

  async updateLine(id: string, updates: Partial<Line>): Promise<Line> {
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.coOwnerId !== undefined) updateData.co_owner_id = updates.coOwnerId;
    if (updates.agentId !== undefined) updateData.agent_id = updates.agentId;
    if (updates.initialCapital !== undefined) updateData.initial_capital = updates.initialCapital;
    if (updates.currentBalance !== undefined) updateData.current_balance = updates.currentBalance;
    if (updates.interestRate !== undefined) updateData.interest_rate = updates.interestRate;
    if (updates.defaultTenure !== undefined) updateData.default_tenure = updates.defaultTenure;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

    const { data, error } = await supabase
      .from('lines')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      ownerId: data.owner_id,
      coOwnerId: data.co_owner_id,
      agentId: data.agent_id,
      initialCapital: Number(data.initial_capital),
      currentBalance: Number(data.current_balance),
      totalDisbursed: Number(data.total_disbursed),
      totalCollected: Number(data.total_collected),
      borrowerCount: data.borrower_count,
      interestRate: Number(data.interest_rate),
      defaultTenure: data.default_tenure,
      isActive: data.is_active,
      createdAt: new Date(data.created_at)
    };
  }

  async deleteLine(id: string): Promise<void> {
    const { error } = await supabase
      .from('lines')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getBorrowers(): Promise<Borrower[]> {
    const { data, error } = await supabase
      .from('borrowers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(borrower => ({
      id: borrower.id,
      name: borrower.name,
      phone: borrower.phone,
      address: borrower.address,
      geolocation: borrower.geolocation,
      isHighRisk: borrower.is_high_risk,
      isDefaulter: borrower.is_defaulter,
      totalLoans: borrower.total_loans,
      activeLoans: borrower.active_loans,
      totalRepaid: Number(borrower.total_repaid),
      lineId: borrower.line_id,
      agentId: borrower.agent_id,
      createdAt: new Date(borrower.created_at)
    }));
  }

  async createBorrower(borrower: Partial<Borrower>): Promise<Borrower> {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('borrowers')
      .insert({
        name: borrower.name,
        phone: borrower.phone,
        address: borrower.address || '',
        line_id: borrower.lineId,
        agent_id: user?.id
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      phone: data.phone,
      address: data.address,
      geolocation: data.geolocation,
      isHighRisk: data.is_high_risk,
      isDefaulter: data.is_defaulter,
      totalLoans: data.total_loans,
      activeLoans: data.active_loans,
      totalRepaid: Number(data.total_repaid),
      lineId: data.line_id,
      agentId: data.agent_id,
      createdAt: new Date(data.created_at)
    };
  }

  async updateBorrower(id: string, updates: Partial<Borrower>): Promise<Borrower> {
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.address !== undefined) updateData.address = updates.address;
    if (updates.isHighRisk !== undefined) updateData.is_high_risk = updates.isHighRisk;
    if (updates.isDefaulter !== undefined) updateData.is_defaulter = updates.isDefaulter;

    const { data, error } = await supabase
      .from('borrowers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      phone: data.phone,
      address: data.address,
      geolocation: data.geolocation,
      isHighRisk: data.is_high_risk,
      isDefaulter: data.is_defaulter,
      totalLoans: data.total_loans,
      activeLoans: data.active_loans,
      totalRepaid: Number(data.total_repaid),
      lineId: data.line_id,
      agentId: data.agent_id,
      createdAt: new Date(data.created_at)
    };
  }

  async deleteBorrower(id: string): Promise<void> {
    const { error } = await supabase
      .from('borrowers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getLoans(): Promise<Loan[]> {
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(loan => ({
      id: loan.id,
      borrowerId: loan.borrower_id,
      lineId: loan.line_id,
      amount: Number(loan.principal),
      interestRate: Number(loan.interest_rate),
      totalAmount: Number(loan.total_amount),
      paidAmount: Number(loan.amount_paid),
      remainingAmount: Number(loan.balance),
      status: loan.status,
      tenure: loan.tenure,
      disbursedAt: new Date(loan.disbursed_date),
      dueDate: new Date(loan.due_date),
      createdAt: new Date(loan.created_at)
    }));
  }

  async createLoan(loan: Partial<Loan>): Promise<Loan> {
    const principal = loan.amount || 0;
    const interestRate = loan.interestRate || 10;
    const totalAmount = principal * (1 + interestRate / 100);
    const tenure = loan.tenure || 30;
    const disbursedDate = loan.disbursedAt || new Date();
    const dueDate = new Date(disbursedDate);
    dueDate.setDate(dueDate.getDate() + tenure);

    const { data, error } = await supabase
      .from('loans')
      .insert({
        borrower_id: loan.borrowerId,
        line_id: loan.lineId,
        principal,
        interest_rate: interestRate,
        total_amount: totalAmount,
        balance: totalAmount,
        tenure,
        disbursed_date: disbursedDate.toISOString(),
        due_date: dueDate.toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.rpc('increment', {
      table_name: 'lines',
      column_name: 'total_disbursed',
      row_id: loan.lineId,
      amount: principal
    }).catch(() => {});

    await supabase.rpc('decrement', {
      table_name: 'lines',
      column_name: 'current_balance',
      row_id: loan.lineId,
      amount: principal
    }).catch(() => {});

    return {
      id: data.id,
      borrowerId: data.borrower_id,
      lineId: data.line_id,
      amount: Number(data.principal),
      interestRate: Number(data.interest_rate),
      totalAmount: Number(data.total_amount),
      paidAmount: Number(data.amount_paid),
      remainingAmount: Number(data.balance),
      status: data.status,
      tenure: data.tenure,
      disbursedAt: new Date(data.disbursed_date),
      dueDate: new Date(data.due_date),
      createdAt: new Date(data.created_at)
    };
  }

  async updateLoan(id: string, updates: Partial<Loan>): Promise<Loan> {
    const updateData: any = {};
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.paidAmount !== undefined) {
      updateData.amount_paid = updates.paidAmount;
      const { data: loan } = await supabase.from('loans').select('total_amount').eq('id', id).single();
      if (loan) {
        updateData.balance = Number(loan.total_amount) - updates.paidAmount;
      }
    }

    const { data, error } = await supabase
      .from('loans')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      borrowerId: data.borrower_id,
      lineId: data.line_id,
      amount: Number(data.principal),
      interestRate: Number(data.interest_rate),
      totalAmount: Number(data.total_amount),
      paidAmount: Number(data.amount_paid),
      remainingAmount: Number(data.balance),
      status: data.status,
      tenure: data.tenure,
      disbursedAt: new Date(data.disbursed_date),
      dueDate: new Date(data.due_date),
      createdAt: new Date(data.created_at)
    };
  }

  async deleteLoan(id: string): Promise<void> {
    const { error } = await supabase
      .from('loans')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getPayments(): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('payment_date', { ascending: false });

    if (error) throw error;

    return (data || []).map(payment => ({
      id: payment.id,
      loanId: payment.loan_id,
      amount: Number(payment.amount),
      paymentDate: new Date(payment.payment_date),
      collectedBy: payment.collected_by,
      notes: payment.notes,
      createdAt: new Date(payment.created_at)
    }));
  }

  async createPayment(payment: Partial<Payment>): Promise<Payment> {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('payments')
      .insert({
        loan_id: payment.loanId,
        amount: payment.amount,
        payment_date: payment.paymentDate || new Date().toISOString(),
        collected_by: user?.id,
        notes: payment.notes
      })
      .select()
      .single();

    if (error) throw error;

    const { data: loan } = await supabase
      .from('loans')
      .select('amount_paid, line_id')
      .eq('id', payment.loanId)
      .single();

    if (loan) {
      const newPaidAmount = Number(loan.amount_paid) + (payment.amount || 0);
      await this.updateLoan(payment.loanId!, { paidAmount: newPaidAmount });

      await supabase.rpc('increment', {
        table_name: 'lines',
        column_name: 'total_collected',
        row_id: loan.line_id,
        amount: payment.amount
      }).catch(() => {});

      await supabase.rpc('increment', {
        table_name: 'lines',
        column_name: 'current_balance',
        row_id: loan.line_id,
        amount: payment.amount
      }).catch(() => {});
    }

    return {
      id: data.id,
      loanId: data.loan_id,
      amount: Number(data.amount),
      paymentDate: new Date(data.payment_date),
      collectedBy: data.collected_by,
      notes: data.notes,
      createdAt: new Date(data.created_at)
    };
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment> {
    const updateData: any = {};
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.notes !== undefined) updateData.notes = updates.notes;

    const { data, error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      loanId: data.loan_id,
      amount: Number(data.amount),
      paymentDate: new Date(data.payment_date),
      collectedBy: data.collected_by,
      notes: data.notes,
      createdAt: new Date(data.created_at)
    };
  }

  async deletePayment(id: string): Promise<void> {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getCommissions(): Promise<Commission[]> {
    const { data, error } = await supabase
      .from('commissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(commission => ({
      id: commission.id,
      agentId: commission.agent_id,
      lineId: commission.line_id,
      amount: Number(commission.amount),
      periodStart: new Date(commission.period_start),
      periodEnd: new Date(commission.period_end),
      status: commission.status,
      paidDate: commission.paid_date ? new Date(commission.paid_date) : undefined,
      createdAt: new Date(commission.created_at)
    }));
  }

  async createCommission(commission: Partial<Commission>): Promise<Commission> {
    const { data, error } = await supabase
      .from('commissions')
      .insert({
        agent_id: commission.agentId,
        line_id: commission.lineId,
        amount: commission.amount,
        period_start: commission.periodStart,
        period_end: commission.periodEnd,
        status: commission.status || 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      agentId: data.agent_id,
      lineId: data.line_id,
      amount: Number(data.amount),
      periodStart: new Date(data.period_start),
      periodEnd: new Date(data.period_end),
      status: data.status,
      paidDate: data.paid_date ? new Date(data.paid_date) : undefined,
      createdAt: new Date(data.created_at)
    };
  }

  async updateCommission(id: string, updates: Partial<Commission>): Promise<Commission> {
    const updateData: any = {};
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.paidDate !== undefined) updateData.paid_date = updates.paidDate;

    const { data, error } = await supabase
      .from('commissions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      agentId: data.agent_id,
      lineId: data.line_id,
      amount: Number(data.amount),
      periodStart: new Date(data.period_start),
      periodEnd: new Date(data.period_end),
      status: data.status,
      paidDate: data.paid_date ? new Date(data.paid_date) : undefined,
      createdAt: new Date(data.created_at)
    };
  }

  async deleteCommission(id: string): Promise<void> {
    const { error } = await supabase
      .from('commissions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(notification => ({
      id: notification.id,
      userId: notification.user_id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.is_read,
      createdAt: new Date(notification.created_at)
    }));
  }

  async markNotificationRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;
  }

  async getDashboardMetrics(userId: string, role: string): Promise<DashboardMetrics> {
    const lines = await this.getLines();
    const loans = await this.getLoans();
    const borrowers = await this.getBorrowers();

    let filteredLines = lines;
    if (role === 'agent') {
      filteredLines = lines.filter(l => l.agentId === userId);
    } else if (role === 'co-owner') {
      filteredLines = lines.filter(l => l.ownerId === userId || l.coOwnerId === userId);
    }

    const totalCapital = filteredLines.reduce((sum, l) => sum + l.initialCapital, 0);
    const totalDisbursed = filteredLines.reduce((sum, l) => sum + l.totalDisbursed, 0);
    const totalCollected = filteredLines.reduce((sum, l) => sum + l.totalCollected, 0);
    const cashOnHand = totalCapital - totalDisbursed + totalCollected;

    const activeLoans = loans.filter(l => l.status === 'active' &&
      filteredLines.some(line => line.id === l.lineId));

    const activeBorrowers = borrowers.filter(b =>
      filteredLines.some(line => line.id === b.lineId));

    const collectionEfficiency = totalDisbursed > 0
      ? Math.round((totalCollected / totalDisbursed) * 100)
      : 0;

    return {
      totalCapital,
      cashOnHand,
      activeLoans: activeLoans.length,
      totalBorrowers: activeBorrowers.length,
      collectionEfficiency,
      pendingCollections: activeLoans.reduce((sum, l) => sum + l.remainingAmount, 0),
      lineCount: filteredLines.length,
      recentActivity: []
    };
  }
}

export const dataService = new DataService();
