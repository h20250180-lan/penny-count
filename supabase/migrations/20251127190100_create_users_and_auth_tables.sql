/*
  # Create Users and Authentication Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - Links to auth.users
      - `name` (text) - User's full name
      - `email` (text, unique) - User's email address
      - `phone` (text) - User's phone number
      - `role` (text) - User role: owner, co-owner, or agent
      - `photo` (text) - Profile photo URL
      - `is_active` (boolean) - Whether user account is active
      - `assigned_lines` (text array) - Array of line IDs assigned to user
      - `created_at` (timestamptz) - Account creation timestamp

  2. Security
    - Enable RLS on `users` table
    - Add policy for users to read their own data
    - Add policy for users to update their own data
    - Add policy for public signup (insert)
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'agent',
  photo text,
  is_active boolean DEFAULT true,
  assigned_lines text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable insert for signup"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);
