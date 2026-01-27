/*
  # Add Phone to Email Lookup Function for Login
  
  1. Changes
    - Create a secure database function to look up email by phone number
    - Allow unauthenticated users to call this function for login purposes
    - Only returns email, no other sensitive information
    
  2. Security
    - Function only returns email field
    - No other user data is exposed
    - Rate limiting should be handled at application level
    - This is necessary for phone-based login
*/

-- Create a function to safely look up email by phone number
CREATE OR REPLACE FUNCTION get_email_by_phone(phone_number text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
BEGIN
  -- Clean the phone number (remove non-digits)
  phone_number := regexp_replace(phone_number, '[^0-9]', '', 'g');
  
  -- Look up the email
  SELECT email INTO user_email
  FROM users
  WHERE phone = phone_number
  LIMIT 1;
  
  RETURN user_email;
END;
$$;

-- Grant execute permission to anonymous users for login
GRANT EXECUTE ON FUNCTION get_email_by_phone(text) TO anon;
GRANT EXECUTE ON FUNCTION get_email_by_phone(text) TO authenticated;

-- Add comment explaining the function
COMMENT ON FUNCTION get_email_by_phone(text) IS 
'Safely returns email address for a given phone number. Used for phone-based login. Only exposes email, no other user data.';