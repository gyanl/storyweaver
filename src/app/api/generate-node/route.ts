import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { model, GENERATION_CONFIG } from "@/lib/gemini";

export async function POST(req: NextRequest) {
    console.log("--- GENERATE NODE REQUEST STARTED ---");
    try {
        const body = await req.json();
        const { storyId, parentNodeId, choiceText } = body;
        console.log("Request params:", { storyId, parentNodeId, choiceText });

        // 1. Fetch Context
        const { data: parentNode, error: parentError } = await supabase
            .from("nodes")
            .select("*")
            .eq("id", parentNodeId)
            .single();

        if (parentError || !parentNode) {
            console.error("Parent node error:", parentError);
            return NextResponse.json({ error: "Parent node not found" }, { status: 404 });
        }

        const { data: story, error: storyError } = await supabase
            .from("stories")
            .select("*")
            .eq("id", storyId)
            .single();

        if (storyError || !story) {
            console.error("Story error:", storyError);
            return NextResponse.json({ error: "Story not found" }, { status: 404 });
        }

        // 2. Calculate Journey Progress
        const { data: nodePath, error: pathError } = await supabase
            .from("nodes")
            .select("*")
            .eq("story_id", storyId)
            .order("created_at", { ascending: true });

        if (pathError) {
            console.error("Path fetch error:", pathError);
        }

        const currentPageNumber = (parentNode.page_number || 0) + 1;
        const targetPages = story.target_pages || 10;
        const progress = currentPageNumber / targetPages;
        const stageIndex = Math.min(Math.floor(progress * 12), 11);

        const journeyStages = story.journey_stages || [];
        const currentStage = journeyStages[stageIndex];
        const nextStage = journeyStages[Math.min(stageIndex + 1, 11)];
        const isNearingEnd = currentPageNumber >= targetPages * 0.8;
        const shouldConclude = currentPageNumber >= targetPages;

        // 3. Build Choice History (last 3 pages)
        const recentNodes = (nodePath || []).slice(-3);
        const choiceHistory = recentNodes.map((node: any) => {
            const presented = node.choices?.map((c: any) => c.text) || [];
            return {
                page: node.page_number,
                presented,
            };
        });

        const allPreviousChoices = choiceHistory.flatMap((h: any) => h.presented);
        const choiceHistoryText = choiceHistory
            .map((h: any) => `Page ${h.page}: [${h.presented.join(" / ")}]`)
            .join("\n");

        // Check if this is a custom user choice (not in the presented options)
        const isCustomChoice = parentNode.choices &&
            !parentNode.choices.some((c: any) => c.text === choiceText);

        // 4. Construct Enhanced Prompt
        const prompt = `
      You are the Dungeon Master for an interactive text adventure following the Hero's Journey.
      
      **Story Outline**: ${JSON.stringify(story.plot_outline)}
      **Story Context**: ${story.initial_prompt}
      **Current Situation**: ${parentNode.summary_state || "The story begins."}
      **Last Scene**: ${parentNode.content}
      **User Action**: The user chose "${choiceText}".
      ${isCustomChoice ? `\n**IMPORTANT**: This is a CUSTOM user choice (not a suggested option). Handle it creatively but:\n- If it's reasonable, allow a brief side quest (1 page max)\n- Then guide back to the main story arc\n- If it's absurd/impossible, acknowledge it humorously and redirect to the plot\n- Keep the story moving forward toward the current stage's key beat` : ""}
      
      **Journey Progress**:
      - Page ${currentPageNumber} of ${targetPages} (Each choice = 1 page)
      - Current Stage: ${currentStage?.name || "Unknown"} - ${currentStage?.keyBeat || ""}
      - Next Stage: ${nextStage?.name || "Conclusion"}
      ${isNearingEnd ? "- **IMPORTANT**: Story is nearing its end. Begin wrapping up plot threads." : ""}
      ${shouldConclude ? "- **CRITICAL**: Story should CONCLUDE on this page. Provide resolution." : ""}

      **Recent Choice History** (DO NOT repeat these options):
${choiceHistoryText}

      **Task**:
      1. Write the next scene (approx 50-75 words).
         - **PROGRESSION**: Move toward the current stage's key beat: "${currentStage?.keyBeat}"
         ${isCustomChoice ? "- **CUSTOM CHOICE**: Acknowledge the user's creative choice, but keep it brief and return to main plot" : ""}
         - **ACTION**: The story MUST move forward. Something significant must happen.
         - **DIALOGUE**: Include character dialogue! Use quotation marks for speech. Characters should talk to each other or to the protagonist.
         - **INTERACTION**: Show characters interacting, not just describing what happens.
         - **Style**: Atmospheric, second-person ("You..."), immersive
         - **VISUALS**: You can use tags to style text:
           - [glitch]text[/glitch] for corrupted data/static
           - [shake]text[/shake] for loud noises or impacts
           - [terminal]text[/terminal] for computer output
           - [warning]text[/warning] for danger
         - **CONSTRAINT**: DO NOT NEST TAGS. Use one effect at a time
         - **Example with dialogue**: You approach the console. "Wait," Marcus says, his voice tense. "The system's been compromised." He points at the flickering screen.
      
      2. Update the "Current Situation" summary to reflect new developments.
      
      3. Generate 2 distinct, interesting choices for what the user can do next.
         - **CRITICAL**: Choices must be EXTREMELY SHORT (max 3-5 words)
         - **VARIETY**: Choices must lead to DIFFERENT outcomes
         - **NO REPEATS**: Do NOT offer any of these previously presented options: ${allPreviousChoices.join(", ")}
         - Use imperative verbs (e.g., "Run", "Check", "Go")
         - NO adjectives. NO flowery language
         - Example: "Check logs", "Run diagnostics", "Look around"
         ${isCustomChoice ? "- **REDIRECT**: If the custom choice was a side quest, offer options that return to the main plot" : ""}
         ${shouldConclude ? "- **ENDING**: If story concludes, offer choices like 'Reflect' or 'Continue journey'" : ""}

      **Output Format**:
      Return ONLY a JSON object with this structure:
      {
        "content": "The text of the new scene...",
        "summary_state": "The updated summary...",
        "choices": [
          { "text": "Option 1" },
          { "text": "Option 2" }
        ]
      }
    `;

        // 5. Call Gemini
        console.log("Calling Gemini...");
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: GENERATION_CONFIG,
        });

        const response = result.response;
        const text = response.text();
        console.log("Gemini Raw Response:", text);

        // Parse JSON (Gemini might wrap in markdown code blocks)
        const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
        let generatedData;
        try {
            generatedData = JSON.parse(jsonString);
        } catch (e) {
            console.error("JSON Parse Error:", e, "String:", jsonString);
            return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
        }

        // 6. Save to DB with Journey Tracking
        console.log("Inserting new node...");

        // Build choice history for this new node
        const newChoiceHistory = [
            ...choiceHistory.slice(-2), // Keep last 2
            {
                page: parentNode.page_number,
                presented: parentNode.choices?.map((c: any) => c.text) || [],
                selected: choiceText,
            }
        ];

        const { data: newNode, error } = await supabase
            .from("nodes")
            .insert({
                story_id: storyId,
                parent_id: parentNodeId,
                content: generatedData.content,
                summary_state: generatedData.summary_state,
                choices: generatedData.choices.map((c: any) => ({ ...c, next_node_id: null })),
                journey_stage: currentStage?.name,
                page_number: currentPageNumber,
                choice_history: newChoiceHistory,
            })
            .select()
            .single();

        if (error) {
            console.error("DB Insert Error:", error);
            throw error;
        }
        console.log("New Node Created:", newNode.id);

        // 7. Update Parent Node to link to this new node for that choice
        // If this was a custom choice (not in the original list), add it to the choices
        const updatedChoices = parentNode.choices.map((c: any) => {
            if (c.text === choiceText) {
                return { ...c, next_node_id: newNode.id };
            }
            return c;
        });

        // If the choice wasn't found (custom choice), add it
        const choiceExists = parentNode.choices.some((c: any) => c.text === choiceText);
        if (!choiceExists) {
            updatedChoices.push({
                text: choiceText,
                next_node_id: newNode.id,
            });
        }

        const { error: updateError } = await supabase
            .from("nodes")
            .update({ choices: updatedChoices })
            .eq("id", parentNodeId);

        if (updateError) {
            console.error("Parent Update Error:", updateError);
        }

        return NextResponse.json({ newNodeId: newNode.id });

    } catch (error: any) {
        console.error("Generation error:", error);
        return NextResponse.json({
            error: error.message || "Internal Server Error",
            details: error
        }, { status: 500 });
    }
}
