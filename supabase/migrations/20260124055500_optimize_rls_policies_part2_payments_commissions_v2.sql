/*
  # Optimize RLS Policies - Part 2: Payments & Commissions

  ## Overview
  Continues optimization of RLS policies for payment-related tables.
  Replaces `auth.uid()` with `(select auth.uid())` to prevent re-evaluation on each row.

  ## Changes
  Updates RLS policies for:
  - payments: Payment collection and management policies
  - commissions: Commission tracking policies
  - notifications: User notification policies

  ## Performance Impact
  Significantly improves query performance for payment and commission queries.
*/

-- ============================================================================
-- PAYMENTS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view payments in their lines" ON public.payments;
DROP POLICY IF EXISTS "Line members can create payments" ON public.payments;
DROP POLICY IF EXISTS "Only payment collector can update" ON public.payments;
DROP POLICY IF EXISTS "Line owners can delete payments" ON public.payments;

CREATE POLICY "Users can view payments in their lines"
  ON public.payments FOR SELECT
  TO authenticated
  USING (
    loan_id IN (
      SELECT l.id FROM public.loans l
      JOIN public.lines ln ON l.line_id = ln.id
      WHERE ln.owner_id = (select auth.uid()) 
         OR ln.co_owner_id = (select auth.uid()) 
         OR ln.agent_id = (select auth.uid())
    )
  );

CREATE POLICY "Line members can create payments"
  ON public.payments FOR INSERT
  TO authenticated
  WITH CHECK (
    loan_id IN (
      SELECT l.id FROM public.loans l
      JOIN public.lines ln ON l.line_id = ln.id
      WHERE ln.owner_id = (select auth.uid()) 
         OR ln.co_owner_id = (select auth.uid()) 
         OR ln.agent_id = (select auth.uid())
    )
  );

CREATE POLICY "Only payment collector can update"
  ON public.payments FOR UPDATE
  TO authenticated
  USING (collected_by = (select auth.uid()))
  WITH CHECK (collected_by = (select auth.uid()));

CREATE POLICY "Line owners can delete payments"
  ON public.payments FOR DELETE
  TO authenticated
  USING (
    loan_id IN (
      SELECT l.id FROM public.loans l
      JOIN public.lines ln ON l.line_id = ln.id
      WHERE ln.owner_id = (select auth.uid())
    )
  );

-- ============================================================================
-- COMMISSIONS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their commissions" ON public.commissions;
DROP POLICY IF EXISTS "Line owners can create commissions" ON public.commissions;
DROP POLICY IF EXISTS "Line owners can update commissions" ON public.commissions;
DROP POLICY IF EXISTS "Line owners can delete commissions" ON public.commissions;

CREATE POLICY "Users can view their commissions"
  ON public.commissions FOR SELECT
  TO authenticated
  USING (
    agent_id = (select auth.uid()) 
    OR line_id IN (
      SELECT id FROM public.lines 
      WHERE owner_id = (select auth.uid()) 
         OR co_owner_id = (select auth.uid())
    )
  );

CREATE POLICY "Line owners can create commissions"
  ON public.commissions FOR INSERT
  TO authenticated
  WITH CHECK (
    line_id IN (
      SELECT id FROM public.lines 
      WHERE owner_id = (select auth.uid()) 
         OR co_owner_id = (select auth.uid())
    )
  );

CREATE POLICY "Line owners can update commissions"
  ON public.commissions FOR UPDATE
  TO authenticated
  USING (
    line_id IN (
      SELECT id FROM public.lines 
      WHERE owner_id = (select auth.uid()) 
         OR co_owner_id = (select auth.uid())
    )
  )
  WITH CHECK (
    line_id IN (
      SELECT id FROM public.lines 
      WHERE owner_id = (select auth.uid()) 
         OR co_owner_id = (select auth.uid())
    )
  );

CREATE POLICY "Line owners can delete commissions"
  ON public.commissions FOR DELETE
  TO authenticated
  USING (
    line_id IN (
      SELECT id FROM public.lines 
      WHERE owner_id = (select auth.uid()) 
         OR co_owner_id = (select auth.uid())
    )
  );

-- ============================================================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));
