-- Migration: Add Hero's Journey tracking fields
-- Run this migration to add new fields to existing database

-- Add new columns to stories table
ALTER TABLE stories 
  ADD COLUMN IF NOT EXISTS plot_outline jsonb,
  ADD COLUMN IF NOT EXISTS journey_stages jsonb,
  ADD COLUMN IF NOT EXISTS target_pages integer DEFAULT 12,
  ADD COLUMN IF NOT EXISTS current_stage_index integer DEFAULT 0;

-- Add new columns to nodes table
ALTER TABLE nodes
  ADD COLUMN IF NOT EXISTS journey_stage text,
  ADD COLUMN IF NOT EXISTS page_number integer,
  ADD COLUMN IF NOT EXISTS choice_history jsonb;

-- Update existing stories to have default values
UPDATE stories 
SET 
  target_pages = 10,
  current_stage_index = 0
WHERE target_pages IS NULL OR current_stage_index IS NULL;

-- Optional: Set page numbers for existing nodes (sequential by creation time per story)
WITH numbered_nodes AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY story_id ORDER BY created_at) as page_num
  FROM nodes
)
UPDATE nodes
SET page_number = numbered_nodes.page_num
FROM numbered_nodes
WHERE nodes.id = numbered_nodes.id AND nodes.page_number IS NULL;
