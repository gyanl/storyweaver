-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Stories Table
create table stories (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text unique not null,
  intro_text text, -- The text shown on the first screen (e.g. "Welcome, Rish-e...")
  initial_prompt text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Nodes Table
create table nodes (
  id uuid default uuid_generate_v4() primary key,
  story_id uuid references stories(id) on delete cascade not null,
  parent_id uuid references nodes(id),
  content text not null,
  summary_state text, -- The "hidden context" for the AI
  choices jsonb not null default '[]'::jsonb, -- Array of { text: string, next_node_id: uuid | null }
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes
create index idx_nodes_story_id on nodes(story_id);
create index idx_nodes_parent_id on nodes(parent_id);
