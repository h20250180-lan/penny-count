/*
  # Add Location Tracking System

  1. New Tables
    - `agent_locations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `latitude` (decimal)
      - `longitude` (decimal)
      - `accuracy` (decimal)
      - `is_active` (boolean) - tracking on/off status
      - `last_updated` (timestamptz)
      - `created_at` (timestamptz)

    - `offline_queue`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `action_type` (text) - 'loan', 'payment', 'collection', 'borrower'
      - `data` (jsonb) - the actual transaction data
      - `status` (text) - 'pending', 'synced', 'failed'
      - `created_at` (timestamptz)
      - `synced_at` (timestamptz, nullable)
      - `error_message` (text, nullable)

  2. Security
    - Enable RLS on both tables
    - Agents can update their own location and tracking status
    - Owners can view all agent locations
    - Users can only access their own offline queue
*/

-- Create agent_locations table
CREATE TABLE IF NOT EXISTS agent_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  latitude decimal(10, 8) NOT NULL,
  longitude decimal(11, 8) NOT NULL,
  accuracy decimal(10, 2) DEFAULT 0,
  is_active boolean DEFAULT true,
  last_updated timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_agent_locations_user_id ON agent_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_locations_last_updated ON agent_locations(last_updated DESC);

-- Enable RLS
ALTER TABLE agent_locations ENABLE ROW LEVEL SECURITY;

-- Agents can insert and update their own location
CREATE POLICY "Agents can manage own location"
  ON agent_locations
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Owners and co-owners can view all agent locations
CREATE POLICY "Owners can view all locations"
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

-- Create offline_queue table
CREATE TABLE IF NOT EXISTS offline_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  action_type text NOT NULL CHECK (action_type IN ('loan', 'payment', 'collection', 'borrower')),
  data jsonb NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'synced', 'failed')),
  created_at timestamptz DEFAULT now() NOT NULL,
  synced_at timestamptz,
  error_message text
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_offline_queue_user_id ON offline_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_offline_queue_status ON offline_queue(status);
CREATE INDEX IF NOT EXISTS idx_offline_queue_created_at ON offline_queue(created_at DESC);

-- Enable RLS
ALTER TABLE offline_queue ENABLE ROW LEVEL SECURITY;

-- Users can manage their own queue items
CREATE POLICY "Users can manage own queue"
  ON offline_queue
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Owners can view all queue items for monitoring
CREATE POLICY "Owners can view all queues"
  ON offline_queue
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('owner', 'co-owner')
    )
  );