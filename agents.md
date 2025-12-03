# Project Blueprint: StoryWeaver - AI Interactive Fiction Engine

## 1. Project Overview
**Goal**: Build "StoryWeaver," a dynamic, AI-powered interactive storytelling platform. It is a scalable engine where users can play through pre-defined stories or generate new narrative paths on the fly.
**Core Experience**: A retro-futuristic "console" aesthetic (scanlines, typewriter text) where users read atmospheric text and make choices that shape the story.

## 2. Tech Stack & Architecture
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Custom animations for typewriter, blink, scanlines)
- **Database**: Supabase (PostgreSQL)
- **AI Provider**: Google Gemini (Gemini 2.0 Flash Exp) via `@google/generative-ai`
- **Deployment**: Vercel (recommended)

## 3. Database Schema (Supabase)
Two core tables drive the engine:

### `stories`
- `id` (uuid, PK): Unique identifier.
- `title` (text): Display title.
- `slug` (text, unique): URL-friendly identifier (e.g., `rish-e`).
- `intro_text` (text): Text shown on the landing/intro card.
- `initial_prompt` (text): The core "system prompt" or context for the AI (e.g., "A sci-fi mystery where...").
- `created_at` (timestamp).

### `nodes`
- `id` (uuid, PK): Unique identifier.
- `story_id` (uuid, FK): Links to `stories`.
- `parent_id` (uuid, FK, nullable): Links to the previous node. Null for the root node.
- `content` (text): The narrative text displayed to the user.
- `summary_state` (text): **Critical**. A hidden summary of the story *so far* (inventory, plot points, world state). Passed to AI to maintain continuity.
- `choices` (jsonb): Array of objects: `[{ "text": "Option A", "next_node_id": "uuid" | null }]`.
    - If `next_node_id` is null, selecting this choice triggers AI generation.

## 4. Key Features & Implementation Logic

### 4.1. Landing Page (`/`)
- Displays the intro for the featured story ("Rish-e").
- **Crucial Logic**: Links to the story must use the **slug** and pass the initial choice as a query parameter to seamless start the game.
    - Example: `<Link href="/story/rish-e?choice=Initiate Test">`
- **Aesthetic**: Typewriter effect for intro text, "console" styling.

### 4.2. Story Routing (`/story/[storyId]/[nodeId]`)
- **Route Structure**: `/story/[slug]/[nodeId]` (Note: `storyId` param is actually the slug).
- **Page Logic**:
    1.  **Resolve Story**: Fetch story by `slug`. If not found -> 404.
    2.  **Resolve Node**:
        - If `nodeId` is missing (root route `/story/[slug]`): Fetch the root node (where `parent_id` is null) and redirect to `/story/[slug]/[rootNodeId]`.
        - **Important**: Preserve `searchParams` (like `?choice=...`) during this redirect.
        - If `nodeId` is present: Fetch the specific node.
    3.  **Render**: Pass node data to the client-side `StoryView` component.

### 4.3. The `StoryView` Component
- **Responsibilities**:
    - Display narrative text with a typewriter effect.
    - Show choices *after* text finishes typing.
    - Handle navigation:
        - **Existing Path**: If choice has a `next_node_id`, `router.push` to that node.
        - **New Path**: If `next_node_id` is null, call `/api/generate-node`.
    - **Auto-Choice**: Check `useSearchParams` for a `choice` param. If present, automatically trigger that choice logic (simulating a seamless transition from the landing page).

### 4.4. AI Generation Flow (`/api/generate-node`)
- **Input**: `storyId` (UUID), `parentNodeId`, `choiceText`.
- **Process**:
    1.  Fetch `parentNode` (for context and summary) and `story` (for initial prompt).
    2.  **Prompt Engineering**:
        - Role: "Dungeon Master".
        - Context: `story.initial_prompt` + `parentNode.summary_state`.
        - Action: User chose `choiceText`.
        - Output Requirement: JSON with `content` (next scene), `summary_state` (updated context), and `choices` (2 new options).
    3.  **Call AI**: Use Gemini Flash model with JSON mode.
    4.  **Persist**:
        - Insert new row into `nodes`.
        - **Update Parent**: Update the `choices` JSON in the `parentNode` to link the selected choice to the new `node.id`.
    5.  **Return**: New node ID.

## 5. Critical Learnings & "Gotchas"
1.  **Slugs vs. UUIDs**:
    - The URL should use the **slug** (`rish-e`) for SEO and readability.
    - The database relations use **UUIDs**.
    - **Fix**: Ensure `StoryView` receives the `slug` prop to construct URLs, even though it uses the `storyId` (UUID) for API calls.
2.  **Query Params & Redirects**:
    - When redirecting from `/story/[slug]` to `/story/[slug]/[rootId]`, you **must** forward `searchParams`. Otherwise, the "start from choice" feature breaks.
3.  **Linked List Integrity**:
    - When generating a new node, it is vital to *update the parent node's choice* to point to the new child. This turns a "dynamic" choice into a "static" one for future users (caching the path).

## 6. Prompt for Recreation
To recreate this project, provide an AI agent with this entire document. It contains the schema, architectural decisions, and specific logic fixes required to build a robust version of StoryWeaver from scratch.
