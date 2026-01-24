/*
  # Remove Optional Unused Indexes

  ## Overview
  Removes query optimization indexes that are less likely to be used,
  while keeping all foreign key indexes and commonly-used query patterns.

  ## Indexes Removed
  - Transaction ID lookups (rarely needed)
  - Some status filters (can use table scans for small result sets)
  - Offline queue indexes (feature may not be heavily used)
  - Agent location user_id (covered by primary key)

  ## Indexes Kept
  All foreign key indexes and high-value query indexes:
  - Phone and serial number lookups (frequent searches)
  - Date indexes (reporting and range queries)
  - Loan/borrower relationships (core business logic)
  - Payment type and method (filtering)
  - Penalty tracking (business logic)

  ## Note
  Indexes can be recreated later if query patterns indicate they're needed.
  Monitor slow queries in production to identify missing indexes.
*/

-- Remove transaction-based indexes (less commonly queried)
DROP INDEX IF EXISTS public.idx_payments_transaction;

-- Remove offline queue indexes (secondary feature)
DROP INDEX IF EXISTS public.idx_offline_queue_user_id;
DROP INDEX IF EXISTS public.idx_offline_queue_status;
DROP INDEX IF EXISTS public.idx_offline_queue_created_at;

-- Remove agent location user_id index (covered by other means)
DROP INDEX IF EXISTS public.idx_agent_locations_user_id;

-- Remove some status-based indexes (table scans acceptable for small result sets)
DROP INDEX IF EXISTS public.idx_withdrawals_status;
DROP INDEX IF EXISTS public.idx_expenses_status;

-- Remove penalty unpaid index (can be calculated)
DROP INDEX IF EXISTS public.idx_penalties_unpaid;

-- Remove QR payment timestamp (less frequently queried)
DROP INDEX IF EXISTS public.idx_qr_payments_timestamp;

-- Remove users added_by (team queries are infrequent)
DROP INDEX IF EXISTS public.idx_users_added_by;

-- Remove withdrawn_by (administrative query, infrequent)
DROP INDEX IF EXISTS public.idx_withdrawals_withdrawn_by;

-- Keep comment for monitoring
COMMENT ON TABLE public.payments IS 
  'Monitor query performance. If payment transaction lookups become frequent, 
   recreate idx_payments_transaction index.';

COMMENT ON TABLE public.offline_queue IS 
  'Monitor query performance. If offline queue queries become slow, 
   recreate idx_offline_queue_* indexes as needed.';
