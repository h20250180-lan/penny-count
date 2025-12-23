# Database Seed Instructions for Owner: Roopesh

This guide explains how to clear existing data and seed the database with test data.

## ⚠️ WARNING
This script will **DELETE ALL EXISTING DATA** in the database. Only use this in development/testing environments!

## Prerequisites

1. Ensure owner "roopesh" user exists in the database
2. Have access to Supabase SQL Editor or psql command line

## Option 1: Using Supabase Dashboard (Recommended)

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor** from the left sidebar
3. Click **New Query**
4. Copy the entire contents of `database_seed_script.sql`
5. Paste it into the query editor
6. Click **Run** button
7. Check the verification queries at the bottom to confirm data creation

## Option 2: Using psql Command Line

```bash
# Connect to your Supabase database
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run the seed script
\i database_seed_script.sql
```

## What Gets Created

### Test Data Structure

**2 Lines:**
- `test_line_01` - ₹100,000 capital, 2 borrowers
- `test_line_02` - ₹150,000 capital, 2 borrowers

**2 Agents:**
- `test_agent_01` - Assigned to test_line_01
- `test_agent_02` - Assigned to test_line_02

**4 Borrowers:**
- `test_borrower_01` & `test_borrower_02` (Line 01)
- `test_borrower_03` & `test_borrower_04` (Line 02)

**4 Loans:**
- 2 loans per line with varying amounts and payment progress

**8 Payments:**
- 2 payments per loan using different payment methods (cash, UPI, PhonePe)

**4 Expenses:**
- 2 expenses per agent for fuel, food, and transportation

**2 Commissions:**
- 1 per agent with different payment statuses

**2 Daily Accounts:**
- 1 per line for today's date

## Verification

After running the script, you should see output like:

```
Lines Created: 2
Users/Agents Created: 2
Borrowers Created: 4
Loans Created: 4
Payments Created: 8
Expenses Created: 4
Commissions Created: 2
Daily Accounts Created: 2
```

## Creating Test Agents via UI

The SQL script creates user records, but for full authentication:

1. Login as owner "roopesh"
2. Go to **Users & Agents** tab
3. Click **Add User**
4. Search for phone: `9876543210` (test_agent_01)
5. If found, click "Add to My Team"
6. If not found, create new user with OTP verification
7. Repeat for phone: `9876543211` (test_agent_02)

## Testing the Application

After seeding, test these features:

1. **Dashboard** - Should show metrics from test data
2. **Lines Management** - View test_line_01 and test_line_02
3. **Borrowers** - See all 4 test borrowers
4. **Loans** - View 4 active loans
5. **Collections** - See 8 payment records
6. **Expenses** - View 4 agent expenses
7. **Daily Monitoring** - Check today's accounts for both lines

## Cleanup Only (Without Seeding)

If you want to just clear data without creating test data:

```sql
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
```

## Notes

- Expense categories must exist before running (Food, Fuel, Transportation, etc.)
- The owner user must exist with email matching the filter
- All test data uses `test_` prefix for easy identification
- Dates are relative to current time using PostgreSQL intervals

## Troubleshooting

**Error: "Owner not found"**
- Ensure user with name 'roopesh' or email 'roopesh@example.com' exists in users table

**Error: "Category not found"**
- Run the expense categories creation first or adjust category names in the script

**Error: "Foreign key violation"**
- Ensure truncate cascade runs successfully before insert statements

## Support

For issues with the seed script, check:
1. Supabase logs in dashboard
2. PostgreSQL error messages
3. Foreign key constraints in schema
