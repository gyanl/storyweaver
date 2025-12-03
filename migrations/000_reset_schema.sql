-- Drop existing tables and recreate with new schema
-- WARNING: This will delete ALL existing data

-- Drop tables in correct order (nodes first due to foreign key)
DROP TABLE IF EXISTS nodes CASCADE;
DROP TABLE IF EXISTS stories CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Stories Table with Hero's Journey fields
CREATE TABLE stories (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  intro_text text,
  initial_prompt text NOT NULL,
  plot_outline jsonb,
  journey_stages jsonb,
  target_pages integer DEFAULT 10,
  current_stage_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Nodes Table with journey tracking
CREATE TABLE nodes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  story_id uuid REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  parent_id uuid REFERENCES nodes(id),
  content text NOT NULL,
  summary_state text,
  choices jsonb NOT NULL DEFAULT '[]'::jsonb,
  journey_stage text,
  page_number integer,
  choice_history jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX idx_nodes_story_id ON nodes(story_id);
CREATE INDEX idx_nodes_parent_id ON nodes(parent_id);
