/*
  # Secure Database Functions

  ## Overview
  Fixes function security issues by adding SECURITY DEFINER and immutable search paths.
  This prevents security vulnerabilities from mutable search_path settings.

  ## Changes
  Updates the following functions:
  1. handle_new_user - Already has SECURITY DEFINER, but needs auth schema in search path
  2. update_daily_account_balances - Adds SECURITY DEFINER and fixed search path

  ## Security Impact
  - Prevents search_path injection attacks
  - Ensures functions run with consistent schema resolution
  - Functions execute with definer privileges, not invoker
*/

-- ============================================================================
-- FIX: handle_new_user function
-- ============================================================================

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path TO public, auth
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users (id, email, phone, name, role, created_at, added_by)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'agent'),
    NOW(),
    COALESCE((NEW.raw_user_meta_data->>'added_by')::uuid, NEW.id)
  );
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- FIX: update_daily_account_balances function
-- ============================================================================

DROP FUNCTION IF EXISTS public.update_daily_account_balances() CASCADE;

CREATE OR REPLACE FUNCTION public.update_daily_account_balances()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path TO public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.daily_accounts
  SET 
    closing_balance = opening_balance + total_collections + total_qr_payments - total_expenses,
    net_balance = total_collections + total_qr_payments - total_expenses,
    updated_at = now()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS trigger_update_daily_account_balances ON public.daily_accounts;
CREATE TRIGGER trigger_update_daily_account_balances
  AFTER INSERT OR UPDATE OF opening_balance, total_collections, total_expenses, total_qr_payments
  ON public.daily_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_daily_account_balances();
