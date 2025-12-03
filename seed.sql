-- Insert the Rish-e Story
INSERT INTO stories (title, slug, initial_prompt)
VALUES (
  'Rish-e',
  'rish-e',
  'A sci-fi mystery where the protagonist wakes up in a strange digital/physical limbo with a system console.'
);

-- Insert the Root Node
-- We need the story_id, so we'll use a CTE or just assume the user handles it.
-- For this file, I'll use a placeholder or DO block.

DO $$
DECLARE
  story_id uuid;
  root_node_id uuid;
BEGIN
  SELECT id INTO story_id FROM stories WHERE slug = 'rish-e';

  INSERT INTO nodes (story_id, content, summary_state, choices)
  VALUES (
    story_id,
    'You open your eyes, blinking uncomfortably as you try to make sense of your surroundings. The ground is a muddy brown and a cloudless blue sky stretches all around you.\n\nWhere are you? You don''t know.\n\nA screen pops up in front of you.\n\nCONSOLE: This is a diagnostic test designed to evaluate system functions. Press ''Initiate Test'' when you are ready to begin.',
    'The protagonist has just awakened in a limbo state. A console has appeared offering a diagnostic test.',
    '[
      {"text": "Initiate Test", "next_node_id": null},
      {"text": "I''m Scared", "next_node_id": null}
    ]'::jsonb
  ) RETURNING id INTO root_node_id;
  
END $$;
