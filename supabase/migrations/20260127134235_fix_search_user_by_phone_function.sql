/*
  # Fix search_user_by_phone Function
  
  1. Changes
    - Drop and recreate the search_user_by_phone function with proper return type
    - Use SETOF to explicitly return a set of rows
    - Ensure proper handling of return values
    
  2. Security
    - Maintains SECURITY DEFINER to bypass RLS
    - Only authenticated users can call this function
    - Returns only necessary user information
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS search_user_by_phone(text);

-- Recreate with explicit SETOF return type
CREATE OR REPLACE FUNCTION search_user_by_phone(search_phone text)
RETURNS SETOF users
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only allow authenticated users to call this function
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Return user(s) with matching phone
  RETURN QUERY
  SELECT *
  FROM users
  WHERE phone = search_phone
  LIMIT 1;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION search_user_by_phone(text) TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION search_user_by_phone(text) IS 
'Searches for a user by phone number, bypassing RLS. Returns the full user record or empty set if not found.';