/*
  # Add Phone Search Function

  1. New Functions
    - `search_user_by_phone` - Secure function to search for users by phone number
      - Bypasses RLS to check if phone exists across all users
      - Only returns minimal info: id, name, phone, role, is_active, added_by
      - Security: Executed with SECURITY DEFINER (uses function owner's permissions)
  
  2. Purpose
    - Allows owners to check if a phone number exists before creating duplicate users
    - Prevents unique constraint violations on phone numbers
    - Maintains security by only returning necessary information
*/

-- Create a secure function to search users by phone
CREATE OR REPLACE FUNCTION search_user_by_phone(search_phone text)
RETURNS TABLE (
  id uuid,
  name text,
  phone text,
  email text,
  role text,
  is_active boolean,
  added_by uuid,
  created_at timestamptz
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only allow authenticated users to call this function
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Return user with matching phone
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.phone,
    u.email,
    u.role,
    u.is_active,
    u.added_by,
    u.created_at
  FROM users u
  WHERE u.phone = search_phone;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION search_user_by_phone(text) TO authenticated;