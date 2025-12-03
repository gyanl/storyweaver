import { NextResponse } from "next/server";
import { model, GENERATION_CONFIG } from "@/lib/gemini";

export async function POST() {
    try {
        const prompt = `
      Generate a creative and intriguing setup for a choose your own adventure text story.
      
      **Output Format**:
      Return ONLY a JSON object with these fields:
      - title: A cool, short title (e.g., "Project Chimera", "The Void Signal").
      - premise: A 1-2 sentence hook describing the initial situation (e.g., "You wake up in a cryopod...").
      - characters: A brief description of the protagonist (e.g., "Commander Shepard: A veteran soldier...").
      
      Make it unique and atmospheric.
    `;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: GENERATION_CONFIG,
        });

        const response = result.response;
        const text = response.text();
        const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const data = JSON.parse(jsonString);

        return NextResponse.json(data);

    } catch (error: any) {
        console.error("Generate Params Error:", error);
        return NextResponse.json({
            error: error.message || "Internal Server Error"
        }, { status: 500 });
    }
}
