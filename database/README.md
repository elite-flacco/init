# Database Setup for User Accounts

This directory contains the database migration files needed to set up user accounts functionality.

## Prerequisites

- Supabase project set up with the following environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

## Migration Files

### `migrations/001_user_auth_setup.sql`

This migration sets up the complete user accounts system including:

**New Tables:**

- `user_travel_plans` - Stores user's saved travel plans
- `user_saved_destinations` - Stores user's bookmarked destinations

**Table Modifications:**

- Adds optional `user_id` column to existing `shared_plans` table

**Security:**

- Enables Row Level Security (RLS) on all tables
- Creates policies ensuring users can only access their own data
- Maintains public access to shared plans

**Indexes:**

- Performance indexes on user_id columns
- Timestamp indexes for efficient sorting
- Favorite plans index for quick access

## How to Apply Migrations

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `migrations/001_user_auth_setup.sql`
4. Click "Run" to execute the migration

### Option 2: Supabase CLI

1. Install the Supabase CLI if you haven't already
2. Run the migration:
   ```bash
   supabase db push
   ```

### Option 3: psql (Direct Database Access)

If you have direct database access:

```bash
psql "postgresql://postgres:[password]@[host]:[port]/postgres" -f migrations/001_user_auth_setup.sql
```

## Verification

After running the migration, verify the setup by checking:

1. **Tables exist:**

   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN ('user_travel_plans', 'user_saved_destinations');
   ```

2. **RLS is enabled:**

   ```sql
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public'
   AND tablename IN ('user_travel_plans', 'user_saved_destinations', 'shared_plans');
   ```

3. **Policies are created:**
   ```sql
   SELECT schemaname, tablename, policyname
   FROM pg_policies
   WHERE tablename IN ('user_travel_plans', 'user_saved_destinations', 'shared_plans');
   ```

## Database Schema

### user_travel_plans

| Column        | Type        | Description               |
| ------------- | ----------- | ------------------------- |
| id            | UUID        | Primary key               |
| user_id       | UUID        | Foreign key to auth.users |
| name          | TEXT        | User-defined plan name    |
| destination   | JSONB       | Destination information   |
| traveler_type | JSONB       | Traveler personality type |
| ai_response   | JSONB       | Complete AI travel plan   |
| tags          | TEXT[]      | User-defined tags         |
| is_favorite   | BOOLEAN     | Favorite flag             |
| created_at    | TIMESTAMPTZ | Creation timestamp        |
| updated_at    | TIMESTAMPTZ | Last update timestamp     |

### user_saved_destinations

| Column      | Type        | Description                  |
| ----------- | ----------- | ---------------------------- |
| id          | UUID        | Primary key                  |
| user_id     | UUID        | Foreign key to auth.users    |
| destination | JSONB       | Destination information      |
| notes       | TEXT        | User notes about destination |
| created_at  | TIMESTAMPTZ | Creation timestamp           |
| updated_at  | TIMESTAMPTZ | Last update timestamp        |

## Security Model

The database uses Row Level Security (RLS) to ensure data privacy:

- Users can only access their own travel plans and destinations
- Shared plans remain publicly accessible for sharing functionality
- Service role bypasses RLS for admin operations
- All user operations require authentication

## Backup Considerations

Before applying migrations to production:

1. **Backup your database:**

   ```bash
   supabase db dump --file backup_before_user_accounts.sql
   ```

2. **Test on a staging environment first**

3. **Monitor the migration for any errors**

## Rollback Plan

If you need to rollback this migration:

```sql
-- Remove new tables
DROP TABLE IF EXISTS user_saved_destinations;
DROP TABLE IF EXISTS user_travel_plans;

-- Remove user_id column from shared_plans
ALTER TABLE shared_plans DROP COLUMN IF EXISTS user_id;

-- Remove policies (they'll be auto-removed with table drops)
-- Remove functions
DROP FUNCTION IF EXISTS update_updated_at_column();
```

## Support

If you encounter issues with the migration:

1. Check the Supabase logs in your dashboard
2. Verify your environment variables are correct
3. Ensure you have the correct database permissions
4. Check that Supabase Auth is properly configured
