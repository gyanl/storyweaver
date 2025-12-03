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

        // 2. Construct Prompt for Gemini
        // We want a JSON response containing: content, summary_state, choices
        const prompt = `
      You are the Dungeon Master for an interactive text adventure.
      
      **Story Context**: ${story.initial_prompt}
      **Current Situation**: ${parentNode.summary_state || "The story begins."}
      **Last Scene**: ${parentNode.content}
      **User Action**: The user chose "${choiceText}".

      **Task**:
      1. Write the next scene (approx 100-150 words). It should follow logically from the user's action. 
         - Style: Atmospheric, second-person ("You..."), slightly mysterious console/terminal vibe.
         - **IMPORTANT**: The user has access to a console. Encourage them to use it or describe how the console reacts to their presence.
      2. Update the "Current Situation" summary to reflect new developments.
      3. Generate 2 distinct, interesting choices for what the user can do next. 
         - **CRITICAL**: Choices must be EXTREMELY SHORT (max 3-5 words). Example: "Check logs", "Run diagnostics", "Look around".

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

        // 3. Call Gemini
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

        // 4. Save to DB
        console.log("Inserting new node...");
        const { data: newNode, error } = await supabase
            .from("nodes")
            .insert({
                story_id: storyId,
                parent_id: parentNodeId,
                content: generatedData.content,
                summary_state: generatedData.summary_state,
                choices: generatedData.choices.map((c: any) => ({ ...c, next_node_id: null })),
            })
            .select()
            .single();

        if (error) {
            console.error("DB Insert Error:", error);
            throw error;
        }
        console.log("New Node Created:", newNode.id);

        // 5. Update Parent Node to link to this new node for that choice
        // We need to find the choice index or object in the parent's choices array that matches choiceText
        // and update its next_node_id.
        // This is a bit tricky with JSONB in SQL, but we can do it in JS and update.

        const updatedChoices = parentNode.choices.map((c: any) => {
            if (c.text === choiceText) {
                return { ...c, next_node_id: newNode.id };
            }
            return c;
        });

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
