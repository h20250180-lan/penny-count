/*
  # Optimize RLS Policies - Part 1: Core Tables

  ## Overview
  Optimizes RLS policies to use the initialization plan pattern for better performance.
  Replaces `auth.uid()` with `(select auth.uid())` to prevent re-evaluation on each row.

  ## Changes
  Updates RLS policies for core tables:
  - users: Profile and team member access policies
  - lines: Line ownership and access policies
  - borrowers: Borrower management policies
  - loans: Loan management policies

  ## Performance Impact
  Significantly improves query performance at scale by caching auth.uid() evaluation
  instead of re-computing it for every row in the result set.
*/

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own profile and team members" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile during signup" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile or team members" ON public.users;

CREATE POLICY "Users can view own profile and team members"
  ON public.users FOR SELECT
  TO authenticated
  USING (
    id = (select auth.uid()) 
    OR added_by = (select auth.uid())
  );

CREATE POLICY "Users can insert own profile during signup"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

CREATE POLICY "Users can update own profile or team members"
  ON public.users FOR UPDATE
  TO authenticated
  USING (
    id = (select auth.uid())
    OR added_by = (select auth.uid())
  )
  WITH CHECK (
    id = (select auth.uid())
    OR added_by = (select auth.uid())
  );

-- ============================================================================
-- LINES TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view lines they own, co-own, or are assigned to" ON public.lines;
DROP POLICY IF EXISTS "Owners can insert their lines" ON public.lines;
DROP POLICY IF EXISTS "Owners and co-owners can update their lines" ON public.lines;
DROP POLICY IF EXISTS "Only owners can delete their lines" ON public.lines;

CREATE POLICY "Users can view lines they own, co-own, or are assigned to"
  ON public.lines FOR SELECT
  TO authenticated
  USING (
    owner_id = (select auth.uid()) 
    OR co_owner_id = (select auth.uid()) 
    OR agent_id = (select auth.uid())
  );

CREATE POLICY "Owners can insert their lines"
  ON public.lines FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = (select auth.uid()));

CREATE POLICY "Owners and co-owners can update their lines"
  ON public.lines FOR UPDATE
  TO authenticated
  USING (owner_id = (select auth.uid()) OR co_owner_id = (select auth.uid()))
  WITH CHECK (owner_id = (select auth.uid()) OR co_owner_id = (select auth.uid()));

CREATE POLICY "Only owners can delete their lines"
  ON public.lines FOR DELETE
  TO authenticated
  USING (owner_id = (select auth.uid()));

-- ============================================================================
-- BORROWERS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view borrowers in their lines" ON public.borrowers;
DROP POLICY IF EXISTS "Agents can insert borrowers in their lines" ON public.borrowers;
DROP POLICY IF EXISTS "Agents can update their borrowers" ON public.borrowers;
DROP POLICY IF EXISTS "Line owners can delete borrowers" ON public.borrowers;

CREATE POLICY "Users can view borrowers in their lines"
  ON public.borrowers FOR SELECT
  TO authenticated
  USING (
    line_id IN (
      SELECT id FROM public.lines 
      WHERE owner_id = (select auth.uid()) 
         OR co_owner_id = (select auth.uid()) 
         OR agent_id = (select auth.uid())
    )
  );

CREATE POLICY "Agents can insert borrowers in their lines"
  ON public.borrowers FOR INSERT
  TO authenticated
  WITH CHECK (
    line_id IN (
      SELECT id FROM public.lines 
      WHERE agent_id = (select auth.uid()) 
         OR owner_id = (select auth.uid()) 
         OR co_owner_id = (select auth.uid())
    )
  );

CREATE POLICY "Agents can update their borrowers"
  ON public.borrowers FOR UPDATE
  TO authenticated
  USING (
    line_id IN (
      SELECT id FROM public.lines 
      WHERE agent_id = (select auth.uid()) 
         OR owner_id = (select auth.uid()) 
         OR co_owner_id = (select auth.uid())
    )
  )
  WITH CHECK (
    line_id IN (
      SELECT id FROM public.lines 
      WHERE agent_id = (select auth.uid()) 
         OR owner_id = (select auth.uid()) 
         OR co_owner_id = (select auth.uid())
    )
  );

CREATE POLICY "Line owners can delete borrowers"
  ON public.borrowers FOR DELETE
  TO authenticated
  USING (
    line_id IN (
      SELECT id FROM public.lines 
      WHERE owner_id = (select auth.uid())
    )
  );

-- ============================================================================
-- LOANS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view loans in their lines" ON public.loans;
DROP POLICY IF EXISTS "Line members can create loans" ON public.loans;
DROP POLICY IF EXISTS "Line members can update loans" ON public.loans;
DROP POLICY IF EXISTS "Line owners can delete loans" ON public.loans;

CREATE POLICY "Users can view loans in their lines"
  ON public.loans FOR SELECT
  TO authenticated
  USING (
    line_id IN (
      SELECT id FROM public.lines 
      WHERE owner_id = (select auth.uid()) 
         OR co_owner_id = (select auth.uid()) 
         OR agent_id = (select auth.uid())
    )
  );

CREATE POLICY "Line members can create loans"
  ON public.loans FOR INSERT
  TO authenticated
  WITH CHECK (
    line_id IN (
      SELECT id FROM public.lines 
      WHERE owner_id = (select auth.uid()) 
         OR co_owner_id = (select auth.uid()) 
         OR agent_id = (select auth.uid())
    )
  );

CREATE POLICY "Line members can update loans"
  ON public.loans FOR UPDATE
  TO authenticated
  USING (
    line_id IN (
      SELECT id FROM public.lines 
      WHERE owner_id = (select auth.uid()) 
         OR co_owner_id = (select auth.uid()) 
         OR agent_id = (select auth.uid())
    )
  )
  WITH CHECK (
    line_id IN (
      SELECT id FROM public.lines 
      WHERE owner_id = (select auth.uid()) 
         OR co_owner_id = (select auth.uid()) 
         OR agent_id = (select auth.uid())
    )
  );

CREATE POLICY "Line owners can delete loans"
  ON public.loans FOR DELETE
  TO authenticated
  USING (
    line_id IN (
      SELECT id FROM public.lines 
      WHERE owner_id = (select auth.uid())
    )
  );
