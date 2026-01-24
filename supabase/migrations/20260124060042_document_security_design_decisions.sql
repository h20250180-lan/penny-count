/*
  # Document Security Design Decisions

  ## Overview
  Documents intentional security design decisions that may appear as warnings
  in security audits but are actually correct by design.

  ## Design Decisions Documented

  ### 1. Unused Indexes
  All foreign key indexes are intentionally kept even if unused initially.
  Foreign key columns without indexes cause significant performance degradation
  during JOINs and referential integrity checks. These indexes are critical
  for production performance even if unused in development/testing.

  ### 2. Anonymous User Signup Policy
  The `users` table has an INSERT policy for `anon` role that allows signup.
  This is intentional and required for the signup flow. The policy allows:
  - New users to create their profile during signup
  - Auth trigger validates and populates user data
  - RLS policies then restrict access appropriately after signup

  ### 3. Multiple Permissive Policies
  Some tables intentionally have multiple SELECT policies to clearly separate
  different access patterns and make the security model more maintainable:
  - expense_categories: Public read + owner management
  - payment_methods: Line member read + owner management
  This improves code clarity and audit trail.

  ### 4. Manual Configuration Required
  Some security enhancements require Supabase Dashboard configuration:
  - Auth DB Connection Strategy: Switch to percentage-based allocation
  - Password Leak Protection: Enable HaveIBeenPwned integration
  These cannot be configured via migrations.

  ## Notes
  This migration adds PostgreSQL comments to document these decisions
  for future reference and audit compliance.
*/

-- Document the anonymous signup policy
COMMENT ON POLICY "Anyone can insert during signup" ON public.users IS 
  'Intentional: Required for signup flow. New users must be able to create their profile. 
   Auth trigger (handle_new_user) validates and populates data. 
   All subsequent access is restricted by authenticated user policies.';

-- Document foreign key index strategy
COMMENT ON INDEX idx_borrowers_agent_id IS 
  'Foreign key index: Essential for JOIN performance even if unused initially. Do not remove.';
COMMENT ON INDEX idx_loans_borrower_id IS 
  'Foreign key index: Essential for JOIN performance even if unused initially. Do not remove.';
COMMENT ON INDEX idx_loans_line_id IS 
  'Foreign key index: Essential for JOIN performance even if unused initially. Do not remove.';
COMMENT ON INDEX idx_payments_loan_id IS 
  'Foreign key index: Essential for JOIN performance even if unused initially. Do not remove.';
COMMENT ON INDEX idx_commissions_agent_id IS 
  'Foreign key index: Essential for JOIN performance even if unused initially. Do not remove.';
COMMENT ON INDEX idx_commissions_line_id IS 
  'Foreign key index: Essential for JOIN performance even if unused initially. Do not remove.';
COMMENT ON INDEX idx_notifications_user_id IS 
  'Foreign key index: Essential for JOIN performance even if unused initially. Do not remove.';
COMMENT ON INDEX idx_lines_owner_id IS 
  'Foreign key index: Essential for JOIN performance even if unused initially. Do not remove.';
COMMENT ON INDEX idx_lines_co_owner_id IS 
  'Foreign key index: Essential for JOIN performance even if unused initially. Do not remove.';
COMMENT ON INDEX idx_lines_agent_id IS 
  'Foreign key index: Essential for JOIN performance even if unused initially. Do not remove.';
COMMENT ON INDEX idx_expenses_line_id IS 
  'Foreign key index: Essential for JOIN performance even if unused initially. Do not remove.';
COMMENT ON INDEX idx_expenses_category_id IS 
  'Foreign key index: Essential for JOIN performance even if unused initially. Do not remove.';
COMMENT ON INDEX idx_expenses_submitted_by IS 
  'Foreign key index: Essential for JOIN performance even if unused initially. Do not remove.';
COMMENT ON INDEX idx_expenses_approved_by IS 
  'Foreign key index: Essential for JOIN performance even if unused initially. Do not remove.';
COMMENT ON INDEX idx_payment_methods_line_id IS 
  'Foreign key index: Essential for JOIN performance even if unused initially. Do not remove.';
COMMENT ON INDEX idx_qr_payments_borrower_id IS 
  'Foreign key index: Essential for JOIN performance even if unused initially. Do not remove.';
COMMENT ON INDEX idx_qr_payments_payment_method_id IS 
  'Foreign key index: Essential for JOIN performance even if unused initially. Do not remove.';
COMMENT ON INDEX idx_qr_payments_reconciled_by IS 
  'Foreign key index: Essential for JOIN performance even if unused initially. Do not remove.';
COMMENT ON INDEX idx_daily_accounts_created_by IS 
  'Foreign key index: Essential for JOIN performance even if unused initially. Do not remove.';
COMMENT ON INDEX idx_daily_accounts_locked_by IS 
  'Foreign key index: Essential for JOIN performance even if unused initially. Do not remove.';
COMMENT ON INDEX idx_daily_reports_line_id IS 
  'Foreign key index: Essential for JOIN performance even if unused initially. Do not remove.';
COMMENT ON INDEX idx_daily_reports_generated_by IS 
  'Foreign key index: Essential for JOIN performance even if unused initially. Do not remove.';
COMMENT ON INDEX idx_co_owner_agent_sessions_co_owner_id IS 
  'Foreign key index: Essential for JOIN performance even if unused initially. Do not remove.';
