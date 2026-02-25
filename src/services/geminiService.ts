import { ReflectionItem } from "../types";

const PEXEL_IMAGES = [
  "/images/pexels-alohaphotostudio-10498909.jpg",
  "/images/pexels-andy-dufresne-1782800-15722322.jpg",
  "/images/pexels-duc-tinh-ngo-2147637857-30270538.jpg",
  "/images/pexels-francesco-ungaro-3361052.jpg",
  "/images/pexels-fredrikwandem-19427620.jpg",
  "/images/pexels-grisentig-4215100.jpg",
  "/images/pexels-ikbalphoto-7469648.jpg",
  "/images/pexels-jonasvonwerne-1376173.jpg",
  "/images/pexels-joshsorenson-386148.jpg",
  "/images/pexels-krisof-1252873.jpg",
  "/images/pexels-mohamedbinzayed-8233715.jpg",
  "/images/pexels-mylokaye-8464438.jpg",
  "/images/pexels-nicobecker-5566306.jpg",
  "/images/pexels-philippedonn-1169754.jpg",
  "/images/pexels-pixabay-2150.jpg",
  "/images/pexels-pixabay-248796.jpg",
  "/images/pexels-pixabay-274021.jpg",
  "/images/pexels-ruben-boekeloo-521336009-18410509.jpg",
  "/images/pexels-samrana3003-1883409.jpg",
  "/images/pexels-stijn-dijkstra-1306815-16747789.jpg",
  "/images/pexels-taryn-elliott-3889659.jpg",
  "/images/pexels-taryn-elliott-4253928.jpg",
  "/images/pexels-thales13-34378358.jpg",
  "/images/pexels-thatguycraig000-1652301.jpg",
  "/images/pexels-tomverdoot-3181458.jpg",
  "/images/pexels-yide-sun-84747826-19461146.jpg"
];

// Helper to determine API URL
const getApiUrl = () => {
  // In Capacitor/Android, we might need a full URL. 
  // For local web dev and Vercel, /api works.
  return "/api/reflections";
};

import { GoogleGenAI } from "@google/genai";

export async function generateReflectionsStream(count: number = 3): Promise<ReflectionItem[]> {
  try {
    // LOCAL DEV STAND-IN for /api/reflections (Vercel function)
    if (import.meta.env.DEV) {
      console.log("Local Dev: Calling Gemini directly from frontend...");
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("VITE_GEMINI_API_KEY is missing");
      const genAI = new GoogleGenAI({ apiKey });

      const prompt = `Generate ${count} profound Islamic spiritual reflection items. 
Format Requirements:
- ${Math.max(1, count - 1)} of these items MUST be short, powerful quotes (from Sahih Hadith, Rumi, or Sahaba). Leave their "details" field completely empty "".
- Exactly 1 of these items MUST be a longer, deep-dive article, with the "details" field fully populated with a reflective essay (minimum 200 words).
Focus: Sahih Hadith (Bukhari/Muslim), Quran verses, or quotes from early scholars/Rumi.
Strict constraint: Absolutely NO shia, shirk, or extreme sufi concepts. Keep it grounded in mainstream Sunni Islam.
Target Audience: Today's everyday person of all genders. Make it highly reflective and applicable to modern struggles.
Output Format: JSON Array.
Schema: [{"type":"string","content":"string","summary":"string","details":"string","author":"string","praise":"string","tags":["string"],"readTime":"string"}]
Strictly output ONLY valid JSON without any markdown formatting like \`\`\`json.`;

      let text = "";
      try {
        const result = await genAI.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });
        text = (result as any).text || (result as any).response?.text() || "";
      } catch (e) {
        console.warn("Flash failed, trying Flash Lite...");
        const result = await genAI.models.generateContent({
          model: "gemini-2.5-flash-lite",
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });
        text = (result as any).text || (result as any).response?.text() || "";
      }

      const cleanJson = text.replace(/```json|```/g, "").trim();
      const results = JSON.parse(cleanJson);

      return results.map((item: any) => ({
        ...item,
        id: Math.random().toString(36).substr(2, 9),
        isAiGenerated: true,
        mediaUrl: PexelImages_getRandom()
      }));
    }

    // PRODUCTION / VERCEL: Call the serverless function
    const response = await fetch(getApiUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "stream", count })
    });

    if (!response.ok) throw new Error("API call failed");

    const results = await response.json();

    // Map random Pexel images
    return results.map((item: any) => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      isAiGenerated: true,
      mediaUrl: PexelImages_getRandom()
    }));

  } catch (error) {
    console.error("Gemini Feed Error:", error);
    return [];
  }
}

function PexelImages_getRandom() {
  const idx = Math.floor(Math.random() * PEXEL_IMAGES.length);
  return PEXEL_IMAGES[idx];
}

// Legacy function - kept for compatibility if needed, but redirects to stream
export async function generateReflections(count: number = 2): Promise<ReflectionItem[]> {
  return generateReflectionsStream(count);
}

export async function generateReflectionDeepDive(item: ReflectionItem): Promise<string> {
  try {
    const response = await fetch(getApiUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deep-dive", item })
    });

    if (!response.ok) throw new Error("API call failed");

    const result = await response.json();
    return result.text || item.summary || "Content unavailable.";
  } catch (error) {
    console.error("Gemini Deep Dive Error:", error);
    return item.summary || "Content unavailable.";
  }
}