/*
  # Optimize RLS Policies - Part 8: Withdrawals (Final)

  ## Overview
  Completes optimization of RLS policies for the withdrawals table.
  Replaces `auth.uid()` with `(select auth.uid())` to prevent re-evaluation on each row.

  ## Changes
  Updates RLS policies for:
  - withdrawals: Withdrawal request and approval policies

  ## Performance Impact
  Improves performance for withdrawal management queries.
  This completes the RLS optimization for all tables.
*/

-- ============================================================================
-- WITHDRAWALS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view withdrawals for their lines" ON public.withdrawals;
DROP POLICY IF EXISTS "Users can create withdrawal requests" ON public.withdrawals;
DROP POLICY IF EXISTS "Only owners can approve withdrawals" ON public.withdrawals;

CREATE POLICY "Users can view withdrawals for their lines"
  ON public.withdrawals FOR SELECT
  TO authenticated
  USING (
    line_id IN (
      SELECT id FROM public.lines 
      WHERE owner_id = (select auth.uid()) 
         OR co_owner_id = (select auth.uid()) 
         OR agent_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can create withdrawal requests"
  ON public.withdrawals FOR INSERT
  TO authenticated
  WITH CHECK (
    line_id IN (
      SELECT id FROM public.lines 
      WHERE owner_id = (select auth.uid()) 
         OR co_owner_id = (select auth.uid()) 
         OR agent_id = (select auth.uid())
    )
  );

CREATE POLICY "Only owners can approve withdrawals"
  ON public.withdrawals FOR UPDATE
  TO authenticated
  USING (
    line_id IN (
      SELECT id FROM public.lines 
      WHERE owner_id = (select auth.uid())
    )
  )
  WITH CHECK (
    line_id IN (
      SELECT id FROM public.lines 
      WHERE owner_id = (select auth.uid())
    )
  );
