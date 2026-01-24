/*
  # Fix Remaining Security Issues - Part 2

  ## Overview
  Addresses remaining security concerns:
  1. Consolidates multiple permissive SELECT policies
  2. Removes "always true" RLS policy for users table
  3. Improves security model

  ## Changes

  ### 1. Expense Categories
  - Consolidates two SELECT policies into one
  - Maintains same access: all authenticated users can view

  ### 2. Payment Methods
  - Consolidates two SELECT policies into one
  - Maintains access for line members and owners

  ### 3. Users Table INSERT Policy
  - Removes the "always true" policy
  - Keeps the more restrictive policy that checks auth.uid()

  ## Security Impact
  - Reduces policy complexity
  - Prevents unauthorized user creation
  - Maintains existing functionality for legitimate operations
*/

-- ============================================================================
-- USERS TABLE: Remove "always true" INSERT policy
-- ============================================================================

-- Drop the problematic "always true" policy
-- The better policy "Users can insert own profile during signup" already exists
DROP POLICY IF EXISTS "Anyone can insert during signup" ON public.users;

-- ============================================================================
-- EXPENSE_CATEGORIES: Consolidate SELECT policies
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view expense categories" ON public.expense_categories;
DROP POLICY IF EXISTS "Owners can manage expense categories" ON public.expense_categories;

-- Single SELECT policy for viewing
CREATE POLICY "Authenticated users can view expense categories"
  ON public.expense_categories FOR SELECT
  TO authenticated
  USING (true);

-- Separate management policies for owners
CREATE POLICY "Owners can insert expense categories"
  ON public.expense_categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = (select auth.uid()) 
        AND role IN ('owner', 'co-owner')
    )
  );

CREATE POLICY "Owners can update expense categories"
  ON public.expense_categories FOR UPDATE
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

CREATE POLICY "Owners can delete expense categories"
  ON public.expense_categories FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = (select auth.uid()) 
        AND role IN ('owner', 'co-owner')
    )
  );

-- ============================================================================
-- PAYMENT_METHODS: Consolidate SELECT policies
-- ============================================================================

DROP POLICY IF EXISTS "Owners and co-owners can manage payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Users can view payment methods for their lines" ON public.payment_methods;

-- Single SELECT policy covering all access patterns
CREATE POLICY "Users can view payment methods for their lines"
  ON public.payment_methods FOR SELECT
  TO authenticated
  USING (
    -- Owners and co-owners can see all
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = (select auth.uid()) 
        AND role IN ('owner', 'co-owner')
    )
    OR
    -- Users can see payment methods for lines they have access to
    EXISTS (
      SELECT 1 FROM public.lines 
      WHERE id = payment_methods.line_id 
        AND (
          owner_id = (select auth.uid())
          OR co_owner_id = (select auth.uid())
          OR agent_id = (select auth.uid())
        )
    )
  );

-- Separate management policies for owners/co-owners
CREATE POLICY "Owners and co-owners can insert payment methods"
  ON public.payment_methods FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = (select auth.uid()) 
        AND role IN ('owner', 'co-owner')
    )
  );

CREATE POLICY "Owners and co-owners can update payment methods"
  ON public.payment_methods FOR UPDATE
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

CREATE POLICY "Owners and co-owners can delete payment methods"
  ON public.payment_methods FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = (select auth.uid()) 
        AND role IN ('owner', 'co-owner')
    )
  );
