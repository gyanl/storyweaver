# Quick Database Reset Guide

## Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project (storyweaver)
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"**

## Step 2: Copy and Run the Reset Script

1. Open the file: `migrations/000_reset_schema.sql`
2. Copy ALL the contents
3. Paste into the Supabase SQL Editor
4. Click **"Run"** (or press Cmd+Enter)

⚠️ **This will delete all existing stories and nodes!**

## Step 3: Verify the Changes

1. Click **"Table Editor"** in the left sidebar
2. Click on the **`stories`** table
3. You should see these NEW columns:
   - `plot_outline`
   - `journey_stages`
   - `target_pages`
   - `current_stage_index`

4. Click on the **`nodes`** table
5. You should see these NEW columns:
   - `journey_stage`
   - `page_number`
   - `choice_history`

## Step 4: Test It!

Run your app:
```bash
npm run dev
```

Then:
1. Go to http://localhost:3000
2. Click "Initialize New Protocol"
3. Create a new story
4. Watch the browser console - you should see plot outline generation!
5. Play through the story and verify choices don't repeat

---

## What the Reset Does

The `000_reset_schema.sql` file:
1. Drops the existing `nodes` and `stories` tables
2. Recreates them with all the new Hero's Journey fields
3. Adds indexes for performance

All your new stories will now have:
- ✅ Complete plot outlines
- ✅ Journey stage tracking
- ✅ Choice deduplication
- ✅ Guaranteed completion within 8-20 pages
