/*
  # Daily Accounts and Expenses Management System

  ## Overview
  This migration adds comprehensive financial tracking including daily accounts,
  expenses, payment methods, QR payments, and co-owner agent sessions.

  ## New Tables

  ### 1. daily_accounts
  - `id` (uuid, primary key) - Unique identifier
  - `line_id` (uuid, foreign key, nullable) - Associated line (null = global)
  - `account_date` (date) - Date for this account
  - `opening_balance` (decimal) - Starting balance (editable)
  - `total_collections` (decimal) - Total collected this day
  - `total_expenses` (decimal) - Total expenses this day
  - `total_qr_payments` (decimal) - Digital payments received
  - `closing_balance` (decimal) - Calculated end balance
  - `net_balance` (decimal) - Income - Expenses
  - `is_locked` (boolean) - Prevent editing after approval
  - `locked_by` (uuid, foreign key, nullable) - Who locked it
  - `locked_at` (timestamptz, nullable) - When locked
  - `notes` (text, nullable) - Additional notes
  - `created_by` (uuid, foreign key) - Who created this record
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. expense_categories
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Category name (Food, Travel, Fuel, etc.)
  - `description` (text, nullable) - Category description
  - `budget_limit` (decimal, nullable) - Monthly budget limit
  - `requires_approval` (boolean) - Whether expenses need approval
  - `is_active` (boolean) - Active status
  - `created_at` (timestamptz) - Creation timestamp

  ### 3. expenses
  - `id` (uuid, primary key) - Unique identifier
  - `line_id` (uuid, foreign key, nullable) - Associated line
  - `category_id` (uuid, foreign key) - Expense category
  - `amount` (decimal) - Expense amount
  - `expense_date` (date) - Date of expense
  - `description` (text) - Description of expense
  - `receipt_url` (text, nullable) - Receipt image URL
  - `payment_method` (text) - cash, digital, bank_transfer
  - `submitted_by` (uuid, foreign key) - User who submitted
  - `approved_by` (uuid, foreign key, nullable) - Who approved
  - `status` (text) - pending, approved, rejected, paid
  - `rejection_reason` (text, nullable) - Reason if rejected
  - `approved_at` (timestamptz, nullable) - Approval timestamp
  - `paid_at` (timestamptz, nullable) - Payment timestamp
  - `created_at` (timestamptz) - Creation timestamp

  ### 4. payment_methods
  - `id` (uuid, primary key) - Unique identifier
  - `line_id` (uuid, foreign key, nullable) - Associated line
  - `method_type` (text) - phonepe, gpay, paytm, bank, cash
  - `account_name` (text) - Account holder name
  - `account_number` (text, nullable) - Account/UPI ID
  - `qr_code_data` (text, nullable) - QR code content
  - `qr_code_url` (text, nullable) - QR code image URL
  - `is_active` (boolean) - Active status
  - `created_at` (timestamptz) - Creation timestamp

  ### 5. qr_payments
  - `id` (uuid, primary key) - Unique identifier
  - `loan_id` (uuid, foreign key) - Associated loan
  - `borrower_id` (uuid, foreign key) - Who paid
  - `payment_method_id` (uuid, foreign key) - Which QR/method used
  - `amount` (decimal) - Payment amount
  - `transaction_id` (text) - Gateway transaction ID
  - `transaction_status` (text) - success, pending, failed
  - `payment_timestamp` (timestamptz) - When payment occurred
  - `reconciled` (boolean) - Matched with loan
  - `reconciled_by` (uuid, foreign key, nullable) - Who reconciled
  - `reconciled_at` (timestamptz, nullable) - Reconciliation time
  - `notes` (text, nullable) - Additional notes
  - `created_at` (timestamptz) - Creation timestamp

  ### 6. co_owner_agent_sessions
  - `id` (uuid, primary key) - Unique identifier
  - `co_owner_id` (uuid, foreign key) - Co-owner user
  - `line_id` (uuid, foreign key, nullable) - Which line they're working
  - `session_start` (timestamptz) - When started agent mode
  - `session_end` (timestamptz, nullable) - When ended agent mode
  - `collections_made` (integer) - Number of collections
  - `total_collected` (decimal) - Total amount collected
  - `commission_earned` (decimal) - Commission for this session
  - `is_active` (boolean) - Currently in agent mode
  - `created_at` (timestamptz) - Creation timestamp

  ### 7. daily_reports
  - `id` (uuid, primary key) - Unique identifier
  - `report_date` (date) - Date of report
  - `line_id` (uuid, foreign key, nullable) - Specific line or null for all
  - `opening_balance` (decimal) - Opening balance
  - `closing_balance` (decimal) - Closing balance
  - `total_collections` (decimal) - Total collections
  - `total_expenses` (decimal) - Total expenses
  - `net_profit` (decimal) - Profit/loss
  - `report_data` (jsonb) - Detailed report data
  - `generated_by` (uuid, foreign key) - Who generated
  - `generated_at` (timestamptz) - Generation timestamp
  - `exported` (boolean) - Whether exported to Excel
  - `export_url` (text, nullable) - Export file URL

  ## Security
  - Enable RLS on all tables
  - Owners can view all data
  - Co-owners can view their line data
  - Agents can view limited data
  - Expenses require proper approval workflows
*/

