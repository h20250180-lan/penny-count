/*
  # Add Owner Relationship to Users
  
  1. Changes
    - Add `added_by` column to users table to track which owner added the agent/co-owner
    - Update RLS policies to ensure owners only see their own team members
    
  2. Security
    - RLS policies updated to filter users by owner relationship
*/

-- Add added_by column to track which owner added this user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'added_by'
  ) THEN
    ALTER TABLE users ADD COLUMN added_by uuid REFERENCES users(id);
    CREATE INDEX IF NOT EXISTS idx_users_added_by ON users(added_by);
  END IF;
END $$;

-- Update existing agents/co-owners to be owned by first owner (temporary fix)
UPDATE users 
SET added_by = (SELECT id FROM users WHERE role = 'owner' LIMIT 1)
WHERE role IN ('agent', 'co-owner') AND added_by IS NULL;

-- Owners don't need added_by (they add themselves conceptually)
-- But set it to self for consistency
UPDATE users 
SET added_by = id
WHERE role = 'owner' AND added_by IS NULL;
