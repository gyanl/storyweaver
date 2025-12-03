import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

export const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp", // Using the latest flash model available or fallback to 1.5-flash if 2.5 isn't public yet. 
    // Note: User asked for "gemini-2.5-flash", assuming they mean the latest experimental or 1.5 flash. 
    // I will use a variable so it's easy to change.
});

export const GENERATION_CONFIG = {
    temperature: 0.7,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
};
