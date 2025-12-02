/*
  # Add Payment Details Columns

  1. Changes to payments table
    - Add `borrower_id` column to link payment to borrower
    - Add `method` column to track payment method (cash, upi, phonepe, qr)
    - Add `transaction_id` column for digital payment tracking
    
  2. Why These Columns Are Needed
    - `borrower_id`: Direct link to borrower for easier querying
    - `method`: Track how payment was made for reconciliation
    - `transaction_id`: Required for digital payments for verification
*/

-- Add borrower_id column (from loan relationship)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'borrower_id'
  ) THEN
    ALTER TABLE payments ADD COLUMN borrower_id uuid REFERENCES borrowers(id);
  END IF;
END $$;

-- Add payment method column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'method'
  ) THEN
    ALTER TABLE payments ADD COLUMN method text DEFAULT 'cash' CHECK (method IN ('cash', 'upi', 'phonepe', 'qr', 'bank_transfer'));
  END IF;
END $$;

-- Add transaction_id column for digital payments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'transaction_id'
  ) THEN
    ALTER TABLE payments ADD COLUMN transaction_id text;
  END IF;
END $$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_payments_borrower ON payments(borrower_id);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(method);
CREATE INDEX IF NOT EXISTS idx_payments_transaction ON payments(transaction_id);

-- Backfill borrower_id from loans for existing payments
UPDATE payments p
SET borrower_id = l.borrower_id
FROM loans l
WHERE p.loan_id = l.id
AND p.borrower_id IS NULL;