/*
  # Optimize RLS Policies - Part 5: Payment Methods & QR Payments

  ## Overview
  Continues optimization of RLS policies for payment processing tables.
  Replaces `auth.uid()` with `(select auth.uid())` to prevent re-evaluation on each row.

  ## Changes
  Updates RLS policies for:
  - payment_methods: Payment method management policies
  - qr_payments: QR payment tracking policies (also fixes overly permissive policy)

  ## Security Fixes
  - Restricts qr_payments INSERT policy to authenticated users with proper line access
  - Removes the "Anyone can create qr payments" policy that allowed unrestricted access

  ## Performance Impact
  Improves performance for payment processing queries.
*/

-- ============================================================================
-- PAYMENT_METHODS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view payment methods for their lines" ON public.payment_methods;
DROP POLICY IF EXISTS "Owners and co-owners can manage payment methods" ON public.payment_methods;

CREATE POLICY "Users can view payment methods for their lines"
  ON public.payment_methods FOR SELECT
  TO authenticated
  USING (
    line_id IN (
      SELECT id FROM public.lines 
      WHERE owner_id = (select auth.uid()) 
         OR co_owner_id = (select auth.uid()) 
         OR agent_id = (select auth.uid())
    )
  );

CREATE POLICY "Owners and co-owners can manage payment methods"
  ON public.payment_methods FOR ALL
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

-- ============================================================================
-- QR_PAYMENTS TABLE POLICIES (WITH SECURITY FIX)
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can create qr payments" ON public.qr_payments;
DROP POLICY IF EXISTS "Users can view qr payments for their lines" ON public.qr_payments;
DROP POLICY IF EXISTS "Owners and co-owners can update qr payments" ON public.qr_payments;

-- FIX: Restrict QR payment creation to authenticated users with proper line access
CREATE POLICY "Authenticated users can create qr payments for their lines"
  ON public.qr_payments FOR INSERT
  TO authenticated
  WITH CHECK (
    borrower_id IN (
      SELECT b.id FROM public.borrowers b
      JOIN public.lines ln ON b.line_id = ln.id
      WHERE ln.owner_id = (select auth.uid()) 
         OR ln.co_owner_id = (select auth.uid()) 
         OR ln.agent_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can view qr payments for their lines"
  ON public.qr_payments FOR SELECT
  TO authenticated
  USING (
    borrower_id IN (
      SELECT b.id FROM public.borrowers b
      JOIN public.lines ln ON b.line_id = ln.id
      WHERE ln.owner_id = (select auth.uid()) 
         OR ln.co_owner_id = (select auth.uid()) 
         OR ln.agent_id = (select auth.uid())
    )
  );

CREATE POLICY "Owners and co-owners can update qr payments"
  ON public.qr_payments FOR UPDATE
  TO authenticated
  USING (
    borrower_id IN (
      SELECT b.id FROM public.borrowers b
      JOIN public.lines ln ON b.line_id = ln.id
      WHERE ln.owner_id = (select auth.uid()) 
         OR ln.co_owner_id = (select auth.uid())
    )
  )
  WITH CHECK (
    borrower_id IN (
      SELECT b.id FROM public.borrowers b
      JOIN public.lines ln ON b.line_id = ln.id
      WHERE ln.owner_id = (select auth.uid()) 
         OR ln.co_owner_id = (select auth.uid())
    )
  );
