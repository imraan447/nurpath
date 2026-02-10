import { GoogleGenAI, Type } from "@google/genai";
import { ReflectionItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateReflections(count: number = 3): Promise<ReflectionItem[]> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate ${count} profound Islamic spiritual reflection topics.
      
      Requirements:
      1. 'content' should be a short, powerful hook/title.
      2. 'summary' should be a 2-3 sentence teaser.
      3. 'mediaUrl' should be a keyword for an image background (e.g. 'galaxy', 'lion', 'desert').
      4. 'praise' must be: Subhanallah, Alhamdulillah, Allahu Akbar, or MashaAllah.
      
      Types: 'verse' (Quran), 'hadith', 'nature' (Scientific miracle), 'animal', 'question' (Introspection).
      
      Return JSON ONLY.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              content: { type: Type.STRING },
              summary: { type: Type.STRING },
              source: { type: Type.STRING },
              praise: { type: Type.STRING },
              mediaUrl: { type: Type.STRING }
            },
            required: ['type', 'content', 'summary', 'praise', 'mediaUrl']
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const results = JSON.parse(text);
    return results.map((item: any) => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      mediaUrl: item.mediaUrl ? `https://loremflickr.com/1080/1920/${item.mediaUrl.replace(/s+/g, ',')}?lock=${Math.floor(Math.random() * 1000)}` : undefined
    }));
  } catch (error) {
    console.error("Gemini Feed Error:", error);
    return [];
  }
}

export async function generateReflectionDeepDive(item: ReflectionItem): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Write a profound, soul-shaking Islamic spiritual essay based on this topic: "${item.content}".
      
      Context: ${item.summary}
      
      Requirements:
      1. Write in a deeply moving, poetic, and spiritual tone.
      2. Connect it to the reader's daily life and struggles.
      3. Use metaphors from nature or Quranic imagery.
      4. Length: 600-1000 words. (Do not write less than this).
      5. Return ONLY the essay text, no markdown formatting like headers or bolding.`
    });

    return response.text || item.summary || "Content unavailable.";
  } catch (error) {
    console.error("Gemini Deep Dive Error:", error);
    return item.summary || "Content unavailable.";
  }
}