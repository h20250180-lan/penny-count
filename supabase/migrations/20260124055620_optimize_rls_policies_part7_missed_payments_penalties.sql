/*
  # Optimize RLS Policies - Part 7: Missed Payments & Penalties

  ## Overview
  Continues optimization of RLS policies for payment tracking tables.
  Replaces `auth.uid()` with `(select auth.uid())` to prevent re-evaluation on each row.

  ## Changes
  Updates RLS policies for:
  - missed_payments: Missed payment tracking policies
  - penalties: Penalty management policies

  ## Performance Impact
  Improves performance for payment tracking and penalty management queries.
*/

-- ============================================================================
-- MISSED_PAYMENTS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view missed payments for their lines" ON public.missed_payments;
DROP POLICY IF EXISTS "Agents can create missed payments for their lines" ON public.missed_payments;
DROP POLICY IF EXISTS "Agents can update missed payments for their lines" ON public.missed_payments;

CREATE POLICY "Users can view missed payments for their lines"
  ON public.missed_payments FOR SELECT
  TO authenticated
  USING (
    payment_id IN (
      SELECT p.id FROM public.payments p
      JOIN public.loans l ON p.loan_id = l.id
      JOIN public.lines ln ON l.line_id = ln.id
      WHERE ln.owner_id = (select auth.uid()) 
         OR ln.co_owner_id = (select auth.uid()) 
         OR ln.agent_id = (select auth.uid())
    )
  );

CREATE POLICY "Agents can create missed payments for their lines"
  ON public.missed_payments FOR INSERT
  TO authenticated
  WITH CHECK (
    payment_id IN (
      SELECT p.id FROM public.payments p
      JOIN public.loans l ON p.loan_id = l.id
      JOIN public.lines ln ON l.line_id = ln.id
      WHERE ln.owner_id = (select auth.uid()) 
         OR ln.co_owner_id = (select auth.uid()) 
         OR ln.agent_id = (select auth.uid())
    )
  );

CREATE POLICY "Agents can update missed payments for their lines"
  ON public.missed_payments FOR UPDATE
  TO authenticated
  USING (
    payment_id IN (
      SELECT p.id FROM public.payments p
      JOIN public.loans l ON p.loan_id = l.id
      JOIN public.lines ln ON l.line_id = ln.id
      WHERE ln.owner_id = (select auth.uid()) 
         OR ln.co_owner_id = (select auth.uid()) 
         OR ln.agent_id = (select auth.uid())
    )
  )
  WITH CHECK (
    payment_id IN (
      SELECT p.id FROM public.payments p
      JOIN public.loans l ON p.loan_id = l.id
      JOIN public.lines ln ON l.line_id = ln.id
      WHERE ln.owner_id = (select auth.uid()) 
         OR ln.co_owner_id = (select auth.uid()) 
         OR ln.agent_id = (select auth.uid())
    )
  );

-- ============================================================================
-- PENALTIES TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view penalties for their lines" ON public.penalties;
DROP POLICY IF EXISTS "Agents can create penalties for their lines" ON public.penalties;
DROP POLICY IF EXISTS "Agents can update penalties for their lines" ON public.penalties;

CREATE POLICY "Users can view penalties for their lines"
  ON public.penalties FOR SELECT
  TO authenticated
  USING (
    payment_id IN (
      SELECT p.id FROM public.payments p
      JOIN public.loans l ON p.loan_id = l.id
      JOIN public.lines ln ON l.line_id = ln.id
      WHERE ln.owner_id = (select auth.uid()) 
         OR ln.co_owner_id = (select auth.uid()) 
         OR ln.agent_id = (select auth.uid())
    )
  );

CREATE POLICY "Agents can create penalties for their lines"
  ON public.penalties FOR INSERT
  TO authenticated
  WITH CHECK (
    payment_id IN (
      SELECT p.id FROM public.payments p
      JOIN public.loans l ON p.loan_id = l.id
      JOIN public.lines ln ON l.line_id = ln.id
      WHERE ln.owner_id = (select auth.uid()) 
         OR ln.co_owner_id = (select auth.uid()) 
         OR ln.agent_id = (select auth.uid())
    )
  );

CREATE POLICY "Agents can update penalties for their lines"
  ON public.penalties FOR UPDATE
  TO authenticated
  USING (
    payment_id IN (
      SELECT p.id FROM public.payments p
      JOIN public.loans l ON p.loan_id = l.id
      JOIN public.lines ln ON l.line_id = ln.id
      WHERE ln.owner_id = (select auth.uid()) 
         OR ln.co_owner_id = (select auth.uid()) 
         OR ln.agent_id = (select auth.uid())
    )
  )
  WITH CHECK (
    payment_id IN (
      SELECT p.id FROM public.payments p
      JOIN public.loans l ON p.loan_id = l.id
      JOIN public.lines ln ON l.line_id = ln.id
      WHERE ln.owner_id = (select auth.uid()) 
         OR ln.co_owner_id = (select auth.uid()) 
         OR ln.agent_id = (select auth.uid())
    )
  );
