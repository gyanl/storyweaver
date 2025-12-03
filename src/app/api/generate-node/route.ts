import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { model, GENERATION_CONFIG } from "@/lib/gemini";

export async function POST(req: NextRequest) {
    try {
        const { storyId, parentNodeId, choiceText } = await req.json();

        // 1. Fetch Context
        const { data: parentNode } = await supabase
            .from("nodes")
            .select("*")
            .eq("id", parentNodeId)
            .single();

        if (!parentNode) {
            return NextResponse.json({ error: "Parent node not found" }, { status: 404 });
        }

        const { data: story } = await supabase
            .from("stories")
            .select("*")
            .eq("id", storyId)
            .single();

        // 2. Construct Prompt for Gemini
        // We want a JSON response containing: content, summary_state, choices
        const prompt = `
      You are the Dungeon Master for an interactive text adventure.
      
      **Story Context**: ${story.initial_prompt}
      **Current Situation**: ${parentNode.summary_state || "The story begins."}
      **Last Scene**: ${parentNode.content}
      **User Action**: The user chose "${choiceText}".

      **Task**:
      1. Write the next scene (approx 100-150 words). It should follow logically from the user's action. Style: Atmospheric, second-person ("You..."), slightly mysterious console/terminal vibe if appropriate.
      2. Update the "Current Situation" summary to reflect new developments.
      3. Generate 2 distinct, interesting choices for what the user can do next.

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
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: GENERATION_CONFIG,
        });

        const response = result.response;
        const text = response.text();

        // Parse JSON (Gemini might wrap in markdown code blocks)
        const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const generatedData = JSON.parse(jsonString);

        // 4. Save to DB
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

        if (error) throw error;

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

        await supabase
            .from("nodes")
            .update({ choices: updatedChoices })
            .eq("id", parentNodeId);

        return NextResponse.json({ newNodeId: newNode.id });

    } catch (error) {
        console.error("Generation error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
