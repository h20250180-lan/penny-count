/*
  # Add Borrower Deletion Requests and File Upload Support

  1. New Tables
    - `borrower_deletion_requests`
      - `id` (uuid, primary key)
      - `borrower_id` (uuid, foreign key to borrowers)
      - `requester_id` (uuid, foreign key to users) - who requested deletion
      - `owner_id` (uuid, foreign key to users) - owner who needs to approve
      - `reason` (text) - reason for deletion request
      - `status` (text) - pending, approved, rejected
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Changes to Existing Tables
    - Add optional columns to borrowers table:
      - `aadhar_url` (text) - URL to uploaded aadhar document
      - `photo_url` (text) - URL to uploaded borrower photo

  3. Security
    - Enable RLS on borrower_deletion_requests table
    - Users can view deletion requests they created or need to handle
    - Only owners can approve/reject deletion requests
    - Agents/co-owners can create deletion requests

  4. Indexes
    - Add indexes for performance on frequently queried columns
*/

-- Add optional file upload columns to borrowers table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'borrowers' AND column_name = 'aadhar_url'
  ) THEN
    ALTER TABLE borrowers ADD COLUMN aadhar_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'borrowers' AND column_name = 'photo_url'
  ) THEN
    ALTER TABLE borrowers ADD COLUMN photo_url text;
  END IF;
END $$;

-- Create borrower_deletion_requests table
CREATE TABLE IF NOT EXISTS borrower_deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id uuid NOT NULL REFERENCES borrowers(id) ON DELETE CASCADE,
  requester_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE borrower_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Borrower deletion requests policies
CREATE POLICY "Users can view deletion requests they created or need to handle"
  ON borrower_deletion_requests FOR SELECT
  TO authenticated
  USING (
    auth.uid() = requester_id OR 
    auth.uid() = owner_id
  );

CREATE POLICY "Agents and co-owners can create deletion requests"
  ON borrower_deletion_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Owners can update deletion request status"
  ON borrower_deletion_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_deletion_requests_borrower_id ON borrower_deletion_requests(borrower_id);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_owner_id ON borrower_deletion_requests(owner_id);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_status ON borrower_deletion_requests(status);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_requester_id ON borrower_deletion_requests(requester_id);