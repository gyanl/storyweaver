#!/bin/bash

# Script to reset Supabase database with new Hero's Journey schema
# This will DELETE ALL existing data!

echo "🚨 WARNING: This will DELETE ALL existing stories and nodes!"
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your Supabase credentials"
    exit 1
fi

# Load environment variables
source .env

# Check if required variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL not found in .env"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: SUPABASE_SERVICE_ROLE_KEY not found in .env"
    exit 1
fi

# Extract project ref from URL
PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed -n 's/.*https:\/\/\([^.]*\).*/\1/p')

echo "📊 Supabase Project: $PROJECT_REF"
echo ""

# Option 1: Use Supabase CLI (if linked)
echo "Option 1: Using Supabase Dashboard (Recommended)"
echo "==========================================="
echo "1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
echo "2. Copy the contents of: migrations/000_reset_schema.sql"
echo "3. Paste into the SQL editor"
echo "4. Click 'Run'"
echo ""

# Option 2: Direct database connection
echo "Option 2: Using psql (Advanced)"
echo "================================"
echo "If you have the database password, you can run:"
echo ""
echo "  psql 'postgresql://postgres:[YOUR-PASSWORD]@db.$PROJECT_REF.supabase.co:5432/postgres' -f migrations/000_reset_schema.sql"
echo ""

echo "✅ After running the migration, your database will have:"
echo "   - plot_outline field in stories table"
echo "   - journey_stages field in stories table"
echo "   - target_pages field in stories table"
echo "   - current_stage_index field in stories table"
echo "   - journey_stage field in nodes table"
echo "   - page_number field in nodes table"
echo "   - choice_history field in nodes table"
echo ""
echo "🎉 You can then test by running: npm run dev"
