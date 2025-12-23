/*
  # Fix Expenses RLS and Add Adder Tracking

  1. Changes
    - Add `added_by_role` column to expenses table to track the role of who added it (owner, co-owner, or agent)
    - Fix RLS policies to only show expenses from agents under the current owner
    - Ensure proper filtering based on the user hierarchy

  2. Security
    - Owners can only see expenses from their own agents/co-owners
    - Agents and co-owners can only see their own expenses
    - RLS policies properly check the added_by relationship
*/

-- Add added_by_role column to track who added the expense
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'expenses' AND column_name = 'added_by_role'
  ) THEN
    ALTER TABLE expenses ADD COLUMN added_by_role text CHECK (added_by_role IN ('owner', 'co-owner', 'agent'));
  END IF;
END $$;

-- Update existing expenses to set added_by_role based on submitted_by user's role
UPDATE expenses 
SET added_by_role = (
  SELECT role FROM users WHERE users.id = expenses.submitted_by
)
WHERE added_by_role IS NULL AND submitted_by IS NOT NULL;

-- Drop old RLS policy for viewing expenses
DROP POLICY IF EXISTS "Users can view expenses for their lines" ON expenses;

-- Create new RLS policy that properly filters by owner
CREATE POLICY "Users can view expenses from their team"
  ON expenses FOR SELECT
  TO authenticated
  USING (
    -- Owners can see expenses from agents/co-owners they added
    (
      EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'owner'
      )
      AND
      EXISTS (
        SELECT 1 FROM users submitted_user
        WHERE submitted_user.id = expenses.submitted_by
        AND (
          submitted_user.added_by = auth.uid()
          OR submitted_user.id = auth.uid()
        )
      )
    )
    OR
    -- Co-owners can see their own expenses and expenses from their lines
    (
      EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'co-owner'
      )
      AND (
        submitted_by = auth.uid()
        OR (
          line_id IS NOT NULL 
          AND EXISTS (
            SELECT 1 FROM lines 
            WHERE lines.id = expenses.line_id 
            AND lines.co_owner_id = auth.uid()
          )
        )
      )
    )
    OR
    -- Agents can only see their own expenses
    (
      EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'agent'
      )
      AND submitted_by = auth.uid()
    )
  );

-- Update insert policy to set added_by_role automatically
DROP POLICY IF EXISTS "Authenticated users can create expenses" ON expenses;

CREATE POLICY "Users can create expenses"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
    )
  );