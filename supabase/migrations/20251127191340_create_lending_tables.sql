/*
  # Create Penny Count Lending System Tables

  ## Overview
  This migration creates all tables needed for the micro-lending management system.

  ## New Tables

  ### 1. lines
  - `id` (uuid, primary key) - Unique identifier for each lending line
  - `name` (text) - Name of the lending line
  - `owner_id` (uuid, foreign key) - References users table (owner)
  - `co_owner_id` (uuid, foreign key, nullable) - References users table (co-owner)
  - `agent_id` (uuid, foreign key, nullable) - References users table (agent)
  - `initial_capital` (decimal) - Starting capital for the line
  - `current_balance` (decimal) - Current available balance
  - `total_disbursed` (decimal) - Total amount disbursed as loans
  - `total_collected` (decimal) - Total amount collected
  - `borrower_count` (integer) - Number of borrowers
  - `interest_rate` (decimal) - Default interest rate percentage
  - `default_tenure` (integer) - Default loan tenure in days
  - `is_active` (boolean) - Whether the line is active
  - `created_at` (timestamptz) - Creation timestamp

  ### 2. borrowers
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Borrower's name
  - `phone` (text) - Phone number
  - `address` (text) - Physical address
  - `geolocation` (jsonb, nullable) - GPS coordinates
  - `is_high_risk` (boolean) - Risk flag
  - `is_defaulter` (boolean) - Default status
  - `total_loans` (integer) - Total number of loans taken
  - `active_loans` (integer) - Currently active loans
  - `total_repaid` (decimal) - Total amount repaid
  - `line_id` (uuid, foreign key) - Associated lending line
  - `agent_id` (uuid, foreign key) - Agent managing this borrower
  - `created_at` (timestamptz) - Creation timestamp

  ### 3. loans
  - `id` (uuid, primary key) - Unique identifier
  - `borrower_id` (uuid, foreign key) - References borrowers
  - `line_id` (uuid, foreign key) - References lines
  - `principal` (decimal) - Loan principal amount
  - `interest_rate` (decimal) - Interest rate for this loan
  - `total_amount` (decimal) - Principal + interest
  - `amount_paid` (decimal) - Amount paid so far
  - `balance` (decimal) - Remaining balance
  - `status` (text) - active, completed, defaulted
  - `tenure` (integer) - Loan period in days
  - `disbursed_date` (timestamptz) - When loan was given
  - `due_date` (timestamptz) - When loan is due
  - `created_at` (timestamptz) - Creation timestamp

  ### 4. payments
  - `id` (uuid, primary key) - Unique identifier
  - `loan_id` (uuid, foreign key) - References loans
  - `amount` (decimal) - Payment amount
  - `payment_date` (timestamptz) - When payment was made
  - `collected_by` (uuid, foreign key) - Agent who collected
  - `notes` (text, nullable) - Additional notes
  - `created_at` (timestamptz) - Creation timestamp

  ### 5. commissions
  - `id` (uuid, primary key) - Unique identifier
  - `agent_id` (uuid, foreign key) - References users (agent)
  - `line_id` (uuid, foreign key) - References lines
  - `amount` (decimal) - Commission amount
  - `period_start` (date) - Commission period start
  - `period_end` (date) - Commission period end
  - `status` (text) - pending, paid
  - `paid_date` (timestamptz, nullable) - When commission was paid
  - `created_at` (timestamptz) - Creation timestamp

  ### 6. notifications
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - References users
  - `title` (text) - Notification title
  - `message` (text) - Notification message
  - `type` (text) - alert, info, warning, success
  - `is_read` (boolean) - Read status
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - Enable RLS on all tables
  - Create policies for role-based access control
*/

