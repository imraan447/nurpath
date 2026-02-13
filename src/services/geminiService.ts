import { GoogleGenAI, Type } from "@google/genai";
import { ReflectionItem } from "../types";

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (aiClient) return aiClient;

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("Missing Gemini API Key - AI features will be disabled");
    return null;
  }

  try {
    aiClient = new GoogleGenAI({ apiKey });
    return aiClient;
  } catch (err) {
    console.error("Failed to initialize Gemini client:", err);
    return null;
  }
}

export async function generateReflections(count: number = 2): Promise<ReflectionItem[]> {
  try {
    const ai = getAiClient();
    if (!ai) return [];

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `Generate ${count} profound Islamic spiritual reflection topics.
      
      CRITICAL CONSTRAINTS:
      1. Methodology: Must strictly adhere to Ahlus Sunnah wal Jamaah (Sunni) mainstream understanding. Avoid Shia, Ahmadi, or other sectarian deviations.
      2. Content Style: "Brainrot Replacer" - Short, punchy, fascinating, and deeply spiritual. Mix of "Cosmic Awe" (Science/Nature) and "Heart Softeners" (Hadith/Seerah).
      3. Images: Return a search keyword for Unsplash. STRICTLY NO HUMANS, NO FACES, NO EYES, NO SCULPTURES. Use landscapes, space, nature, geometry, or architecture.

      Requirements:
      1. 'content' should be a short, powerful hook/title (e.g., "The Weight of a Cloud").
      2. 'summary' should be a 2-3 sentence teaser.
      3. 'praise' must be: Subhanallah, Alhamdulillah, Allahu Akbar, or MashaAllah.
      4. 'tags': Array of 2-3 keywords (e.g. ["Science", "Quran"]).
      5. 'readTime': Estimate (e.g., "2 min read").
      
      Return JSON ONLY matching the schema.`,
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
              mediaUrl: { type: Type.STRING },
              author: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              readTime: { type: Type.STRING }
            },
            required: ['type', 'content', 'summary', 'praise', 'mediaUrl', 'tags', 'readTime']
          }
        }
      }
    });

    const r = response as any;
    const text = typeof r.text === 'function' ? r.text() : (r.text as string);
    if (!text) return [];

    const results = JSON.parse(text);
    return results.map((item: any) => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      isAiGenerated: true,
      author: "Reflect AI",
      mediaUrl: item.mediaUrl ? `https://source.unsplash.com/1600x900/?${encodeURIComponent(item.mediaUrl)},nature,aesthetic` : undefined
    }));
  } catch (error) {
    console.error("Gemini Feed Error:", error);
    return [];
  }
}

export async function generateReflectionDeepDive(item: ReflectionItem): Promise<string> {
  try {
    const ai = getAiClient();
    if (!ai) return item.summary || "AI content unavailable (API Key missing).";

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: `Write a profound, soul-shaking Islamic spiritual essay based on this topic: "${item.content}".
      
      Context: ${item.summary}
      
      Strict Guidelines:
      1. **Tone**: Deeply moving, poetic, and spiritual. Intellectual but accessible.
      2. **Methodology**: Strictly Sunni/Salafi/Traditional. Quote Quran (Saheeh International) and Bukhari/Muslim/Tirmidhi only.
      3. **Content**: Connect the reader's daily modern struggles (anxiety, distraction, loneliness) to Allah's Names and Attributes.
      4. **Logic**: Use analogies (like the "Needle in the Desert" or "Ship in the Ocean").
      5. **Science**: If relevant, mention the miracle of creation (biology, physics) as proof of Al-Khaliq.
      6. **Length**: 500-800 words.
      7. **Output**: Plain text (paragraphs). No markdown bolding/headers (the UI handles that).

      Begin directly with the essay.`
    });

    // Handle potential API differences (function vs property) safely
    const r = response as any;
    const text = typeof r.text === 'function' ? r.text() : (r.text as string);
    return text || item.summary || "Content unavailable.";
  } catch (error) {
    console.error("Gemini Deep Dive Error:", error);
    return item.summary || "Content unavailable.";
  }
}