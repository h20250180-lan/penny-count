/*
  # Add Missing Foreign Key Indexes

  ## Overview
  Adds indexes on all unindexed foreign key columns to improve query performance.
  Foreign key columns without indexes can cause significant performance degradation
  when joining tables or filtering by related records.

  ## Changes
  Adds indexes for 30+ foreign key columns across tables:
  - borrowers (agent_id)
  - co_owner_agent_sessions (co_owner_id, line_id)
  - commissions (agent_id, line_id)
  - daily_accounts (created_by, locked_by)
  - daily_reports (generated_by, line_id)
  - expenses (approved_by, category_id, line_id, submitted_by)
  - lines (agent_id, co_owner_id, owner_id)
  - loans (borrower_id, line_id)
  - missed_payments (marked_by, payment_id)
  - notifications (user_id)
  - payment_methods (line_id)
  - payments (collected_by, loan_id)
  - penalties (applied_by, payment_id)
  - qr_payments (borrower_id, payment_method_id, reconciled_by)
  - withdrawals (approved_by)

  ## Performance Impact
  - Significantly improves JOIN performance
  - Speeds up foreign key constraint checks
  - Reduces query execution time for filtered queries
  - Essential for queries filtering by line_id, user_id, etc.
*/

-- Borrowers table indexes
CREATE INDEX IF NOT EXISTS idx_borrowers_agent_id ON public.borrowers(agent_id);

-- Co-owner agent sessions indexes
CREATE INDEX IF NOT EXISTS idx_co_owner_agent_sessions_co_owner_id ON public.co_owner_agent_sessions(co_owner_id);
CREATE INDEX IF NOT EXISTS idx_co_owner_agent_sessions_line_id ON public.co_owner_agent_sessions(line_id);

-- Commissions indexes
CREATE INDEX IF NOT EXISTS idx_commissions_agent_id ON public.commissions(agent_id);
CREATE INDEX IF NOT EXISTS idx_commissions_line_id ON public.commissions(line_id);

-- Daily accounts indexes
CREATE INDEX IF NOT EXISTS idx_daily_accounts_created_by ON public.daily_accounts(created_by);
CREATE INDEX IF NOT EXISTS idx_daily_accounts_locked_by ON public.daily_accounts(locked_by);

-- Daily reports indexes
CREATE INDEX IF NOT EXISTS idx_daily_reports_generated_by ON public.daily_reports(generated_by);
CREATE INDEX IF NOT EXISTS idx_daily_reports_line_id ON public.daily_reports(line_id);

-- Expenses indexes
CREATE INDEX IF NOT EXISTS idx_expenses_approved_by ON public.expenses(approved_by);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON public.expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_line_id ON public.expenses(line_id);
CREATE INDEX IF NOT EXISTS idx_expenses_submitted_by ON public.expenses(submitted_by);

-- Lines indexes
CREATE INDEX IF NOT EXISTS idx_lines_agent_id ON public.lines(agent_id);
CREATE INDEX IF NOT EXISTS idx_lines_co_owner_id ON public.lines(co_owner_id);
CREATE INDEX IF NOT EXISTS idx_lines_owner_id ON public.lines(owner_id);

-- Loans indexes
CREATE INDEX IF NOT EXISTS idx_loans_borrower_id ON public.loans(borrower_id);
CREATE INDEX IF NOT EXISTS idx_loans_line_id ON public.loans(line_id);

-- Missed payments indexes
CREATE INDEX IF NOT EXISTS idx_missed_payments_marked_by ON public.missed_payments(marked_by);
CREATE INDEX IF NOT EXISTS idx_missed_payments_payment_id ON public.missed_payments(payment_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- Payment methods indexes
CREATE INDEX IF NOT EXISTS idx_payment_methods_line_id ON public.payment_methods(line_id);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_collected_by ON public.payments(collected_by);
CREATE INDEX IF NOT EXISTS idx_payments_loan_id ON public.payments(loan_id);

-- Penalties indexes
CREATE INDEX IF NOT EXISTS idx_penalties_applied_by ON public.penalties(applied_by);
CREATE INDEX IF NOT EXISTS idx_penalties_payment_id ON public.penalties(payment_id);

-- QR payments indexes
CREATE INDEX IF NOT EXISTS idx_qr_payments_borrower_id ON public.qr_payments(borrower_id);
CREATE INDEX IF NOT EXISTS idx_qr_payments_payment_method_id ON public.qr_payments(payment_method_id);
CREATE INDEX IF NOT EXISTS idx_qr_payments_reconciled_by ON public.qr_payments(reconciled_by);

-- Withdrawals indexes
CREATE INDEX IF NOT EXISTS idx_withdrawals_approved_by ON public.withdrawals(approved_by);
