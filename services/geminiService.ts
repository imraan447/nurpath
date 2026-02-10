import { GoogleGenAI, Type } from "@google/genai";

export async function generateReflections(count: number = 5): Promise<any[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate ${count} highly profound Islamic spiritual reflections. 
      The 'details' field MUST be a deep, long-form masterwork essay of at least 1200 words.
      Varied types: 
      - 'verse' (Exegesis of a Quranic sign)
      - 'hadith' (Spiritual wisdom from the Prophet PBUH)
      - 'nature' (The vastness of the cosmos, quantum world, or deep sea wonders as signs of Allah)
      - 'animal' (Intelligent design in the biological behavior or anatomy of specific animals)
      - 'question' (Self-reflection prompts for the soul: family gratitude, purpose, legacy)
      
      STRICTLY EXCLUDE: Human architecture, buildings, or man-made objects. Focus purely on Divine design and the human heart.
      
      Return JSON ONLY.`,
      config: {
        systemInstruction: `You are a world-class Islamic sage and scientist. 
        Your writing must induce 'Khashya' (awe) and 'Tadabbur' (deep contemplation). 
        For nature and animal types, use sophisticated scientific terminology to demonstrate the complexity of creation.
        For question types, write an incredibly touching and deep guide for the user to reflect on their own life and relationships.
        'praise' must be one of: Subhanallah, Alhamdulillah, Allahu Akbar, MashaAllah.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, description: 'verse, hadith, nature, animal, question' },
              content: { type: Type.STRING, description: 'Short captivating title' },
              source: { type: Type.STRING, description: 'Citation if applicable' },
              praise: { type: Type.STRING },
              details: { type: Type.STRING, description: 'A massive, 1200+ word spiritual essay' },
              mediaUrl: { type: Type.STRING, description: 'Keywords for background (galaxy, deep ocean, microscopic cell, nebula, forest, desert night)' }
            },
            required: ['type', 'content', 'praise', 'details']
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
      mediaUrl: item.mediaUrl ? `https://loremflickr.com/1080/1920/${item.mediaUrl.replace(/\s+/g, ',')}?lock=${Math.floor(Math.random() * 1000)}` : undefined
    }));
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
}

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
    return { text: "Location services unavailable." };
  }
}