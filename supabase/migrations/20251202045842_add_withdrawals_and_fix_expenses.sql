/*
  # Add Withdrawals System and Fix Expense Status

  1. New Tables
    - `withdrawals`
      - Tracks cash taken from balance
      - Requires owner approval
      - Links to line and user
      - Tracks reason and status

  2. Changes to Existing Tables
    - `expenses`
      - Remove 'paid' status (redundant)
      - Keep only: pending, approved, rejected
      - Update existing 'paid' records to 'approved'

  3. Security
    - Enable RLS on withdrawals
    - Only owners can approve
    - Agents/co-owners can request
    - All can view their line's data

  4. Indexes
    - Add indexes for performance
*/

-- Create withdrawals table
CREATE TABLE IF NOT EXISTS withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  line_id uuid REFERENCES lines(id) ON DELETE CASCADE,
  amount decimal(15,2) NOT NULL,
  withdrawal_date date NOT NULL DEFAULT CURRENT_DATE,
  withdrawn_by uuid NOT NULL REFERENCES users(id),
  reason text NOT NULL,
  notes text,
  approved_by uuid REFERENCES users(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_withdrawals_line ON withdrawals(line_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_date ON withdrawals(withdrawal_date);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_withdrawn_by ON withdrawals(withdrawn_by);

-- Update expenses table to remove 'paid' status
DO $$
BEGIN
  -- First update any existing 'paid' expenses to 'approved'
  UPDATE expenses SET status = 'approved' WHERE status = 'paid';
  
  -- Drop old constraint if exists
  ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_status_check;
  
  -- Add new constraint without 'paid'
  ALTER TABLE expenses ADD CONSTRAINT expenses_status_check 
    CHECK (status IN ('pending', 'approved', 'rejected'));
END $$;

-- Remove paid_at column from expenses as it's no longer needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'paid_at'
  ) THEN
    ALTER TABLE expenses DROP COLUMN paid_at;
  END IF;
END $$;

-- RLS Policies for withdrawals
CREATE POLICY "Users can view withdrawals for their lines"
  ON withdrawals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lines
      WHERE lines.id = withdrawals.line_id
      AND (
        lines.owner_id = auth.uid()
        OR lines.co_owner_id = auth.uid()
        OR lines.agent_id = auth.uid()
      )
    )
    OR withdrawals.withdrawn_by = auth.uid()
  );

CREATE POLICY "Users can create withdrawal requests"
  ON withdrawals FOR INSERT
  TO authenticated
  WITH CHECK (
    withdrawn_by = auth.uid()
    AND (
      EXISTS (
        SELECT 1 FROM lines
        WHERE lines.id = withdrawals.line_id
        AND (
          lines.owner_id = auth.uid()
          OR lines.co_owner_id = auth.uid()
          OR lines.agent_id = auth.uid()
        )
      )
      OR EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'owner'
      )
    )
  );

CREATE POLICY "Only owners can approve withdrawals"
  ON withdrawals FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'owner'
    )
    OR (
      EXISTS (
        SELECT 1 FROM lines
        WHERE lines.id = withdrawals.line_id
        AND lines.owner_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'owner'
    )
    OR (
      EXISTS (
        SELECT 1 FROM lines
        WHERE lines.id = withdrawals.line_id
        AND lines.owner_id = auth.uid()
      )
    )
  );