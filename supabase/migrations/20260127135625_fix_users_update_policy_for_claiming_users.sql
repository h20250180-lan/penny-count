/*
  # Fix Users Update Policy for Claiming Users

  1. Problem
    - WITH CHECK was preventing claiming users because it checks the FINAL state
    - When claiming a user, `added_by` changes from NULL to owner_id
    - The policy needs to allow this specific transition

  2. Solution
    - Simplify WITH CHECK to allow updates where the user is claiming someone
    - Allow self-updates (auth.uid() = id)
    - Allow updates where the NEW added_by value equals auth.uid() (claiming)
    - Allow updates where added_by was already auth.uid() (managing existing team)

  3. Security
    - Users can only claim unclaimed users (USING checks added_by IS NULL)
    - Users can only set added_by to themselves (WITH CHECK ensures added_by = auth.uid())
    - Cannot steal users from other owners
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can update own profile or team members" ON users;

-- Create a new policy that allows claiming
CREATE POLICY "Users can update own profile or team members"
  ON users FOR UPDATE
  TO authenticated
  USING (
    -- Can see and update rows where:
    -- 1. User is updating their own profile
    auth.uid() = id 
    OR 
    -- 2. User is the owner of this team member
    added_by = auth.uid() 
    OR 
    -- 3. User is unclaimed (can be claimed by anyone)
    added_by IS NULL
  )
  WITH CHECK (
    -- After update, row must satisfy one of:
    -- 1. Self-update (user updating their own profile)
    (auth.uid() = id)
    OR
    -- 2. User is being added to the current user's team OR already in their team
    -- This allows claiming AND managing existing team members
    (
      -- The added_by field in the UPDATED row must be the current user
      -- This prevents stealing users from other owners
      added_by = auth.uid()
    )
  );

-- Add helpful comment
COMMENT ON POLICY "Users can update own profile or team members" ON users IS
'Allows users to update their own profile and claim unclaimed users by setting added_by to themselves. Prevents stealing users from other owners.';