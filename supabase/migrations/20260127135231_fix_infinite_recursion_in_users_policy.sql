/*
  # Fix Infinite Recursion in Users Update Policy

  1. Problem
    - The WITH CHECK clause was querying the users table, causing infinite recursion
    - Subquery in WITH CHECK creates circular dependency

  2. Solution
    - Simplify WITH CHECK to use only direct column checks
    - Allow users to update their own profile (id check)
    - Allow claiming unclaimed users by checking added_by column state
    - Trust that USING clause already filtered who can see the rows

  3. Security
    - USING clause ensures only authorized users can see rows to update
    - WITH CHECK ensures updates maintain data integrity
    - No circular dependencies
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can update own profile or team members" ON users;

-- Create a simpler, non-recursive policy
CREATE POLICY "Users can update own profile or team members"
  ON users FOR UPDATE
  TO authenticated
  USING (
    -- Can see rows where: user is self, or user added them, or user is unclaimed
    auth.uid() = id OR
    added_by = auth.uid() OR
    added_by IS NULL
  )
  WITH CHECK (
    -- After update, the row must be: self-update, or claiming unclaimed user, or updating own team member
    auth.uid() = id OR
    added_by = auth.uid()
  );

-- Add helpful comment
COMMENT ON POLICY "Users can update own profile or team members" ON users IS
'Allows users to update their own profile and claim/update team members. USING checks read permissions, WITH CHECK validates the updated state.';