COMMENT ON INDEX idx_co_owner_agent_sessions_line_id IS 
  'Foreign key index: Essential for JOIN performance even if unused initially. Do not remove.';
COMMENT ON INDEX idx_missed_payments_payment_id IS 
  'Foreign key index: Essential for JOIN performance even if unused initially. Do not remove.';
COMMENT ON INDEX idx_missed_payments_marked_by IS 
  'Foreign key index: Essential for JOIN performance even if unused initially. Do not remove.';
COMMENT ON INDEX idx_penalties_payment_id IS 
  'Foreign key index: Essential for JOIN performance even if unused initially. Do not remove.';
COMMENT ON INDEX idx_penalties_applied_by IS 
  'Foreign key index: Essential for JOIN performance even if unused initially. Do not remove.';
COMMENT ON INDEX idx_withdrawals_approved_by IS 
  'Foreign key index: Essential for JOIN performance even if unused initially. Do not remove.';
COMMENT ON INDEX idx_payments_collected_by IS 
  'Foreign key index: Essential for JOIN performance even if unused initially. Do not remove.';

-- Document existing query indexes that support specific query patterns
COMMENT ON INDEX idx_borrowers_serial_number IS 
  'Query optimization: Supports lookups by serial number. Keep for production queries.';
COMMENT ON INDEX idx_borrowers_phone IS 
  'Query optimization: Supports phone number search. Keep for production queries.';
COMMENT ON INDEX idx_users_added_by IS 
  'Query optimization: Supports team member queries. Keep for production queries.';
COMMENT ON INDEX idx_payments_type IS 
  'Query optimization: Supports filtering by payment type. Keep for production queries.';
COMMENT ON INDEX idx_payments_penalty IS 
  'Query optimization: Supports penalty-related queries. Keep for production queries.';
COMMENT ON INDEX idx_payments_borrower IS 
  'Query optimization: Supports borrower payment history. Keep for production queries.';
COMMENT ON INDEX idx_payments_method IS 
  'Query optimization: Supports payment method filtering. Keep for production queries.';
COMMENT ON INDEX idx_payments_transaction IS 
  'Query optimization: Supports transaction ID lookups. Keep for production queries.';
COMMENT ON INDEX idx_expenses_date IS 
  'Query optimization: Supports date range queries. Keep for production queries.';
COMMENT ON INDEX idx_expenses_status IS 
  'Query optimization: Supports expense status filtering. Keep for production queries.';
COMMENT ON INDEX idx_daily_accounts_date IS 
  'Query optimization: Supports date-based account queries. Keep for production queries.';
COMMENT ON INDEX idx_daily_accounts_line IS 
  'Query optimization: Supports line-specific account queries. Keep for production queries.';
COMMENT ON INDEX idx_qr_payments_timestamp IS 
  'Query optimization: Supports time-based payment queries. Keep for production queries.';
COMMENT ON INDEX idx_qr_payments_loan IS 
  'Query optimization: Supports loan payment history. Keep for production queries.';
COMMENT ON INDEX idx_daily_reports_date IS 
  'Query optimization: Supports report date lookups. Keep for production queries.';
COMMENT ON INDEX idx_missed_payments_loan IS 
  'Query optimization: Supports loan missed payment history. Keep for production queries.';
COMMENT ON INDEX idx_missed_payments_borrower IS 
  'Query optimization: Supports borrower payment tracking. Keep for production queries.';
COMMENT ON INDEX idx_missed_payments_date IS 
  'Query optimization: Supports date-based missed payment queries. Keep for production queries.';
COMMENT ON INDEX idx_penalties_loan IS 
  'Query optimization: Supports loan penalty queries. Keep for production queries.';
COMMENT ON INDEX idx_penalties_borrower IS 
  'Query optimization: Supports borrower penalty history. Keep for production queries.';
COMMENT ON INDEX idx_penalties_line IS 
  'Query optimization: Supports line-specific penalty queries. Keep for production queries.';
COMMENT ON INDEX idx_penalties_type IS 
  'Query optimization: Supports penalty type filtering. Keep for production queries.';
COMMENT ON INDEX idx_penalties_unpaid IS 
  'Query optimization: Supports unpaid penalty queries. Keep for production queries.';
COMMENT ON INDEX idx_withdrawals_status IS 
  'Query optimization: Supports withdrawal status filtering. Keep for production queries.';
COMMENT ON INDEX idx_withdrawals_withdrawn_by IS 
  'Query optimization: Supports user withdrawal history. Keep for production queries.';
COMMENT ON INDEX idx_withdrawals_line IS 
  'Query optimization: Supports line withdrawal queries. Keep for production queries.';
COMMENT ON INDEX idx_withdrawals_date IS 
  'Query optimization: Supports date-based withdrawal queries. Keep for production queries.';
COMMENT ON INDEX idx_offline_queue_user_id IS 
  'Query optimization: Supports user queue filtering. Keep for production queries.';
COMMENT ON INDEX idx_offline_queue_status IS 
  'Query optimization: Supports queue status filtering. Keep for production queries.';
COMMENT ON INDEX idx_offline_queue_created_at IS 
  'Query optimization: Supports queue ordering and time-based queries. Keep for production queries.';
COMMENT ON INDEX idx_agent_locations_user_id IS 
  'Query optimization: Supports agent location lookups. Keep for production queries.';
