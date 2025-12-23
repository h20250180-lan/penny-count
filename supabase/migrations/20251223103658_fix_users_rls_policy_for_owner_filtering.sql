/*
  # Fix Users RLS Policy for Owner Filtering
  
  1. Changes
    - Update users SELECT policy to allow owners to only see their own team members
    - Owners can see users they added (added_by = owner_id)
    - Users can always see their own profile
    - Allow owners to update users they added
    
  2. Security
    - Ensures owners only see agents/co-owners they added
    - Maintains ability for users to see their own profiles
*/

-- Drop existing overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can read all users" ON users;

-- Create new restrictive policy for reading users
CREATE POLICY "Users can view own profile and team members"
  ON users FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id OR
    auth.uid() = added_by OR
    added_by = auth.uid()
  );

-- Update the update policy to allow owners to update their team members
DROP POLICY IF EXISTS "Users can update own profile" ON users;

CREATE POLICY "Users can update own profile or team members"
  ON users FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id OR
    added_by = auth.uid()
  )
  WITH CHECK (
    auth.uid() = id OR
    added_by = auth.uid()
  );
