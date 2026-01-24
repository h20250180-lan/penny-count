/*
  # Add Phone and Email Uniqueness with Validation

  1. Changes
    - Add unique constraint on phone number (when not null)
    - Add check constraint to validate phone has exactly 10 digits
    - Email is already unique, but we ensure it remains so
    - Add validation function for phone format
  
  2. Security
    - Ensures data integrity by preventing duplicate emails and phones
    - Validates phone numbers are exactly 10 digits
    - Helps prevent account creation with invalid data
*/

-- Add unique constraint on phone (only when not null)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_phone_key'
  ) THEN
    ALTER TABLE public.users 
    ADD CONSTRAINT users_phone_key UNIQUE (phone);
  END IF;
END $$;

-- Add check constraint for phone validation (must be exactly 10 digits when provided)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_phone_check'
  ) THEN
    ALTER TABLE public.users 
    ADD CONSTRAINT users_phone_check 
    CHECK (phone IS NULL OR (phone ~ '^[0-9]{10}$'));
  END IF;
END $$;

-- Create a function to validate phone number format
CREATE OR REPLACE FUNCTION validate_phone_number(phone_input TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Phone must be exactly 10 digits
  RETURN phone_input IS NULL OR phone_input ~ '^[0-9]{10}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create a function to clean and format phone numbers
CREATE OR REPLACE FUNCTION clean_phone_number(phone_input TEXT)
RETURNS TEXT AS $$
DECLARE
  cleaned TEXT;
BEGIN
  IF phone_input IS NULL OR phone_input = '' THEN
    RETURN NULL;
  END IF;
  
  -- Remove all non-numeric characters
  cleaned := REGEXP_REPLACE(phone_input, '[^0-9]', '', 'g');
  
  -- Take the last 10 digits if more than 10
  IF LENGTH(cleaned) > 10 THEN
    cleaned := SUBSTRING(cleaned, LENGTH(cleaned) - 9, 10);
  END IF;
  
  -- Return NULL if not exactly 10 digits
  IF LENGTH(cleaned) != 10 THEN
    RETURN NULL;
  END IF;
  
  RETURN cleaned;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
