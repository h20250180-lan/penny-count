/*
  # Add Claim User Function

  1. Purpose
    - Create a secure function to claim a user into an owner's team
    - Bypasses RLS to ensure the update works correctly
    - Validates that only self-registered or unclaimed users can be claimed

  2. Security
    - Only authenticated users can call this
    - Cannot steal users from other owners
    - Only owners can claim users
    - Users can only be claimed if they are self-registered or unclaimed
*/

CREATE OR REPLACE FUNCTION claim_user_to_team(
  user_id_to_claim uuid,
  new_added_by uuid
)
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
DECLARE
  target_user users%ROWTYPE;
  current_user_role text;
BEGIN
  -- Check if caller is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if the caller is the same as new_added_by
  IF auth.uid() != new_added_by THEN
    RAISE EXCEPTION 'Can only add users to your own team';
  END IF;

  -- Get the current user's role
  SELECT role INTO current_user_role
  FROM users
  WHERE users.id = auth.uid();

  -- Check if current user is an owner
  IF current_user_role != 'owner' THEN
    RAISE EXCEPTION 'Only owners can claim users';
  END IF;

  -- Get the target user
  SELECT * INTO target_user
  FROM users
  WHERE users.id = user_id_to_claim;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Check if user can be claimed
  IF target_user.added_by IS NOT NULL 
     AND target_user.added_by != target_user.id 
     AND target_user.added_by != new_added_by THEN
    RAISE EXCEPTION 'User already belongs to another team';
  END IF;

  -- Update the user
  UPDATE users
  SET 
    added_by = new_added_by,
    is_active = true
  WHERE users.id = user_id_to_claim;

  -- Return the updated user
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
  WHERE u.id = user_id_to_claim;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION claim_user_to_team(uuid, uuid) TO authenticated;

COMMENT ON FUNCTION claim_user_to_team IS 
'Securely claims a self-registered or unclaimed user into an owner''s team';