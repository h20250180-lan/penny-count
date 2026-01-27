/*
  # Fix Users Update Policy for Claiming Users

  1. Changes
    - Update the users UPDATE policy to allow owners to claim unclaimed users
    - Users with NULL added_by can be claimed by any owner
    - Owners can update users they previously added
    - Users can update their own profiles

  2. Security
    - Only allows claiming users who don't have an owner (added_by IS NULL)
    - Prevents stealing users from other owners
    - Maintains self-update capability
*/

-- Drop existing update policy
DROP POLICY IF EXISTS "Users can update own profile or team members" ON users;

-- Create new update policy that allows claiming unclaimed users
CREATE POLICY "Users can update own profile or team members"
  ON users FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id OR
    added_by = auth.uid() OR
    added_by IS NULL
  )
  WITH CHECK (
    auth.uid() = id OR
    (
      -- Allow owners to claim users or update their own team members
      EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role IN ('owner', 'co-owner')
      )
    )
  );

-- Add helpful comment
COMMENT ON POLICY "Users can update own profile or team members" ON users IS
'Allows users to update their own profile, owners to update their team members, and owners to claim unclaimed users (added_by IS NULL)';