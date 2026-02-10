import { GoogleGenAI, Type } from "@google/genai";

/**
 * Generates spiritual reflections using the latest SDK standards.
 */
export async function generateReflections(count: number = 3): Promise<any[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite-latest',
      contents: `Generate ${count} profound reflective items for "NurPath". 
      Include types like 'verse', 'hadith', 'nature', 'animal'. 
      'details' must be an extensive article of 500+ words per item.
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
              source: { type: Type.STRING },
              praise: { type: Type.STRING },
              details: { type: Type.STRING },
              mediaUrl: { type: Type.STRING }
            },
            required: ['type', 'content', 'praise', 'details']
          }
        }
      }
    });

    const text = response.text; // Access .text property, not .text() method
    if (!text) return [];
    
    const results = JSON.parse(text);
    return results.map((item: any) => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      mediaUrl: item.mediaUrl ? `https://loremflickr.com/1080/1920/${item.mediaUrl.replace(/\s+/g, ',')}?lock=${Math.floor(Math.random() * 1000)}` : undefined
    }));
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
}

/**
 * Maps grounding implementation.
 */
export async function findNearbyPlace(query: string, latitude: number, longitude: number): Promise<{text: string, distance?: string}> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Find the nearest ${query} to my location.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: { latitude, longitude }
          }
        }
      },
    });

    const text = response.text || "No information found.";
    const kmMatch = text.match(/(\d+(\.\d+)?)\s*km/i);
    return { text, distance: kmMatch ? kmMatch[0] : undefined };
  } catch (error) {
    console.error("Maps Error:", error);
    return { text: "Location services unavailable." };
  }
}