-- Create expense_categories table
CREATE TABLE IF NOT EXISTS expense_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  budget_limit decimal(15,2),
  requires_approval boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create daily_accounts table
CREATE TABLE IF NOT EXISTS daily_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  line_id uuid REFERENCES lines(id) ON DELETE CASCADE,
  account_date date NOT NULL,
  opening_balance decimal(15,2) NOT NULL DEFAULT 0,
  total_collections decimal(15,2) NOT NULL DEFAULT 0,
  total_expenses decimal(15,2) NOT NULL DEFAULT 0,
  total_qr_payments decimal(15,2) NOT NULL DEFAULT 0,
  closing_balance decimal(15,2) NOT NULL DEFAULT 0,
  net_balance decimal(15,2) NOT NULL DEFAULT 0,
  is_locked boolean DEFAULT false,
  locked_by uuid REFERENCES users(id) ON DELETE SET NULL,
  locked_at timestamptz,
  notes text,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(line_id, account_date)
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  line_id uuid REFERENCES lines(id) ON DELETE CASCADE,
  category_id uuid REFERENCES expense_categories(id) ON DELETE RESTRICT,
  amount decimal(15,2) NOT NULL,
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  description text NOT NULL,
  receipt_url text,
  payment_method text DEFAULT 'cash' CHECK (payment_method IN ('cash', 'digital', 'bank_transfer', 'upi')),
  submitted_by uuid REFERENCES users(id) ON DELETE SET NULL,
  approved_by uuid REFERENCES users(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  rejection_reason text,
  approved_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  line_id uuid REFERENCES lines(id) ON DELETE CASCADE,
  method_type text NOT NULL CHECK (method_type IN ('phonepe', 'gpay', 'paytm', 'bank', 'cash', 'upi')),
  account_name text NOT NULL,
  account_number text,
  qr_code_data text,
  qr_code_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create qr_payments table
CREATE TABLE IF NOT EXISTS qr_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid REFERENCES loans(id) ON DELETE CASCADE,
  borrower_id uuid REFERENCES borrowers(id) ON DELETE CASCADE,
  payment_method_id uuid REFERENCES payment_methods(id) ON DELETE SET NULL,
  amount decimal(15,2) NOT NULL,
  transaction_id text UNIQUE,
  transaction_status text DEFAULT 'pending' CHECK (transaction_status IN ('success', 'pending', 'failed')),
  payment_timestamp timestamptz DEFAULT now(),
  reconciled boolean DEFAULT false,
  reconciled_by uuid REFERENCES users(id) ON DELETE SET NULL,
  reconciled_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create co_owner_agent_sessions table
CREATE TABLE IF NOT EXISTS co_owner_agent_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  co_owner_id uuid REFERENCES users(id) ON DELETE CASCADE,
  line_id uuid REFERENCES lines(id) ON DELETE SET NULL,
  session_start timestamptz DEFAULT now(),
  session_end timestamptz,
  collections_made integer DEFAULT 0,
  total_collected decimal(15,2) DEFAULT 0,
  commission_earned decimal(15,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create daily_reports table
CREATE TABLE IF NOT EXISTS daily_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date date NOT NULL,
  line_id uuid REFERENCES lines(id) ON DELETE CASCADE,
  opening_balance decimal(15,2) NOT NULL DEFAULT 0,
  closing_balance decimal(15,2) NOT NULL DEFAULT 0,
  total_collections decimal(15,2) NOT NULL DEFAULT 0,
  total_expenses decimal(15,2) NOT NULL DEFAULT 0,
  net_profit decimal(15,2) NOT NULL DEFAULT 0,
  report_data jsonb,
  generated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  generated_at timestamptz DEFAULT now(),
  exported boolean DEFAULT false,
  export_url text,
  UNIQUE(report_date, line_id)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_daily_accounts_date ON daily_accounts(account_date);
CREATE INDEX IF NOT EXISTS idx_daily_accounts_line ON daily_accounts(line_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_qr_payments_timestamp ON qr_payments(payment_timestamp);
CREATE INDEX IF NOT EXISTS idx_qr_payments_loan ON qr_payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON daily_reports(report_date);

-- Insert default expense categories
INSERT INTO expense_categories (name, description, requires_approval) VALUES
  ('Food', 'Meals and refreshments', false),
  ('Travel', 'Transportation and fuel costs', false),
  ('Fuel', 'Vehicle fuel expenses', false),
  ('Supplies', 'Office and operational supplies', true),
  ('Salaries', 'Staff salaries and wages', true),
  ('Commissions', 'Agent commissions', true),
  ('Rent', 'Office or storage rent', true),
  ('Utilities', 'Phone, internet, electricity', true),
  ('Marketing', 'Advertising and promotion', true),
  ('Miscellaneous', 'Other expenses', true)
ON CONFLICT (name) DO NOTHING;

-- Enable RLS on all new tables
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE co_owner_agent_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for expense_categories (everyone can read)
CREATE POLICY "Anyone can view expense categories"
  ON expense_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Owners can manage expense categories"
  ON expense_categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('owner', 'co-owner')
    )
  );

-- RLS Policies for daily_accounts
CREATE POLICY "Users can view daily accounts for their lines"
  ON daily_accounts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (
        users.role = 'owner'
        OR (users.role = 'co-owner' AND (line_id IS NULL OR EXISTS (
          SELECT 1 FROM lines WHERE lines.id = daily_accounts.line_id AND lines.co_owner_id = auth.uid()
        )))
        OR (users.role = 'agent' AND EXISTS (
          SELECT 1 FROM lines WHERE lines.id = daily_accounts.line_id AND lines.agent_id = auth.uid()
        ))
      )
    )
  );

