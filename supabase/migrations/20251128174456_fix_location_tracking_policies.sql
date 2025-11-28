/*
  # Fix Location Tracking RLS Policies

  1. Changes
    - Drop existing policies that might be blocking access
    - Recreate with proper permissions
    - Ensure owners can view all agent locations
    - Ensure agents can insert/update their own location
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Agents can manage own location" ON agent_locations;
DROP POLICY IF EXISTS "Owners can view all locations" ON agent_locations;

-- Recreate policies with proper access

-- Agents can insert their own location
CREATE POLICY "Agents can insert own location"
  ON agent_locations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Agents can update their own location
CREATE POLICY "Agents can update own location"
  ON agent_locations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Agents can view their own location
CREATE POLICY "Agents can view own location"
  ON agent_locations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Owners and co-owners can view all agent locations
CREATE POLICY "Owners can view all agent locations"
  ON agent_locations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('owner', 'co-owner')
    )
  );
