/*
  # Optimize RLS Policies - Part 6: Sessions & Reports

  ## Overview
  Continues optimization of RLS policies for session tracking and reporting tables.
  Replaces `auth.uid()` with `(select auth.uid())` to prevent re-evaluation on each row.

  ## Changes
  Updates RLS policies for:
  - co_owner_agent_sessions: Co-owner session management policies
  - daily_reports: Daily report generation policies

  ## Performance Impact
  Improves performance for session tracking and report generation queries.
*/

-- ============================================================================
-- CO_OWNER_AGENT_SESSIONS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Co-owners can view their own sessions" ON public.co_owner_agent_sessions;
DROP POLICY IF EXISTS "Co-owners can manage their sessions" ON public.co_owner_agent_sessions;

CREATE POLICY "Co-owners can view their own sessions"
  ON public.co_owner_agent_sessions FOR SELECT
  TO authenticated
  USING (co_owner_id = (select auth.uid()));

CREATE POLICY "Co-owners can manage their sessions"
  ON public.co_owner_agent_sessions FOR ALL
  TO authenticated
  USING (co_owner_id = (select auth.uid()))
  WITH CHECK (co_owner_id = (select auth.uid()));

-- ============================================================================
-- DAILY_REPORTS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view daily reports for their lines" ON public.daily_reports;
DROP POLICY IF EXISTS "Owners and co-owners can create daily reports" ON public.daily_reports;

CREATE POLICY "Users can view daily reports for their lines"
  ON public.daily_reports FOR SELECT
  TO authenticated
  USING (
    line_id IN (
      SELECT id FROM public.lines 
      WHERE owner_id = (select auth.uid()) 
         OR co_owner_id = (select auth.uid()) 
         OR agent_id = (select auth.uid())
    )
  );

CREATE POLICY "Owners and co-owners can create daily reports"
  ON public.daily_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    line_id IN (
      SELECT id FROM public.lines 
      WHERE owner_id = (select auth.uid()) 
         OR co_owner_id = (select auth.uid())
    )
  );
