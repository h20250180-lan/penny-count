-- Database Cleanup and Seed Script for Owner: Roopesh
-- This script clears all existing data and creates test data with proper naming (test_XX format)

-- Step 1: Clear all existing data (be careful - this deletes everything!)
TRUNCATE TABLE
  qr_payments,
  missed_payments,
  penalties,
  payments,
  loans,
  borrowers,
  daily_accounts,
  withdrawals,
  expenses,
  commissions,
  co_owner_agent_sessions,
  daily_reports,
  payment_methods,
  lines,
  notifications,
  agent_locations,
  offline_queue
CASCADE;

-- Note: We don't truncate users and expense_categories as they may be needed

-- Step 2: Find or verify owner roopesh exists
-- Assuming roopesh user already exists in the system
-- If not, you'll need to create the user first through the auth system

-- Step 3: Create Test Lines (2 lines)
INSERT INTO lines (id, name, owner_id, initial_capital, current_balance, total_disbursed, total_collected, borrower_count, interest_rate, default_tenure, is_active)
VALUES
  (gen_random_uuid(), 'test_line_01', (SELECT id FROM users WHERE email = 'roopesh@example.com' OR name = 'roopesh' LIMIT 1), 100000, 95000, 50000, 45000, 2, 10, 30, true),
  (gen_random_uuid(), 'test_line_02', (SELECT id FROM users WHERE email = 'roopesh@example.com' OR name = 'roopesh' LIMIT 1), 150000, 140000, 70000, 60000, 2, 12, 45, true);

-- Step 4: Create Test Users (2 agents)
-- Note: These need to be created through Supabase Auth first
-- For now, we'll create placeholder records assuming they'll be created via the UI
INSERT INTO users (id, name, email, phone, role, is_active)
VALUES
  (gen_random_uuid(), 'test_agent_01', 'test_agent_01@example.com', '9876543210', 'agent', true),
  (gen_random_uuid(), 'test_agent_02', 'test_agent_02@example.com', '9876543211', 'agent', true)
ON CONFLICT (email) DO NOTHING;

-- Step 5: Assign agents to lines
UPDATE lines
SET agent_id = (SELECT id FROM users WHERE email = 'test_agent_01@example.com' LIMIT 1)
WHERE name = 'test_line_01';

UPDATE lines
SET agent_id = (SELECT id FROM users WHERE email = 'test_agent_02@example.com' LIMIT 1)
WHERE name = 'test_line_02';

-- Step 6: Create Test Borrowers (2 per line = 4 total)
INSERT INTO borrowers (id, name, phone, address, line_id, agent_id, serial_number, is_high_risk, is_defaulter, total_loans, active_loans, total_repaid)
VALUES
  (gen_random_uuid(), 'test_borrower_01', '9123456780', 'Test Address 1, City',
    (SELECT id FROM lines WHERE name = 'test_line_01'),
    (SELECT id FROM users WHERE email = 'test_agent_01@example.com'),
    'BR001', false, false, 1, 1, 0),

  (gen_random_uuid(), 'test_borrower_02', '9123456781', 'Test Address 2, City',
    (SELECT id FROM lines WHERE name = 'test_line_01'),
    (SELECT id FROM users WHERE email = 'test_agent_01@example.com'),
    'BR002', false, false, 1, 1, 0),

  (gen_random_uuid(), 'test_borrower_03', '9123456782', 'Test Address 3, City',
    (SELECT id FROM lines WHERE name = 'test_line_02'),
    (SELECT id FROM users WHERE email = 'test_agent_02@example.com'),
    'BR003', false, false, 1, 1, 0),

  (gen_random_uuid(), 'test_borrower_04', '9123456783', 'Test Address 4, City',
    (SELECT id FROM lines WHERE name = 'test_line_02'),
    (SELECT id FROM users WHERE email = 'test_agent_02@example.com'),
    'BR004', false, false, 1, 1, 0);

