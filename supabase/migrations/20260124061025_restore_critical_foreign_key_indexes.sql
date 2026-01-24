/*
  # Restore Critical Foreign Key Indexes

  ## Overview
  Restores foreign key indexes that were incorrectly removed in a previous migration.
  Foreign keys MUST be indexed for optimal database performance.

  ## Why Foreign Key Indexes Are Critical
  
  1. **JOIN Performance**: When querying related tables, indexes on foreign keys
     dramatically improve query speed.
  
  2. **Cascading Operations**: When using ON DELETE CASCADE or ON UPDATE CASCADE,
     the database needs to find all related rows. Without an index, this requires
     a full table scan.
  
  3. **Referential Integrity**: The database checks foreign key constraints on
     every INSERT/UPDATE. Without an index, these checks are slow.

  ## Indexes Restored

  ### 1. agent_locations.user_id
  - Foreign key: agent_locations_user_id_fkey
  - Used for: Finding all locations for an agent, JOIN operations

  ### 2. offline_queue.user_id
  - Foreign key: offline_queue_user_id_fkey
  - Used for: Finding queued operations per user, cleanup operations

  ### 3. users.added_by
  - Foreign key: users_added_by_fkey
  - Used for: Team hierarchy queries, finding users added by an owner

  ### 4. withdrawals.withdrawn_by
  - Foreign key: withdrawals_withdrawn_by_fkey
  - Used for: Audit trails, finding withdrawals by user

  ## Performance Impact
  Without these indexes:
  - JOINs on these foreign keys would require full table scans
  - Cascading deletes would be extremely slow
  - Foreign key constraint checks would degrade performance

  ## Note on "Unused" Indexes
  These indexes appear "unused" because:
  1. The database is new with minimal traffic
  2. Query statistics haven't accumulated yet
  3. Some features may not be actively used yet

  In production with real traffic, these indexes are ESSENTIAL.
*/

-- ============================================================================
-- RESTORE FOREIGN KEY INDEXES
-- ============================================================================

-- Agent Locations: user_id foreign key
CREATE INDEX IF NOT EXISTS idx_agent_locations_user_id 
  ON public.agent_locations(user_id);

COMMENT ON INDEX public.idx_agent_locations_user_id IS 
  'Critical for JOIN performance and finding locations by agent. 
   Required for foreign key agent_locations_user_id_fkey.';

-- Offline Queue: user_id foreign key
CREATE INDEX IF NOT EXISTS idx_offline_queue_user_id 
  ON public.offline_queue(user_id);

COMMENT ON INDEX public.idx_offline_queue_user_id IS 
  'Critical for finding queued operations by user and JOIN performance.
   Required for foreign key offline_queue_user_id_fkey.';

-- Users: added_by foreign key (team hierarchy)
CREATE INDEX IF NOT EXISTS idx_users_added_by 
  ON public.users(added_by);

COMMENT ON INDEX public.idx_users_added_by IS 
  'Critical for team hierarchy queries (finding users added by owner).
   Required for foreign key users_added_by_fkey.';

-- Withdrawals: withdrawn_by foreign key (audit trail)
CREATE INDEX IF NOT EXISTS idx_withdrawals_withdrawn_by 
  ON public.withdrawals(withdrawn_by);

COMMENT ON INDEX public.idx_withdrawals_withdrawn_by IS 
  'Critical for audit queries and finding withdrawals by user.
   Required for foreign key withdrawals_withdrawn_by_fkey.';

-- ============================================================================
-- DOCUMENT REMAINING "UNUSED" INDEXES
-- ============================================================================

-- All remaining indexes are INTENTIONALLY KEPT for production performance.
-- They support critical query patterns that will be used once the app has traffic.

COMMENT ON TABLE public.borrowers IS 
  'Indexes on phone, serial_number, and agent_id are CRITICAL for:
   - Phone number lookups (customer service, duplicate detection)
   - Serial number searches (customer reference numbers)
   - Finding borrowers by agent (core business queries)';

COMMENT ON TABLE public.loans IS 
  'Indexes on borrower_id and line_id are CRITICAL for:
   - Finding all loans for a borrower (customer view)
   - Finding all loans in a line (line management)
   - JOIN operations throughout the application';

COMMENT ON TABLE public.payments IS 
  'Indexes on loan_id, borrower, method, type, penalty, collected_by are CRITICAL for:
   - Payment history queries (most common query)
   - Filtering by payment method/type
   - Penalty payment tracking
   - Agent performance reports';

COMMENT ON TABLE public.penalties IS 
  'Indexes on loan, borrower, line, type, applied_by, payment_id are CRITICAL for:
   - Finding penalties for a loan (customer view)
   - Penalty reports by type
   - Tracking who applied penalties (audit)
   - Linking penalties to payments';

COMMENT ON TABLE public.missed_payments IS 
  'Indexes on loan, borrower, date, marked_by, payment_id are CRITICAL for:
   - Finding missed payments for a loan
   - Date-range queries for reports
   - Audit trail (who marked it)
   - Payment reconciliation';

COMMENT ON TABLE public.lines IS 
  'Indexes on owner_id, co_owner_id, agent_id are CRITICAL for:
   - Finding lines by owner (primary navigation)
   - Co-owner access control
   - Agent assignment queries';

COMMENT ON TABLE public.commissions IS 
  'Indexes on agent_id and line_id are CRITICAL for:
   - Agent commission reports (key feature)
   - Commission calculations per line';

COMMENT ON TABLE public.daily_accounts IS 
  'Indexes on date, line, created_by, locked_by are CRITICAL for:
   - Daily report queries (primary use case)
   - Finding accounts by line
   - Audit trail';

COMMENT ON TABLE public.daily_reports IS 
  'Indexes on date, line_id, generated_by are CRITICAL for:
   - Report generation (date ranges)
   - Finding reports by line
   - Audit trail';

COMMENT ON TABLE public.expenses IS 
  'Indexes on date, line_id, category_id, submitted_by, approved_by are CRITICAL for:
   - Expense reports by date range
   - Filtering by category
   - Approval workflow queries';

COMMENT ON TABLE public.withdrawals IS 
  'Indexes on date, line, approved_by are CRITICAL for:
   - Withdrawal history queries
   - Finding withdrawals by line
   - Approval audit trail';

COMMENT ON TABLE public.qr_payments IS 
  'Indexes on loan, borrower_id, payment_method_id, reconciled_by are CRITICAL for:
   - QR payment reconciliation
   - Finding payments for a loan
   - Payment method tracking';

COMMENT ON TABLE public.co_owner_agent_sessions IS 
  'Indexes on co_owner_id and line_id are CRITICAL for:
   - Session management
   - Finding active sessions by co-owner
   - Line access control';

COMMENT ON TABLE public.payment_methods IS 
  'Index on line_id is CRITICAL for:
   - Finding payment methods for a line
   - Payment processing queries';

COMMENT ON TABLE public.notifications IS 
  'Index on user_id is CRITICAL for:
   - Finding notifications for a user (primary query)
   - Notification delivery';

-- ============================================================================
-- SUMMARY
-- ============================================================================

-- All indexes in this database are either:
-- 1. Foreign key indexes (required for performance and integrity)
-- 2. Business-critical query patterns (phone lookups, date ranges, etc.)
-- 3. Supporting core application features

-- Do NOT remove these indexes just because they show as "unused".
-- They will be heavily used in production with real traffic.
