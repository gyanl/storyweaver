# Implementation Plan: Generalizing Rish-e with Next.js & AI

## 1. Project Overview
Transform the static "Rish-e" site into a dynamic, AI-powered interactive storytelling platform using Next.js. The system will allow users to play through pre-defined stories or generate new paths on the fly.

## 2. Architecture & Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS (to replicate and extend the existing terminal/console aesthetic)
- **Database**: PostgreSQL (via Supabase or similar) to store the story tree, nodes, and user sessions.
- **AI Provider**: OpenAI API (GPT-4o) or Anthropic (Claude 3.5 Sonnet) for high-quality narrative generation.
- **State Management**: React Server Components + Client Hooks.

## 3. Core Concepts

### 3.1. The "Overarching Story Structure" (Hidden Context)
To maintain consistency, we will maintain a hidden state object that is passed to the AI but never shown to the user. This includes:
- **World State**: Current location, time, atmosphere.
- **Plot Arc**: Current tension level, active mysteries, long-term goals.
- **Character State**: Inventory, health, knowledge.
- **Immediate Possibilities**: Hidden notes on what *could* happen next, used to generate the options.

### 3.2. The Node System
The story is a graph of nodes.
- **Existing Nodes**: If a user picks an option that another user has already explored, we load it from the DB instantly.
- **New Nodes**: If a user picks an option (or writes a custom prompt) that hasn't been generated, we call the AI.

## 4. AI "Agents" Workflow
We will define specific prompts/roles for the generation process:

1.  **The Dungeon Master (Generator)**
    - **Input**: Previous Node Content, Overarching Story Summary, User Choice (or Custom Prompt).
    - **Task**: Write the next segment of the story (approx. 100-200 words) in the specific style (e.g., "Rish-e" console style).
    - **Output**: New Story Text.

2.  **The Scribe (Summarizer)**
    - **Input**: Old Summary, New Story Text.
    - **Task**: Update the "Overarching Story Structure". Remove obsolete details, add new plot points.
    - **Output**: Updated Summary.

3.  **The Oracle (Option Generator)**
    - **Input**: New Story Text, Updated Summary.
    - **Task**: Generate 2 distinct, compelling choices for the user to take next.
    - **Output**: Option A, Option B.

## 5. Implementation Steps

### Phase 1: Setup & Migration
1.  Initialize a new Next.js project.
2.  Port `style.css` to global CSS or Tailwind components.
3.  Recreate the "Typewriter" effect as a reusable React component (`<Typewriter text="..." />`).
4.  Create the basic layout (Console wrapper, scanlines, CRT effects).

### Phase 2: Database & Schema
1.  Define `Stories` table (id, title, initial_prompt).
2.  Define `Nodes` table (id, story_id, parent_id, content, summary_state, choices_json).
3.  Seed the DB with the original "Rish-e" story as the first "Story".

### Phase 3: The Game Engine
1.  **Story View**: Dynamic route `/story/[storyId]/[nodeId]`.
2.  **Navigation**: Clicking an option fetches the next node ID.
    - If `next_node_id` exists -> Router.push.
    - If `next_node_id` is null -> Trigger Generation API.

### Phase 4: AI Integration
1.  Create API route `/api/generate-node`.
2.  Implement the 3-step AI workflow (Generate Content -> Update Summary -> Generate Options).
3.  Handle "Custom Prompt" (Credit check -> Pass custom prompt as User Choice).

### Phase 5: Landing Page & Polish
1.  Create a "Story Picker" landing page.
2.  Implement "Credits" mock system (local storage or simple DB field).
3.  Add loading states (e.g., "System Processing...", "Computing Outcomes...").

## 6. Future Considerations
- User Accounts & Auth.
- Persistent Inventory System.
- Image Generation for each scene.
