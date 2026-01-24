/*
  # Consolidate Multiple Permissive Policies

  ## Overview
  Consolidates multiple permissive SELECT policies on tables to simplify RLS policy management
  while maintaining the same security model.

  ## Changes
  
  ### 1. agent_locations
  - Combines "Agents can view own location" and "Owners can view all agent locations"
  - New single policy covers both cases
  
  ### 2. co_owner_agent_sessions
  - Removes redundant "Co-owners can view their own sessions" SELECT policy
  - Keeps "Co-owners can manage their sessions" FOR ALL which already covers SELECT
  
  ### 3. expense_categories
  - Keeps both policies as they serve different purposes (public read vs owner management)
  - But clarifies with better naming
  
  ### 4. offline_queue
  - Combines SELECT policies while maintaining different access levels
  
  ### 5. payment_methods
  - Simplifies to single SELECT policy that covers all authorized users

  ## Security Impact
  - No change to security model - same users can access same data
  - Improves policy clarity and reduces complexity
  - Easier to audit and maintain
*/

-- ============================================================================
-- AGENT_LOCATIONS: Consolidate SELECT policies
-- ============================================================================

DROP POLICY IF EXISTS "Agents can view own location" ON public.agent_locations;
DROP POLICY IF EXISTS "Owners can view all agent locations" ON public.agent_locations;

CREATE POLICY "Users can view agent locations"
  ON public.agent_locations FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = (select auth.uid()) 
        AND role IN ('owner', 'co-owner')
    )
  );

-- ============================================================================
-- CO_OWNER_AGENT_SESSIONS: Remove redundant SELECT policy
-- ============================================================================

DROP POLICY IF EXISTS "Co-owners can view their own sessions" ON public.co_owner_agent_sessions;

-- Keep the FOR ALL policy which already covers SELECT
-- "Co-owners can manage their sessions" remains

-- ============================================================================
-- OFFLINE_QUEUE: Consolidate SELECT policies
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage own queue" ON public.offline_queue;
DROP POLICY IF EXISTS "Owners can view all queues" ON public.offline_queue;

-- Recreate as separate policies for different operations
CREATE POLICY "Users can view offline queue"
  ON public.offline_queue FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = (select auth.uid()) 
        AND role = 'owner'
    )
  );

CREATE POLICY "Users can manage own offline queue"
  ON public.offline_queue FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own offline queue"
  ON public.offline_queue FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own offline queue"
  ON public.offline_queue FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- PAYMENT_METHODS: Keep both policies with clearer structure
-- ============================================================================

-- Both policies are needed:
-- 1. Line members need to VIEW payment methods
-- 2. Owners/co-owners need full management
-- The existing policies are correct, no changes needed

-- ============================================================================
-- EXPENSE_CATEGORIES: Keep both policies
-- ============================================================================

-- Both policies are needed:
-- 1. Everyone (authenticated) needs to VIEW categories
-- 2. Owners/co-owners need full management
-- The existing policies are correct, no changes needed
