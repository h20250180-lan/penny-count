/*
  # Optimize RLS Policies - Part 4: Daily Accounts & Expenses

  ## Overview
  Continues optimization of RLS policies for financial tracking tables.
  Replaces `auth.uid()` with `(select auth.uid())` to prevent re-evaluation on each row.

  ## Changes
  Updates RLS policies for:
  - daily_accounts: Daily account management policies
  - expenses: Expense submission and approval policies

  ## Performance Impact
  Improves performance for financial tracking and expense management queries.
*/

-- ============================================================================
-- DAILY_ACCOUNTS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view daily accounts for their lines" ON public.daily_accounts;
DROP POLICY IF EXISTS "Owners and co-owners can create daily accounts" ON public.daily_accounts;
DROP POLICY IF EXISTS "Owners and co-owners can update unlocked daily accounts" ON public.daily_accounts;

CREATE POLICY "Users can view daily accounts for their lines"
  ON public.daily_accounts FOR SELECT
  TO authenticated
  USING (
    line_id IN (
      SELECT id FROM public.lines 
      WHERE owner_id = (select auth.uid()) 
         OR co_owner_id = (select auth.uid()) 
         OR agent_id = (select auth.uid())
    )
  );

CREATE POLICY "Owners and co-owners can create daily accounts"
  ON public.daily_accounts FOR INSERT
  TO authenticated
  WITH CHECK (
    line_id IN (
      SELECT id FROM public.lines 
      WHERE owner_id = (select auth.uid()) 
         OR co_owner_id = (select auth.uid())
    )
  );

CREATE POLICY "Owners and co-owners can update unlocked daily accounts"
  ON public.daily_accounts FOR UPDATE
  TO authenticated
  USING (
    is_locked = false 
    AND line_id IN (
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

-- ============================================================================
-- EXPENSES TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view expenses from their team" ON public.expenses;
DROP POLICY IF EXISTS "Users can create expenses" ON public.expenses;
DROP POLICY IF EXISTS "Owners and co-owners can update expenses" ON public.expenses;

CREATE POLICY "Users can view expenses from their team"
  ON public.expenses FOR SELECT
  TO authenticated
  USING (
    submitted_by = (select auth.uid())
    OR submitted_by IN (
      SELECT id FROM public.users 
      WHERE added_by = (select auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = (select auth.uid()) 
        AND role IN ('owner', 'co-owner')
    )
  );

CREATE POLICY "Users can create expenses"
  ON public.expenses FOR INSERT
  TO authenticated
  WITH CHECK (submitted_by = (select auth.uid()));

CREATE POLICY "Owners and co-owners can update expenses"
  ON public.expenses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = (select auth.uid()) 
        AND role IN ('owner', 'co-owner')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = (select auth.uid()) 
        AND role IN ('owner', 'co-owner')
    )
  );