-- Step 7: Create Test Loans (2 per line = 4 total)
INSERT INTO loans (id, borrower_id, line_id, principal, interest_rate, total_amount, amount_paid, balance, status, tenure, disbursed_date, due_date)
VALUES
  (gen_random_uuid(),
    (SELECT id FROM borrowers WHERE name = 'test_borrower_01'),
    (SELECT id FROM lines WHERE name = 'test_line_01'),
    25000, 10, 27500, 10000, 17500, 'active', 30, NOW() - INTERVAL '15 days', NOW() + INTERVAL '15 days'),

  (gen_random_uuid(),
    (SELECT id FROM borrowers WHERE name = 'test_borrower_02'),
    (SELECT id FROM lines WHERE name = 'test_line_01'),
    25000, 10, 27500, 15000, 12500, 'active', 30, NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days'),

  (gen_random_uuid(),
    (SELECT id FROM borrowers WHERE name = 'test_borrower_03'),
    (SELECT id FROM lines WHERE name = 'test_line_02'),
    35000, 12, 39200, 20000, 19200, 'active', 45, NOW() - INTERVAL '20 days', NOW() + INTERVAL '25 days'),

  (gen_random_uuid(),
    (SELECT id FROM borrowers WHERE name = 'test_borrower_04'),
    (SELECT id FROM lines WHERE name = 'test_line_02'),
    35000, 12, 39200, 10000, 29200, 'active', 45, NOW() - INTERVAL '5 days', NOW() + INTERVAL '40 days');

-- Step 8: Create Test Payments (2 per loan = 8 total)
INSERT INTO payments (id, loan_id, borrower_id, amount, payment_date, collected_by, method, notes)
VALUES
  -- Payments for test_borrower_01 loan
  (gen_random_uuid(),
    (SELECT id FROM loans WHERE borrower_id = (SELECT id FROM borrowers WHERE name = 'test_borrower_01')),
    (SELECT id FROM borrowers WHERE name = 'test_borrower_01'),
    5000, NOW() - INTERVAL '10 days',
    (SELECT id FROM users WHERE email = 'test_agent_01@example.com'),
    'cash', 'test_payment_01'),

  (gen_random_uuid(),
    (SELECT id FROM loans WHERE borrower_id = (SELECT id FROM borrowers WHERE name = 'test_borrower_01')),
    (SELECT id FROM borrowers WHERE name = 'test_borrower_01'),
    5000, NOW() - INTERVAL '5 days',
    (SELECT id FROM users WHERE email = 'test_agent_01@example.com'),
    'upi', 'test_payment_02'),

  -- Payments for test_borrower_02 loan
  (gen_random_uuid(),
    (SELECT id FROM loans WHERE borrower_id = (SELECT id FROM borrowers WHERE name = 'test_borrower_02')),
    (SELECT id FROM borrowers WHERE name = 'test_borrower_02'),
    10000, NOW() - INTERVAL '8 days',
    (SELECT id FROM users WHERE email = 'test_agent_01@example.com'),
    'cash', 'test_payment_03'),

  (gen_random_uuid(),
    (SELECT id FROM loans WHERE borrower_id = (SELECT id FROM borrowers WHERE name = 'test_borrower_02')),
    (SELECT id FROM borrowers WHERE name = 'test_borrower_02'),
    5000, NOW() - INTERVAL '3 days',
    (SELECT id FROM users WHERE email = 'test_agent_01@example.com'),
    'phonepe', 'test_payment_04'),

  -- Payments for test_borrower_03 loan
  (gen_random_uuid(),
    (SELECT id FROM loans WHERE borrower_id = (SELECT id FROM borrowers WHERE name = 'test_borrower_03')),
    (SELECT id FROM borrowers WHERE name = 'test_borrower_03'),
    10000, NOW() - INTERVAL '15 days',
    (SELECT id FROM users WHERE email = 'test_agent_02@example.com'),
    'cash', 'test_payment_05'),

  (gen_random_uuid(),
    (SELECT id FROM loans WHERE borrower_id = (SELECT id FROM borrowers WHERE name = 'test_borrower_03')),
    (SELECT id FROM borrowers WHERE name = 'test_borrower_03'),
    10000, NOW() - INTERVAL '7 days',
    (SELECT id FROM users WHERE email = 'test_agent_02@example.com'),
    'upi', 'test_payment_06'),

  -- Payments for test_borrower_04 loan
  (gen_random_uuid(),
    (SELECT id FROM loans WHERE borrower_id = (SELECT id FROM borrowers WHERE name = 'test_borrower_04')),
    (SELECT id FROM borrowers WHERE name = 'test_borrower_04'),
    5000, NOW() - INTERVAL '4 days',
    (SELECT id FROM users WHERE email = 'test_agent_02@example.com'),
    'cash', 'test_payment_07'),

  (gen_random_uuid(),
    (SELECT id FROM loans WHERE borrower_id = (SELECT id FROM borrowers WHERE name = 'test_borrower_04')),
    (SELECT id FROM borrowers WHERE name = 'test_borrower_04'),
    5000, NOW() - INTERVAL '1 day',
    (SELECT id FROM users WHERE email = 'test_agent_02@example.com'),
    'phonepe', 'test_payment_08');

-- Step 9: Create Test Expenses (2 per agent = 4 total)
INSERT INTO expenses (id, line_id, category_id, amount, expense_date, description, payment_method, submitted_by, status)
VALUES
  (gen_random_uuid(),
    (SELECT id FROM lines WHERE name = 'test_line_01'),
    (SELECT id FROM expense_categories WHERE name = 'Fuel' LIMIT 1),
    500, NOW() - INTERVAL '5 days',
    'test_expense_01 - Fuel for collection rounds',
    'cash',
    (SELECT id FROM users WHERE email = 'test_agent_01@example.com'),
    'approved'),

  (gen_random_uuid(),
    (SELECT id FROM lines WHERE name = 'test_line_01'),
    (SELECT id FROM expense_categories WHERE name = 'Food' LIMIT 1),
    300, NOW() - INTERVAL '2 days',
    'test_expense_02 - Lunch during field work',
    'cash',
    (SELECT id FROM users WHERE email = 'test_agent_01@example.com'),
    'approved'),

  (gen_random_uuid(),
    (SELECT id FROM lines WHERE name = 'test_line_02'),
    (SELECT id FROM expense_categories WHERE name = 'Fuel' LIMIT 1),
    600, NOW() - INTERVAL '6 days',
    'test_expense_03 - Fuel for collection rounds',
    'upi',
    (SELECT id FROM users WHERE email = 'test_agent_02@example.com'),
    'approved'),

  (gen_random_uuid(),
    (SELECT id FROM lines WHERE name = 'test_line_02'),
    (SELECT id FROM expense_categories WHERE name = 'Transportation' LIMIT 1),
    400, NOW() - INTERVAL '1 day',
    'test_expense_04 - Bus fare for remote collection',
    'cash',
    (SELECT id FROM users WHERE email = 'test_agent_02@example.com'),
    'approved');

-- Step 10: Create Test Commissions (2 total)
INSERT INTO commissions (id, agent_id, line_id, amount, period_start, period_end, status)
VALUES
  (gen_random_uuid(),
    (SELECT id FROM users WHERE email = 'test_agent_01@example.com'),
    (SELECT id FROM lines WHERE name = 'test_line_01'),
    2500, NOW() - INTERVAL '30 days', NOW(), 'paid'),

  (gen_random_uuid(),
    (SELECT id FROM users WHERE email = 'test_agent_02@example.com'),
    (SELECT id FROM lines WHERE name = 'test_line_02'),
    3500, NOW() - INTERVAL '30 days', NOW(), 'pending');

-- Step 11: Create Test Daily Accounts (2 total)
INSERT INTO daily_accounts (id, line_id, account_date, opening_balance, total_collections, total_expenses, total_qr_payments, closing_balance, net_balance, is_locked, created_by)
VALUES
  (gen_random_uuid(),
    (SELECT id FROM lines WHERE name = 'test_line_01'),
    NOW()::date,
    95000, 5000, 300, 0, 99700, 4700, false,
    (SELECT id FROM users WHERE email = 'roopesh@example.com' OR name = 'roopesh' LIMIT 1)),

  (gen_random_uuid(),
    (SELECT id FROM lines WHERE name = 'test_line_02'),
    NOW()::date,
    140000, 10000, 400, 0, 149600, 9600, false,
    (SELECT id FROM users WHERE email = 'roopesh@example.com' OR name = 'roopesh' LIMIT 1));

-- Verification Queries
SELECT 'Lines Created:' as info, COUNT(*) as count FROM lines WHERE name LIKE 'test_%';
SELECT 'Users/Agents Created:' as info, COUNT(*) as count FROM users WHERE email LIKE 'test_%';
SELECT 'Borrowers Created:' as info, COUNT(*) as count FROM borrowers WHERE name LIKE 'test_%';
SELECT 'Loans Created:' as info, COUNT(*) as count FROM loans WHERE borrower_id IN (SELECT id FROM borrowers WHERE name LIKE 'test_%');
SELECT 'Payments Created:' as info, COUNT(*) as count FROM payments WHERE notes LIKE 'test_%';
SELECT 'Expenses Created:' as info, COUNT(*) as count FROM expenses WHERE description LIKE 'test_%';
SELECT 'Commissions Created:' as info, COUNT(*) as count FROM commissions WHERE agent_id IN (SELECT id FROM users WHERE email LIKE 'test_%');
SELECT 'Daily Accounts Created:' as info, COUNT(*) as count FROM daily_accounts WHERE line_id IN (SELECT id FROM lines WHERE name LIKE 'test_%');
