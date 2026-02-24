
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
    // 1. Check for API Key (On Vercel, this is a secret, NOT VITE_ prefixed)
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: "Gemini API Key not configured on server." });
    }

    // 2. Handle different actions (stream, deep-dive, etc.)
    const { action, count, item } = req.body || {};

    try {
        const genAI = new GoogleGenAI({ apiKey });

        if (action === 'stream') {
            const prompt = `Generate ${count || 3} profound Islamic spiritual reflection items. 
Focus: Sahih Muslim, Sahih Bukhari, other sahih hadith, verses, and reflective quotes from companions of the Prophet ﷺ or Rumi (ensure quotes strictly avoid shirk, shia, or extreme sufi concepts that cross the line). 
Target Audience: Today's everyday person of all genders. Make it highly reflective and applicable to modern struggles.
Output Format: JSON Array.
Schema: [{"type":"string","content":"string","summary":"string","details":"string","author":"string","praise":"string","tags":["string"],"readTime":"string"}]
Strictly output ONLY valid JSON without any markdown formatting like \`\`\`json.`;

            const result = await genAI.models.generateContent({
                model: "gemini-1.5-flash",
                contents: prompt,
                config: { responseMimeType: "application/json" }
            });
            const text = (result as any).text || (result as any).response?.text() || "";
            // Clean up JSON if Gemini wraps it in markdown blocks
            const cleanJson = text.replace(/```json|```/g, "").trim();
            try {
                const parsed = JSON.parse(cleanJson);
                return res.status(200).json(parsed);
            } catch (e) {
                console.error("JSON Parse Error:", cleanJson);
                return res.status(500).json({ error: "Failed to parse AI response" });
            }
        }

        if (action === 'deep-dive') {
            const result = await genAI.models.generateContent({
                model: "gemini-1.5-pro",
                contents: `Write a profound, soul-shaking Islamic spiritual essay based on: "${item.content}". Context: ${item.summary}. 500-800 words. Plain text paragraphs.`
            });
            const text = (result as any).text || (result as any).response?.text() || "";
            return res.status(200).json({ text });
        }

        return res.status(400).json({ error: "Invalid action" });

    } catch (error: any) {
        console.error("API Error:", error);
        return res.status(500).json({ error: error.message });
    }
}
