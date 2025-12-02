/*
  # Add Serial Number to Borrowers Table

  1. Changes
    - Add `serial_number` column to borrowers table
    - Serial number is unique within each line (customer tracking ID from paper books)
    - Add unique constraint on (line_id, serial_number) combination
    - Add index for faster lookups

  2. Notes
    - Serial numbers are alphanumeric (e.g., C001, A001, B123)
    - Used as primary tracking identifier from paper records
    - Must be unique within a line but can repeat across different lines
*/

-- Add serial_number column to borrowers table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'borrowers' AND column_name = 'serial_number'
  ) THEN
    ALTER TABLE borrowers ADD COLUMN serial_number text;
  END IF;
END $$;

-- Create unique constraint on line_id + serial_number
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'borrowers_line_serial_unique'
  ) THEN
    ALTER TABLE borrowers 
    ADD CONSTRAINT borrowers_line_serial_unique 
    UNIQUE (line_id, serial_number);
  END IF;
END $$;

-- Create index for faster serial number lookups
CREATE INDEX IF NOT EXISTS idx_borrowers_serial_number 
ON borrowers(serial_number);

-- Create index for phone number lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_borrowers_phone 
ON borrowers(phone);
