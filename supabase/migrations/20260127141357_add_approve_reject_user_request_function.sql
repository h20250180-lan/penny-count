/*
  # Add Approve/Reject User Request Function

  1. Purpose
    - Allow users to approve or reject team membership requests
    - Only the user themselves can approve/reject their own request
    - Sets approval_status to 'approved' or 'rejected'

  2. Security
    - User must be authenticated
    - User can only approve/reject their own pending requests
    - Cannot approve requests that are already approved or rejected
*/

CREATE OR REPLACE FUNCTION respond_to_team_request(
  response text
)
RETURNS TABLE (
  id uuid,
  name text,
  phone text,
  email text,
  role text,
  is_active boolean,
  added_by uuid,
  approval_status text,
  created_at timestamptz
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  current_user_record users%ROWTYPE;
BEGIN
  -- Check if caller is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Validate response
  IF response NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid response. Must be "approved" or "rejected"';
  END IF;

  -- Get current user
  SELECT * INTO current_user_record
  FROM users
  WHERE users.id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Check if the request is pending
  IF current_user_record.approval_status != 'pending' THEN
    RAISE EXCEPTION 'No pending request to respond to';
  END IF;

  -- Check if user has a team owner (added_by is not self)
  IF current_user_record.added_by = current_user_record.id OR current_user_record.added_by IS NULL THEN
    RAISE EXCEPTION 'No team request to respond to';
  END IF;

  -- Update approval status
  UPDATE users
  SET approval_status = response
  WHERE users.id = auth.uid();

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
    u.approval_status,
    u.created_at
  FROM users u
  WHERE u.id = auth.uid();
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION respond_to_team_request(text) TO authenticated;

COMMENT ON FUNCTION respond_to_team_request IS 
'Allows a user to approve or reject their pending team membership request';