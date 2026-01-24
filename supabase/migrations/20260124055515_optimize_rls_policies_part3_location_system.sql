/*
  # Optimize RLS Policies - Part 3: Location & System Tables

  ## Overview
  Continues optimization of RLS policies for location tracking and system tables.
  Replaces `auth.uid()` with `(select auth.uid())` to prevent re-evaluation on each row.

  ## Changes
  Updates RLS policies for:
  - offline_queue: Offline sync queue policies
  - agent_locations: Location tracking policies
  - expense_categories: Category management policies

  ## Performance Impact
  Improves performance for location tracking and offline queue operations.
*/

-- ============================================================================
-- OFFLINE_QUEUE TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage own queue" ON public.offline_queue;
DROP POLICY IF EXISTS "Owners can view all queues" ON public.offline_queue;

CREATE POLICY "Users can manage own queue"
  ON public.offline_queue FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Owners can view all queues"
  ON public.offline_queue FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = (select auth.uid()) 
        AND role = 'owner'
    )
  );

-- ============================================================================
-- AGENT_LOCATIONS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Agents can insert own location" ON public.agent_locations;
DROP POLICY IF EXISTS "Agents can update own location" ON public.agent_locations;
DROP POLICY IF EXISTS "Agents can view own location" ON public.agent_locations;
DROP POLICY IF EXISTS "Owners can view all agent locations" ON public.agent_locations;

CREATE POLICY "Agents can insert own location"
  ON public.agent_locations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Agents can update own location"
  ON public.agent_locations FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Agents can view own location"
  ON public.agent_locations FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Owners can view all agent locations"
  ON public.agent_locations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = (select auth.uid()) 
        AND role IN ('owner', 'co-owner')
    )
  );

-- ============================================================================
-- EXPENSE_CATEGORIES TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view expense categories" ON public.expense_categories;
DROP POLICY IF EXISTS "Owners can manage expense categories" ON public.expense_categories;

CREATE POLICY "Anyone can view expense categories"
  ON public.expense_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Owners can manage expense categories"
  ON public.expense_categories FOR ALL
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
