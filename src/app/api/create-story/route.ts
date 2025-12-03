import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { model, GENERATION_CONFIG } from "@/lib/gemini";

export async function POST(req: NextRequest) {
    console.log("--- CREATE STORY REQUEST STARTED ---");
    try {
        const { title, premise, characters } = await req.json();

        if (!title || !premise) {
            return NextResponse.json({ error: "Title and premise are required" }, { status: 400 });
        }

        // 1. Generate Slug
        const slugBase = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
        const uniqueSuffix = Math.random().toString(36).substring(2, 7);
        const slug = `${slugBase}-${uniqueSuffix}`;

        // 2. Insert Story
        const { data: story, error: storyError } = await supabase
            .from("stories")
            .insert({
                title,
                slug,
                initial_prompt: `Premise: ${premise}\nCharacters: ${characters || "None specified"}`,
            })
            .select()
            .single();

        if (storyError) {
            console.error("Story Insert Error:", storyError);
            throw storyError;
        }

        // 3. Generate Root Node with Gemini
        const prompt = `
      You are the Dungeon Master for an interactive text adventure.
      
      **Premise**: ${premise}
      **Characters**: ${characters || "The protagonist (you)"}
      
      **Task**:
      1. Write the OPENING SCENE (approx 50-75 words).
         - **Structure**: Follow the "Hero's Journey" - specifically "The Call to Adventure".
         - **Style**: Atmospheric, second-person ("You..."), immersive.
         - **VISUALS**: You can use tags to style text:
           - [glitch]text[/glitch] for corrupted data/static.
           - [shake]text[/shake] for loud noises or impacts.
           - [terminal]text[/terminal] for computer output.
           - [warning]text[/warning] for danger.
         - **CONSTRAINT**: DO NOT NEST TAGS. Use one effect at a time.
         - **Content**: Introduce the setting and the character's immediate situation. Something disrupts their ordinary world.
         - **Console**: If appropriate to the setting, mention a console/interface.
      
      2. Generate 2 distinct choices for the user's first action.
         - **CRITICAL**: Choices must be EXTREMELY SHORT (max 3-5 words).
         - **VARIETY**: Choices must lead to DIFFERENT paths.
         - Use imperative verbs. NO adjectives.
         - Example: "Open door", "Check signal", "Hide".

      **Output Format**:
      Return ONLY a JSON object with this structure:
      {
        "content": "The text of the opening scene...",
        "summary_state": "The story begins. [Brief summary of situation]",
        "choices": [
          { "text": "Option 1" },
          { "text": "Option 2" }
        ]
      }
    `;

        console.log("Calling Gemini for Root Node...");
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: GENERATION_CONFIG,
        });

        const response = result.response;
        const text = response.text();
        console.log("Gemini Raw Response:", text);

        const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
        let generatedData;
        try {
            generatedData = JSON.parse(jsonString);
        } catch (e) {
            console.error("JSON Parse Error:", e);
            throw new Error("Failed to parse AI response");
        }

        // 4. Insert Root Node
        const { data: rootNode, error: nodeError } = await supabase
            .from("nodes")
            .insert({
                story_id: story.id,
                parent_id: null, // Root node has no parent
                content: generatedData.content,
                summary_state: generatedData.summary_state,
                choices: generatedData.choices.map((c: any) => ({ ...c, next_node_id: null })),
            })
            .select()
            .single();

        if (nodeError) {
            console.error("Node Insert Error:", nodeError);
            throw nodeError;
        }

        return NextResponse.json({ slug: story.slug, storyId: story.id });

    } catch (error: any) {
        console.error("Create Story Error:", error);
        return NextResponse.json({
            error: error.message || "Internal Server Error",
            details: error
        }, { status: 500 });
    }
}
