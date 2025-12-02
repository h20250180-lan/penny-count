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
      serialNumber: borrower.serial_number,
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
        serial_number: borrower.serialNumber,
        name: borrower.name,
        phone: borrower.phone,
        address: borrower.address || '',
        line_id: borrower.lineId,
        agent_id: borrower.agentId || user?.id
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      serialNumber: data.serial_number,
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
    if (updates.serialNumber !== undefined) updateData.serial_number = updates.serialNumber;
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
      serialNumber: data.serial_number,
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

  async getLoansByBorrower(borrowerId: string): Promise<Loan[]> {
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .eq('borrower_id', borrowerId)
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

  async getActiveLoansByBorrower(borrowerId: string): Promise<Loan[]> {
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .eq('borrower_id', borrowerId)
      .eq('status', 'active')
      .order('due_date', { ascending: true });

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

    try {
      const { data: line } = await supabase
        .from('lines')
        .select('total_disbursed, current_balance')
        .eq('id', loan.lineId)
        .single();

      if (line) {
        await supabase
          .from('lines')
          .update({
            total_disbursed: Number(line.total_disbursed || 0) + principal,
            current_balance: Number(line.current_balance || 0) - principal
          })
          .eq('id', loan.lineId);
      }
    } catch (e) {
      console.warn('Failed to update line totals:', e);
    }

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

    if (updates.amount !== undefined || updates.interestRate !== undefined || updates.totalAmount !== undefined) {
      const { data: currentLoan } = await supabase.from('loans').select('principal, interest_rate, total_amount, amount_paid').eq('id', id).single();

      const principal = updates.amount !== undefined ? updates.amount : Number(currentLoan?.principal || 0);
      const interestRate = updates.interestRate !== undefined ? updates.interestRate : Number(currentLoan?.interest_rate || 0);
      const totalAmount = updates.totalAmount !== undefined ? updates.totalAmount : Number(currentLoan?.total_amount || 0);
      const paidAmount = Number(currentLoan?.amount_paid || 0);

      updateData.principal = principal;
      updateData.interest_rate = interestRate;
      updateData.total_amount = totalAmount;
      updateData.balance = totalAmount - paidAmount;
    }

    if (updates.tenure !== undefined) {
      updateData.tenure = updates.tenure;
      const { data: currentLoan } = await supabase.from('loans').select('disbursed_date').eq('id', id).single();
      if (currentLoan) {
        const disbursedDate = new Date(currentLoan.disbursed_date);
        const dueDate = new Date(disbursedDate);
        // Tenure is in months
        dueDate.setMonth(dueDate.getMonth() + updates.tenure);
        updateData.due_date = dueDate.toISOString();
      }
    }

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

      try {
        const { data: line } = await supabase
          .from('lines')
          .select('total_collected, current_balance')
          .eq('id', loan.line_id)
          .single();

        if (line) {
          await supabase
            .from('lines')
            .update({
              total_collected: Number(line.total_collected || 0) + (payment.amount || 0),
              current_balance: Number(line.current_balance || 0) + (payment.amount || 0)
            })
            .eq('id', loan.line_id);
        }
      } catch (e) {
        console.warn('Failed to update line totals:', e);
      }
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

  async getExpenseCategories(): Promise<any[]> {
    const { data, error } = await supabase
      .from('expense_categories')
      .select('*')
      .order('name');

    if (error) throw error;

    return (data || []).map(cat => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      budgetLimit: cat.budget_limit ? Number(cat.budget_limit) : undefined,
      requiresApproval: cat.requires_approval,
      isActive: cat.is_active,
      createdAt: new Date(cat.created_at)
    }));
  }

  async getExpenses(): Promise<any[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        category:expense_categories(*),
        submittedByUser:users!expenses_submitted_by_fkey(*),
        approvedByUser:users!expenses_approved_by_fkey(*)
      `)
      .order('expense_date', { ascending: false });

    if (error) throw error;

    return (data || []).map(exp => ({
      id: exp.id,
      lineId: exp.line_id,
      categoryId: exp.category_id,
      amount: Number(exp.amount),
      expenseDate: new Date(exp.expense_date),
      description: exp.description,
      receiptUrl: exp.receipt_url,
      paymentMethod: exp.payment_method,
      submittedBy: exp.submitted_by,
      approvedBy: exp.approved_by,
      status: exp.status,
      rejectionReason: exp.rejection_reason,
      approvedAt: exp.approved_at ? new Date(exp.approved_at) : undefined,
      paidAt: exp.paid_at ? new Date(exp.paid_at) : undefined,
      createdAt: new Date(exp.created_at)
    }));
  }

  async getExpensesByDate(date: string, lineId?: string): Promise<any[]> {
    let query = supabase
      .from('expenses')
      .select(`
        *,
        category:expense_categories(*),
        submittedByUser:users!expenses_submitted_by_fkey(*)
      `)
      .eq('expense_date', date);

    if (lineId) {
      query = query.eq('line_id', lineId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async createExpense(expense: any): Promise<any> {
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        line_id: expense.lineId || null,
        category_id: expense.categoryId,
        amount: expense.amount,
        expense_date: expense.expenseDate,
        description: expense.description,
        receipt_url: expense.receiptUrl,
        payment_method: expense.paymentMethod,
        submitted_by: expense.submittedBy,
        status: 'approved',
        approved_by: expense.submittedBy,
        approved_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    if (expense.lineId) {
      const { data: lineData, error: lineError } = await supabase
        .from('lines')
        .select('current_balance')
        .eq('id', expense.lineId)
        .single();

      if (!lineError && lineData) {
        const newBalance = Number(lineData.current_balance) - Number(expense.amount);
        await supabase
          .from('lines')
          .update({ current_balance: newBalance })
          .eq('id', expense.lineId);
      }
    }

    return {
      id: data.id,
      lineId: data.line_id,
      categoryId: data.category_id,
      amount: Number(data.amount),
      expenseDate: new Date(data.expense_date),
      description: data.description,
      receiptUrl: data.receipt_url,
      paymentMethod: data.payment_method,
      submittedBy: data.submitted_by,
      approvedBy: data.approved_by,
      status: data.status,
      rejectionReason: data.rejection_reason,
      approvedAt: data.approved_at ? new Date(data.approved_at) : undefined,
      paidAt: data.paid_at ? new Date(data.paid_at) : undefined,
      createdAt: new Date(data.created_at)
    };
  }

  async updateExpense(id: string, updates: any): Promise<any> {
    const { data, error } = await supabase
      .from('expenses')
      .update({
        status: updates.status,
        approved_by: updates.approvedBy,
        rejection_reason: updates.rejectionReason,
        approved_at: updates.approvedAt,
        paid_at: updates.paidAt
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      lineId: data.line_id,
      categoryId: data.category_id,
      amount: Number(data.amount),
      expenseDate: new Date(data.expense_date),
      description: data.description,
      receiptUrl: data.receipt_url,
      paymentMethod: data.payment_method,
      submittedBy: data.submitted_by,
      approvedBy: data.approved_by,
      status: data.status,
      rejectionReason: data.rejection_reason,
      approvedAt: data.approved_at ? new Date(data.approved_at) : undefined,
      paidAt: data.paid_at ? new Date(data.paid_at) : undefined,
      createdAt: new Date(data.created_at)
    };
  }

  async getDailyAccount(date: string, lineId?: string): Promise<any> {
    let query = supabase
      .from('daily_accounts')
      .select('*')
      .eq('account_date', date);

    if (lineId) {
      query = query.eq('line_id', lineId);
    } else {
      query = query.is('line_id', null);
    }

    const { data, error } = await query.maybeSingle();

    if (error) throw error;

    if (!data) {
      const newAccount = await this.createDailyAccount(date, lineId);
      return newAccount;
    }

    return {
      id: data.id,
      accountDate: data.account_date,
      lineId: data.line_id,
      openingBalance: data.opening_balance,
      isLocked: data.is_locked,
      lockedBy: data.locked_by,
      lockedAt: data.locked_at,
      createdBy: data.created_by,
      createdAt: data.created_at
    };
  }

  async createDailyAccount(date: string, lineId?: string): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('daily_accounts')
      .insert({
        account_date: date,
        line_id: lineId || null,
        opening_balance: 0,
        created_by: user?.id
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      accountDate: data.account_date,
      lineId: data.line_id,
      openingBalance: data.opening_balance,
      isLocked: data.is_locked,
      lockedBy: data.locked_by,
      lockedAt: data.locked_at,
      createdBy: data.created_by,
      createdAt: data.created_at
    };
  }

  async updateDailyAccount(id: string, updates: any): Promise<any> {
    const snakeCaseUpdates: any = {};

    if (updates.openingBalance !== undefined) snakeCaseUpdates.opening_balance = updates.openingBalance;
    if (updates.isLocked !== undefined) snakeCaseUpdates.is_locked = updates.isLocked;
    if (updates.lockedBy !== undefined) snakeCaseUpdates.locked_by = updates.lockedBy;
    if (updates.lockedAt !== undefined) snakeCaseUpdates.locked_at = updates.lockedAt;

    const { data, error } = await supabase
      .from('daily_accounts')
      .update(snakeCaseUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      accountDate: data.account_date,
      lineId: data.line_id,
      openingBalance: data.opening_balance,
      isLocked: data.is_locked,
      lockedBy: data.locked_by,
      lockedAt: data.locked_at,
      createdBy: data.created_by,
      createdAt: data.created_at
    };
  }

  async getPaymentMethods(lineId?: string): Promise<any[]> {
    let query = supabase
      .from('payment_methods')
      .select('*')
      .eq('is_active', true);

    if (lineId) {
      query = query.eq('line_id', lineId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getQRPaymentsByLoan(loanId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('qr_payments')
      .select('*')
      .eq('loan_id', loanId)
      .order('payment_timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getQRPaymentsByDate(date: string, lineId?: string): Promise<any[]> {
    let query = supabase
      .from('qr_payments')
      .select(`
        *,
        loan:loans(*),
        borrower:borrowers(*)
      `)
      .gte('payment_timestamp', `${date}T00:00:00`)
      .lte('payment_timestamp', `${date}T23:59:59`);

    if (lineId) {
      query = query.eq('loan.line_id', lineId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(p => ({
      id: p.id,
      loanId: p.loan_id,
      borrowerId: p.borrower_id,
      paymentMethodId: p.payment_method_id,
      amount: p.amount,
      transactionId: p.transaction_id,
      transactionStatus: p.transaction_status,
      paymentTimestamp: p.payment_timestamp,
      reconciled: p.reconciled,
      reconciledBy: p.reconciled_by,
      reconciledAt: p.reconciled_at,
      notes: p.notes,
      createdAt: p.created_at,
      loan: p.loan,
      borrower: p.borrower
    }));
  }

  async reconcileQRPayment(paymentId: string): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('qr_payments')
      .update({
        reconciled: true,
        reconciled_by: user?.id,
        reconciled_at: new Date().toISOString()
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getPaymentsByDate(date: string, lineId?: string): Promise<any[]> {
    let query = supabase
      .from('payments')
      .select(`
        *,
        loan:loans(*),
        borrower:borrowers(*),
        agent:users!payments_collected_by_fkey(*)
      `)
      .gte('created_at', `${date}T00:00:00`)
      .lte('created_at', `${date}T23:59:59`);

    if (lineId) {
      query = query.eq('loan.line_id', lineId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(p => ({
      ...p,
      agentName: p.agent?.name,
      borrowerName: p.borrower?.name
    }));
  }

  async getActiveCoOwnerSession(coOwnerId: string): Promise<any> {
    const { data, error } = await supabase
      .from('co_owner_agent_sessions')
      .select('*')
      .eq('co_owner_id', coOwnerId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async startCoOwnerAgentSession(coOwnerId: string, lineId: string): Promise<any> {
    const { data, error } = await supabase
      .from('co_owner_agent_sessions')
      .insert({
        co_owner_id: coOwnerId,
        line_id: lineId,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async endCoOwnerAgentSession(sessionId: string): Promise<any> {
    const { data, error } = await supabase
      .from('co_owner_agent_sessions')
      .update({
        is_active: false,
        session_end: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCoOwnerSessionStats(sessionId: string, updates: any): Promise<any> {
    const { data, error } = await supabase
      .from('co_owner_agent_sessions')
      .update({
        collections_made: updates.collectionsMade,
        total_collected: updates.totalCollected,
        commission_earned: updates.commissionEarned
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async exportDailyAccountToExcel(date: string, lineId?: string): Promise<string> {
    console.log('Exporting daily account to Excel for date:', date, 'line:', lineId);
    return '';
  }

  async bulkCreateBorrowers(borrowers: Partial<Borrower>[]): Promise<{ success: Borrower[], failed: { data: Partial<Borrower>, error: string }[] }> {
    const results: Borrower[] = [];
    const failures: { data: Partial<Borrower>, error: string }[] = [];

    for (const borrower of borrowers) {
      try {
        const created = await this.createBorrower(borrower);
        results.push(created);
      } catch (error: any) {
        failures.push({
          data: borrower,
          error: error.message || 'Unknown error'
        });
      }
    }

    return { success: results, failed: failures };
  }

  async checkDuplicateBorrower(phone: string, serialNumber?: string, lineId?: string): Promise<{ exists: boolean, borrower?: Borrower }> {
    let query = supabase
      .from('borrowers')
      .select('*');

    if (phone) {
      query = query.eq('phone', phone);
    }

    const { data, error } = await query.maybeSingle();

    if (error) throw error;

    if (data) {
      return {
        exists: true,
        borrower: {
          id: data.id,
          serialNumber: data.serial_number,
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
        }
      };
    }

    if (serialNumber && lineId) {
      const { data: serialData, error: serialError } = await supabase
        .from('borrowers')
        .select('*')
        .eq('line_id', lineId)
        .eq('serial_number', serialNumber)
        .maybeSingle();

      if (serialError) throw serialError;

      if (serialData) {
        return {
          exists: true,
          borrower: {
            id: serialData.id,
            serialNumber: serialData.serial_number,
            name: serialData.name,
            phone: serialData.phone,
            address: serialData.address,
            geolocation: serialData.geolocation,
            isHighRisk: serialData.is_high_risk,
            isDefaulter: serialData.is_defaulter,
            totalLoans: serialData.total_loans,
            activeLoans: serialData.active_loans,
            totalRepaid: Number(serialData.total_repaid),
            lineId: serialData.line_id,
            agentId: serialData.agent_id,
            createdAt: new Date(serialData.created_at)
          }
        };
      }
    }

    return { exists: false };
  }
}

export const dataService = new DataService();
