import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { model, GENERATION_CONFIG } from "@/lib/gemini";

export async function POST(req: NextRequest) {
    console.log("--- CREATE STORY REQUEST STARTED ---");
    try {
        const { description } = await req.json();

        if (!description) {
            return NextResponse.json({ error: "Description is required" }, { status: 400 });
        }

        // 1. Parse and enhance the description to extract/generate story elements
        const parsePrompt = `
      You are a creative story consultant. The user has provided this description for a story:
      
      "${description}"
      
      **Task**: Extract or generate the following elements to create a rich, compelling story:
      
      1. **Title**: A catchy, evocative title (if not provided, create one)
      2. **Premise**: A clear 2-3 sentence premise/setup (enhance what they provided)
      3. **Characters**: Generate AT LEAST 3 distinct characters with names, roles, and brief descriptions:
         - The protagonist (the "you" character)
         - At least 2 supporting characters (allies, mentors, antagonists, etc.)
         - Make them diverse and interesting
      
      **IMPORTANT**: Fill in ANY gaps. If the user's description is vague, be creative and add details.
      Make it a great story regardless of how much detail they provided.
      
      **Output Format**: Return ONLY a JSON object:
      {
        "title": "The story title",
        "premise": "Enhanced 2-3 sentence premise",
        "characters": [
          {
            "name": "Character Name",
            "role": "protagonist/ally/antagonist/mentor/etc",
            "description": "Brief description of who they are and their motivation"
          },
          // ... at least 3 characters total
        ]
      }
    `;

        console.log("Parsing story description...");
        const parseResult = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: parsePrompt }] }],
            generationConfig: GENERATION_CONFIG,
        });

        const parseResponse = parseResult.response.text();
        console.log("Parse Response:", parseResponse);

        const parseJsonString = parseResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        let storyElements;
        try {
            storyElements = JSON.parse(parseJsonString);
        } catch (e) {
            console.error("Parse JSON Error:", e);
            throw new Error("Failed to parse story description");
        }

        const title = storyElements.title;
        const premise = storyElements.premise;
        const characters = storyElements.characters.map((c: any) =>
            `${c.name} (${c.role}): ${c.description}`
        ).join("\n");

        // 2. Generate Slug
        const slugBase = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
        const uniqueSuffix = Math.random().toString(36).substring(2, 7);
        const slug = `${slugBase}-${uniqueSuffix}`;

        // 2. Generate Plot Outline with Gemini
        const plotOutlinePrompt = `
      You are creating a complete story outline for an interactive text adventure based on the Hero's Journey.
      
      **Premise**: ${premise}
      **Characters**: ${characters || "The protagonist (you)"}
      
      **Task**: Generate a complete Hero's Journey plot outline with 12 stages. 
      
      **IMPORTANT**: The story should complete in approximately 10 PAGES (each user choice = 1 page).
      This means the entire journey from start to resolution happens across ~10 decision points.
      Keep the pacing tight - each stage might only span 1-2 pages.
      
      **Hero's Journey Stages**:
      1. Ordinary World - Hero's normal life
      2. Call to Adventure - The inciting incident
      3. Refusal of the Call - Initial hesitation
      4. Meeting the Mentor - Guidance received
      5. Crossing the Threshold - Commitment to adventure
      6. Tests, Allies, Enemies - Challenges and relationships
      7. Approach to the Inmost Cave - Nearing the crisis
      8. Ordeal - The central life-or-death challenge
      9. Reward - Victory and its spoils
      10. The Road Back - Beginning the return
      11. Resurrection - Final test with everything at stake
      12. Return with the Elixir - Resolution and transformation
      
      **Output Format**: Return ONLY a JSON object with this structure:
      {
        "plotOutline": {
          "storyArc": "Brief description of the overall narrative arc",
          "characterArc": "How the protagonist changes from beginning to end",
          "stages": [
            {
              "stageNumber": 1,
              "name": "Ordinary World",
              "keyBeat": "Specific event/revelation for this stage in THIS story",
              "emotionalTone": "The mood/feeling of this stage"
            },
            // ... all 12 stages
          ],
          "resolution": "How the story concludes and what the hero gains",
          "branchingPoints": ["Key moments where user choices affect details but not core arc"]
        },
        "targetPages": 10
      }
      
      Make the plot outline specific to the premise. Each stage should have a concrete event, not generic descriptions.
      Remember: 10 pages total means a fast-paced, focused story.
    `;

        console.log("Calling Gemini for Plot Outline...");
        const plotResult = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: plotOutlinePrompt }] }],
            generationConfig: GENERATION_CONFIG,
        });

        const plotResponse = plotResult.response.text();
        console.log("Plot Outline Raw Response:", plotResponse);

        const plotJsonString = plotResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        let plotData;
        try {
            plotData = JSON.parse(plotJsonString);
        } catch (e) {
            console.error("Plot JSON Parse Error:", e);
            throw new Error("Failed to parse plot outline");
        }

        // 3. Insert Story with Plot Outline
        const { data: story, error: storyError } = await supabase
            .from("stories")
            .insert({
                title,
                slug,
                initial_prompt: `Premise: ${premise}\nCharacters: ${characters || "None specified"}`,
                plot_outline: plotData.plotOutline,
                journey_stages: plotData.plotOutline.stages,
                target_pages: plotData.targetPages || 10,
                current_stage_index: 0,
            })
            .select()
            .single();

        if (storyError) {
            console.error("Story Insert Error:", storyError);
            throw storyError;
        }

        // 4. Generate Opening Scene
        const openingPrompt = `
      You are the Dungeon Master for an interactive text adventure.
      
      **Story Outline**: ${JSON.stringify(plotData.plotOutline)}
      **Current Stage**: Stage 1-2 (Ordinary World → Call to Adventure)
      **Key Beats to Cover**: 
      - ${plotData.plotOutline.stages[0].keyBeat}
      - ${plotData.plotOutline.stages[1].keyBeat}
      
      **Task**:
      1. Write the OPENING SCENE (approx 50-75 words).
         - **Structure**: Introduce the ordinary world, then present the call to adventure
         - **Style**: Atmospheric, second-person ("You..."), immersive
         - **VISUALS**: You can use tags to style text:
           - [glitch]text[/glitch] for corrupted data/static
           - [shake]text[/shake] for loud noises or impacts
           - [terminal]text[/terminal] for computer output
           - [warning]text[/warning] for danger
         - **CONSTRAINT**: DO NOT NEST TAGS. Use one effect at a time
         - **Content**: Set up the situation and introduce the disruption
      
      2. Generate 2 distinct choices for the user's first action.
         - **CRITICAL**: Choices must be EXTREMELY SHORT (max 3-5 words)
         - **VARIETY**: Choices must lead to DIFFERENT paths
         - Use imperative verbs. NO adjectives
         - Example: "Open door", "Check signal", "Hide"

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

        console.log("Calling Gemini for Opening Scene...");
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: openingPrompt }] }],
            generationConfig: GENERATION_CONFIG,
        });

        const response = result.response;
        const text = response.text();
        console.log("Gemini Opening Scene Response:", text);

        const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
        let generatedData;
        try {
            generatedData = JSON.parse(jsonString);
        } catch (e) {
            console.error("JSON Parse Error:", e);
            throw new Error("Failed to parse AI response");
        }

        // 5. Insert Root Node
        const { data: rootNode, error: nodeError } = await supabase
            .from("nodes")
            .insert({
                story_id: story.id,
                parent_id: null, // Root node has no parent
                content: generatedData.content,
                summary_state: generatedData.summary_state,
                choices: generatedData.choices.map((c: any) => ({ ...c, next_node_id: null })),
                journey_stage: plotData.plotOutline.stages[0].name,
                page_number: 1,
                choice_history: [],
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
