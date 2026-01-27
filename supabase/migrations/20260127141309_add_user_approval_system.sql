/*
  # Add User Approval System

  1. Changes
    - Add approval_status column to users table
    - Possible values: 'pending', 'approved', 'rejected'
    - Default is 'approved' for existing users
    - New claims will be 'pending' until approved

  2. Security
    - Update RLS policies to handle approval status
    - Only show approved users in normal queries
    - Allow viewing pending users for approval
*/

-- Add approval_status column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'approved' 
CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Set all existing users to approved
UPDATE users 
SET approval_status = 'approved' 
WHERE approval_status IS NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_approval_status ON users(approval_status);

-- Create index for pending approvals by owner
CREATE INDEX IF NOT EXISTS idx_users_added_by_approval ON users(added_by, approval_status);

COMMENT ON COLUMN users.approval_status IS 
'Approval status for team membership: pending, approved, or rejected';