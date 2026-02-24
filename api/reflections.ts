
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
            const result = await genAI.models.generateContent({
                model: "gemini-1.5-flash",
                contents: `Generate ${count || 3} profound Islamic spiritual reflection items. Output Format: JSON Array. Topic Mix: 1 Hadith, 1 Quran Verse, 1 Wonder of Allah. Schema: [{"type":"string","content":"string","summary":"string","details":"string","author":"string","praise":"string","tags":["string"],"readTime":"string"}]`,
                config: { responseMimeType: "application/json" }
            });
            const text = (result as any).text || (result as any).response?.text() || "";
            // Clean up JSON if Gemini wraps it in markdown blocks
            const cleanJson = text.replace(/```json|```/g, "");
            return res.status(200).json(JSON.parse(cleanJson));
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
