/*
  # Fix Users Update Policy - Allow Claiming Self-Registered Users

  1. Problem
    - Users who self-register have added_by = their own ID
    - Other owners cannot claim these users because the policy doesn't allow it
    - Policy only checked for added_by IS NULL, not self-registered users

  2. Solution
    - Allow claiming users where added_by equals their own ID (self-registered)
    - Allow claiming users where added_by IS NULL (never claimed)
    - Keep all other security checks intact

  3. Security
    - Owners can only claim self-registered or unclaimed users
    - Cannot steal users from other owners
    - Users can always update their own profile
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can update own profile or team members" ON users;

-- Create a new policy that allows claiming self-registered users
CREATE POLICY "Users can update own profile or team members"
  ON users FOR UPDATE
  TO authenticated
  USING (
    -- Can see and update rows where:
    -- 1. User is updating their own profile
    auth.uid() = id 
    OR 
    -- 2. User is already on the current user's team
    added_by = auth.uid() 
    OR 
    -- 3. User is unclaimed (NULL)
    added_by IS NULL
    OR
    -- 4. User is self-registered (added_by equals their own ID)
    added_by = id
  )
  WITH CHECK (
    -- After update, row must satisfy one of:
    -- 1. Self-update (user updating their own profile)
    (auth.uid() = id)
    OR
    -- 2. User is being added to or already on the current user's team
    (added_by = auth.uid())
  );

-- Add helpful comment
COMMENT ON POLICY "Users can update own profile or team members" ON users IS
'Allows users to update their own profile and claim self-registered or unclaimed users. Prevents stealing users from other owners.';