-- Create lines table
CREATE TABLE IF NOT EXISTS lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  co_owner_id uuid REFERENCES users(id) ON DELETE SET NULL,
  agent_id uuid REFERENCES users(id) ON DELETE SET NULL,
  initial_capital decimal(15,2) NOT NULL DEFAULT 0,
  current_balance decimal(15,2) NOT NULL DEFAULT 0,
  total_disbursed decimal(15,2) NOT NULL DEFAULT 0,
  total_collected decimal(15,2) NOT NULL DEFAULT 0,
  borrower_count integer NOT NULL DEFAULT 0,
  interest_rate decimal(5,2) NOT NULL DEFAULT 10,
  default_tenure integer NOT NULL DEFAULT 30,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lines ENABLE ROW LEVEL SECURITY;

-- Create borrowers table
CREATE TABLE IF NOT EXISTS borrowers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  address text DEFAULT '',
  geolocation jsonb,
  is_high_risk boolean NOT NULL DEFAULT false,
  is_defaulter boolean NOT NULL DEFAULT false,
  total_loans integer NOT NULL DEFAULT 0,
  active_loans integer NOT NULL DEFAULT 0,
  total_repaid decimal(15,2) NOT NULL DEFAULT 0,
  line_id uuid NOT NULL REFERENCES lines(id) ON DELETE CASCADE,
  agent_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE borrowers ENABLE ROW LEVEL SECURITY;

-- Create loans table
CREATE TABLE IF NOT EXISTS loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id uuid NOT NULL REFERENCES borrowers(id) ON DELETE CASCADE,
  line_id uuid NOT NULL REFERENCES lines(id) ON DELETE CASCADE,
  principal decimal(15,2) NOT NULL,
  interest_rate decimal(5,2) NOT NULL,
  total_amount decimal(15,2) NOT NULL,
  amount_paid decimal(15,2) NOT NULL DEFAULT 0,
  balance decimal(15,2) NOT NULL,
  status text NOT NULL DEFAULT 'active',
  tenure integer NOT NULL,
  disbursed_date timestamptz NOT NULL,
  due_date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  amount decimal(15,2) NOT NULL,
  payment_date timestamptz NOT NULL DEFAULT now(),
  collected_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create commissions table
CREATE TABLE IF NOT EXISTS commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  line_id uuid NOT NULL REFERENCES lines(id) ON DELETE CASCADE,
  amount decimal(15,2) NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  paid_date timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lines table
CREATE POLICY "Users can view lines they own, co-own, or are assigned to"
  ON lines FOR SELECT
  TO authenticated
  USING (
    auth.uid() = owner_id OR 
    auth.uid() = co_owner_id OR 
    auth.uid() = agent_id
  );

CREATE POLICY "Owners can insert their lines"
  ON lines FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners and co-owners can update their lines"
  ON lines FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id OR auth.uid() = co_owner_id)
  WITH CHECK (auth.uid() = owner_id OR auth.uid() = co_owner_id);

CREATE POLICY "Only owners can delete their lines"
  ON lines FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- RLS Policies for borrowers table
CREATE POLICY "Users can view borrowers in their lines"
  ON borrowers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lines 
      WHERE lines.id = borrowers.line_id 
      AND (lines.owner_id = auth.uid() OR lines.co_owner_id = auth.uid() OR lines.agent_id = auth.uid())
    )
  );

CREATE POLICY "Agents can insert borrowers in their lines"
  ON borrowers FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = agent_id AND
    EXISTS (
      SELECT 1 FROM lines 
      WHERE lines.id = line_id 
      AND (lines.owner_id = auth.uid() OR lines.co_owner_id = auth.uid() OR lines.agent_id = auth.uid())
    )
  );

CREATE POLICY "Agents can update their borrowers"
  ON borrowers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lines 
      WHERE lines.id = borrowers.line_id 
      AND (lines.owner_id = auth.uid() OR lines.co_owner_id = auth.uid() OR lines.agent_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lines 
      WHERE lines.id = borrowers.line_id 
      AND (lines.owner_id = auth.uid() OR lines.co_owner_id = auth.uid() OR lines.agent_id = auth.uid())
    )
  );

