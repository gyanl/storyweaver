# Updating Supabase Database Schema

You have two options for updating your Supabase database with the new Hero's Journey fields:

## Option 1: Using Supabase SQL Editor (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Migration Script**
   - Copy the contents of `migrations/001_add_hero_journey.sql`
   - Paste into the SQL editor
   - Click "Run" or press Cmd+Enter

4. **Verify the Changes**
   - Go to "Table Editor" in the left sidebar
   - Click on the `stories` table
   - You should see the new columns: `plot_outline`, `journey_stages`, `target_pages`, `current_stage_index`
   - Click on the `nodes` table
   - You should see the new columns: `journey_stage`, `page_number`, `choice_history`

## Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Login to Supabase
supabase login

# Link to your project (if not already linked)
supabase link --project-ref your-project-ref

# Run the migration
supabase db push

# Or apply the migration file directly
psql $DATABASE_URL -f migrations/001_add_hero_journey.sql
```

## Option 3: Recreate Tables (If Starting Fresh)

If you want to start completely fresh (WARNING: This will delete all existing data):

1. Go to SQL Editor in Supabase Dashboard
2. Drop existing tables:
   ```sql
   DROP TABLE IF EXISTS nodes CASCADE;
   DROP TABLE IF EXISTS stories CASCADE;
   ```
3. Run the entire `schema.sql` file to recreate tables with new fields

## Verifying the Migration

After running the migration, test it by:

1. **Check table structure:**
   ```sql
   -- Check stories table
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'stories';

   -- Check nodes table
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'nodes';
   ```

2. **Test with a new story:**
   - Run your app: `npm run dev`
   - Create a new story via the UI
   - Check the database to see if `plot_outline` and `journey_stages` are populated

## What the Migration Does

The migration adds these fields:

**To `stories` table:**
- `plot_outline` (jsonb) - Stores the complete Hero's Journey plot outline
- `journey_stages` (jsonb) - Array of 12 journey stages with key beats
- `target_pages` (integer) - Target story length (default: 12)
- `current_stage_index` (integer) - Current journey stage (0-11)

**To `nodes` table:**
- `journey_stage` (text) - Which Hero's Journey stage this page represents
- `page_number` (integer) - Sequential page number
- `choice_history` (jsonb) - Last 3 pages of choices to prevent loops

All fields are nullable, so existing data won't break!