CREATE POLICY "Owners and co-owners can create daily accounts"
  ON daily_accounts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('owner', 'co-owner')
    )
  );

CREATE POLICY "Owners and co-owners can update unlocked daily accounts"
  ON daily_accounts FOR UPDATE
  TO authenticated
  USING (
    NOT is_locked AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('owner', 'co-owner')
    )
  );

-- RLS Policies for expenses
CREATE POLICY "Users can view expenses for their lines"
  ON expenses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (
        users.role = 'owner'
        OR (users.role = 'co-owner' AND (line_id IS NULL OR EXISTS (
          SELECT 1 FROM lines WHERE lines.id = expenses.line_id AND lines.co_owner_id = auth.uid()
        )))
        OR submitted_by = auth.uid()
      )
    )
  );

CREATE POLICY "Authenticated users can create expenses"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (submitted_by = auth.uid());

CREATE POLICY "Owners and co-owners can update expenses"
  ON expenses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('owner', 'co-owner')
    )
  );

-- RLS Policies for payment_methods
CREATE POLICY "Users can view payment methods for their lines"
  ON payment_methods FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (
        users.role = 'owner'
        OR (users.role = 'co-owner' AND EXISTS (
          SELECT 1 FROM lines WHERE lines.id = payment_methods.line_id AND lines.co_owner_id = auth.uid()
        ))
        OR (users.role = 'agent' AND EXISTS (
          SELECT 1 FROM lines WHERE lines.id = payment_methods.line_id AND lines.agent_id = auth.uid()
        ))
      )
    )
  );

CREATE POLICY "Owners and co-owners can manage payment methods"
  ON payment_methods FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('owner', 'co-owner')
    )
  );

-- RLS Policies for qr_payments
CREATE POLICY "Users can view qr payments for their lines"
  ON qr_payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM loans
      JOIN lines ON loans.line_id = lines.id
      WHERE loans.id = qr_payments.loan_id
      AND (
        EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'owner')
        OR lines.co_owner_id = auth.uid()
        OR lines.agent_id = auth.uid()
      )
    )
  );

CREATE POLICY "Anyone can create qr payments"
  ON qr_payments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Owners and co-owners can update qr payments"
  ON qr_payments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('owner', 'co-owner')
    )
  );

-- RLS Policies for co_owner_agent_sessions
CREATE POLICY "Co-owners can view their own sessions"
  ON co_owner_agent_sessions FOR SELECT
  TO authenticated
  USING (
    co_owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'owner'
    )
  );

CREATE POLICY "Co-owners can manage their sessions"
  ON co_owner_agent_sessions FOR ALL
  TO authenticated
  USING (
    co_owner_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'co-owner'
    )
  );

-- RLS Policies for daily_reports
CREATE POLICY "Users can view daily reports for their lines"
  ON daily_reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (
        users.role = 'owner'
        OR (users.role = 'co-owner' AND EXISTS (
          SELECT 1 FROM lines WHERE lines.id = daily_reports.line_id AND lines.co_owner_id = auth.uid()
        ))
      )
    )
  );

CREATE POLICY "Owners and co-owners can create daily reports"
  ON daily_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('owner', 'co-owner')
    )
  );

-- Function to update daily_accounts automatically
CREATE OR REPLACE FUNCTION update_daily_account_balances()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE daily_accounts
  SET 
    closing_balance = opening_balance + total_collections + total_qr_payments - total_expenses,
    net_balance = total_collections + total_qr_payments - total_expenses,
    updated_at = now()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate balances
CREATE TRIGGER trigger_update_daily_account_balances
AFTER INSERT OR UPDATE OF opening_balance, total_collections, total_expenses, total_qr_payments
ON daily_accounts
FOR EACH ROW
EXECUTE FUNCTION update_daily_account_balances();