CREATE POLICY "Line owners can delete borrowers"
  ON borrowers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lines 
      WHERE lines.id = borrowers.line_id 
      AND (lines.owner_id = auth.uid() OR lines.co_owner_id = auth.uid())
    )
  );

-- RLS Policies for loans table
CREATE POLICY "Users can view loans in their lines"
  ON loans FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lines 
      WHERE lines.id = loans.line_id 
      AND (lines.owner_id = auth.uid() OR lines.co_owner_id = auth.uid() OR lines.agent_id = auth.uid())
    )
  );

CREATE POLICY "Line members can create loans"
  ON loans FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lines 
      WHERE lines.id = line_id 
      AND (lines.owner_id = auth.uid() OR lines.co_owner_id = auth.uid() OR lines.agent_id = auth.uid())
    )
  );

CREATE POLICY "Line members can update loans"
  ON loans FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lines 
      WHERE lines.id = loans.line_id 
      AND (lines.owner_id = auth.uid() OR lines.co_owner_id = auth.uid() OR lines.agent_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lines 
      WHERE lines.id = loans.line_id 
      AND (lines.owner_id = auth.uid() OR lines.co_owner_id = auth.uid() OR lines.agent_id = auth.uid())
    )
  );

CREATE POLICY "Line owners can delete loans"
  ON loans FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lines 
      WHERE lines.id = loans.line_id 
      AND (lines.owner_id = auth.uid() OR lines.co_owner_id = auth.uid())
    )
  );

-- RLS Policies for payments table
CREATE POLICY "Users can view payments in their lines"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM loans 
      JOIN lines ON lines.id = loans.line_id
      WHERE loans.id = payments.loan_id 
      AND (lines.owner_id = auth.uid() OR lines.co_owner_id = auth.uid() OR lines.agent_id = auth.uid())
    )
  );

CREATE POLICY "Line members can create payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = collected_by AND
    EXISTS (
      SELECT 1 FROM loans 
      JOIN lines ON lines.id = loans.line_id
      WHERE loans.id = loan_id 
      AND (lines.owner_id = auth.uid() OR lines.co_owner_id = auth.uid() OR lines.agent_id = auth.uid())
    )
  );

CREATE POLICY "Only payment collector can update"
  ON payments FOR UPDATE
  TO authenticated
  USING (auth.uid() = collected_by)
  WITH CHECK (auth.uid() = collected_by);

CREATE POLICY "Line owners can delete payments"
  ON payments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM loans 
      JOIN lines ON lines.id = loans.line_id
      WHERE loans.id = payments.loan_id 
      AND (lines.owner_id = auth.uid() OR lines.co_owner_id = auth.uid())
    )
  );

-- RLS Policies for commissions table
CREATE POLICY "Users can view their commissions"
  ON commissions FOR SELECT
  TO authenticated
  USING (
    auth.uid() = agent_id OR
    EXISTS (
      SELECT 1 FROM lines 
      WHERE lines.id = commissions.line_id 
      AND (lines.owner_id = auth.uid() OR lines.co_owner_id = auth.uid())
    )
  );

CREATE POLICY "Line owners can create commissions"
  ON commissions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lines 
      WHERE lines.id = line_id 
      AND (lines.owner_id = auth.uid() OR lines.co_owner_id = auth.uid())
    )
  );

CREATE POLICY "Line owners can update commissions"
  ON commissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lines 
      WHERE lines.id = commissions.line_id 
      AND (lines.owner_id = auth.uid() OR lines.co_owner_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lines 
      WHERE lines.id = commissions.line_id 
      AND (lines.owner_id = auth.uid() OR lines.co_owner_id = auth.uid())
    )
  );

CREATE POLICY "Line owners can delete commissions"
  ON commissions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lines 
      WHERE lines.id = commissions.line_id 
      AND (lines.owner_id = auth.uid() OR lines.co_owner_id = auth.uid())
    )
  );

-- RLS Policies for notifications table
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
