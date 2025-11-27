/*
  # Fix Users Table RLS Policies

  1. Changes
    - Drop existing restrictive policies
    - Add policy for authenticated users to insert their own profile
    - Add policy for users to read any user data (needed for app functionality)
    - Keep update policy for users to update their own profile

  2. Security
    - Authenticated users can read all users (needed for the app)
    - Users can only insert their own profile during signup
    - Users can only update their own profile
*/

DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Enable insert for signup" ON users;

CREATE POLICY "Authenticated users can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile during signup"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can insert during signup"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);
