/*
  # Add Missed Payments and Penalties System

  1. New Tables
    - `missed_payments`
      - Tracks when borrowers skip/miss scheduled payments
      - Records reason and who marked it
      - Links to loan and borrower
      - Tracks if paid later

    - `penalties`
      - Records penalties applied by agents
      - Flexible amount (agent decides)
      - Multiple penalty types
      - Tracks payment status
      - Links to loan, borrower, and line

  2. Changes to Existing Tables
    - `payments`
      - Add `payment_type` column ('regular', 'penalty', 'combined')
      - Add `penalty_id` reference for penalty payments
      - Default existing payments to 'regular'

  3. Security
    - Enable RLS on both new tables
    - Add policies for authenticated users
    - Agents can manage their line's data
    - Owners can view all data

  4. Indexes
    - Add indexes for performance on common queries
*/

-- Create missed_payments table
CREATE TABLE IF NOT EXISTS missed_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  borrower_id uuid NOT NULL REFERENCES borrowers(id) ON DELETE CASCADE,
  expected_date date NOT NULL,
  week_number integer,
  amount_expected decimal(15,2) NOT NULL,
  marked_by uuid REFERENCES users(id),
  marked_at timestamptz DEFAULT now(),
  reason text,
  paid_later boolean DEFAULT false,
  paid_at timestamptz,
  payment_id uuid REFERENCES payments(id),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create penalties table
CREATE TABLE IF NOT EXISTS penalties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  borrower_id uuid NOT NULL REFERENCES borrowers(id) ON DELETE CASCADE,
  line_id uuid NOT NULL REFERENCES lines(id) ON DELETE CASCADE,
  penalty_type text NOT NULL CHECK (penalty_type IN ('missed_payment', 'late_payment', 'custom')),
  amount decimal(15,2) NOT NULL,
  reason text NOT NULL,
  applied_by uuid NOT NULL REFERENCES users(id),
  applied_at timestamptz DEFAULT now(),
  is_paid boolean DEFAULT false,
  paid_at timestamptz,
  payment_id uuid REFERENCES payments(id),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Add payment_type to payments table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'payment_type'
  ) THEN
    ALTER TABLE payments ADD COLUMN payment_type text DEFAULT 'regular' CHECK (payment_type IN ('regular', 'penalty', 'combined'));
  END IF;
END $$;

-- Add penalty_id to payments table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'penalty_id'
  ) THEN
    ALTER TABLE payments ADD COLUMN penalty_id uuid REFERENCES penalties(id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE missed_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE penalties ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_missed_payments_loan ON missed_payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_missed_payments_borrower ON missed_payments(borrower_id);
CREATE INDEX IF NOT EXISTS idx_missed_payments_date ON missed_payments(expected_date);

CREATE INDEX IF NOT EXISTS idx_penalties_loan ON penalties(loan_id);
CREATE INDEX IF NOT EXISTS idx_penalties_borrower ON penalties(borrower_id);
CREATE INDEX IF NOT EXISTS idx_penalties_line ON penalties(line_id);
CREATE INDEX IF NOT EXISTS idx_penalties_unpaid ON penalties(is_paid) WHERE is_paid = false;
CREATE INDEX IF NOT EXISTS idx_penalties_type ON penalties(penalty_type);

CREATE INDEX IF NOT EXISTS idx_payments_type ON payments(payment_type);
CREATE INDEX IF NOT EXISTS idx_payments_penalty ON payments(penalty_id) WHERE penalty_id IS NOT NULL;

-- RLS Policies for missed_payments
CREATE POLICY "Users can view missed payments for their lines"
  ON missed_payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM loans
      JOIN lines ON loans.line_id = lines.id
      WHERE loans.id = missed_payments.loan_id
      AND (
        lines.owner_id = auth.uid()
        OR lines.co_owner_id = auth.uid()
        OR lines.agent_id = auth.uid()
      )
    )
  );

CREATE POLICY "Agents can create missed payments for their lines"
  ON missed_payments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM loans
      JOIN lines ON loans.line_id = lines.id
      WHERE loans.id = missed_payments.loan_id
      AND lines.agent_id = auth.uid()
    )
  );

CREATE POLICY "Agents can update missed payments for their lines"
  ON missed_payments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM loans
      JOIN lines ON loans.line_id = lines.id
      WHERE loans.id = missed_payments.loan_id
      AND lines.agent_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM loans
      JOIN lines ON loans.line_id = lines.id
      WHERE loans.id = missed_payments.loan_id
      AND lines.agent_id = auth.uid()
    )
  );

-- RLS Policies for penalties
CREATE POLICY "Users can view penalties for their lines"
  ON penalties FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lines
      WHERE lines.id = penalties.line_id
      AND (
        lines.owner_id = auth.uid()
        OR lines.co_owner_id = auth.uid()
        OR lines.agent_id = auth.uid()
      )
    )
  );

CREATE POLICY "Agents can create penalties for their lines"
  ON penalties FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lines
      WHERE lines.id = penalties.line_id
      AND lines.agent_id = auth.uid()
    )
  );

CREATE POLICY "Agents can update penalties for their lines"
  ON penalties FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lines
      WHERE lines.id = penalties.line_id
      AND lines.agent_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lines
      WHERE lines.id = penalties.line_id
      AND lines.agent_id = auth.uid()
    )
  );