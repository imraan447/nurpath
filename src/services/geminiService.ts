import { GoogleGenAI, Type } from "@google/genai";
import { ReflectionItem } from "../types";

let aiClient: GoogleGenAI | null = null;

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

export async function generateReflectionsStream(count: number = 3): Promise<ReflectionItem[]> {
  try {
    const ai = getAiClient();
    if (!ai) return [];

    console.log("Requesting new reflections from Gemini...");

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `Generate ${count} profound Islamic spiritual reflection items.
      
      Output Format: JSON Array.
      
      Topic Mix:
      - 1 Short Hadith (with reference like "Sahih Bukhari")
      - 1 Short Quran Verse (with Surah:Verse)
      - 1 "Wonder of Allah" (Short biological/cosmic fact connecting to Al-Khaliq)
      - Or simple "Heart Softener" quotes/stories.

      Constraints:
      1. Content: Deep, meaningful, authentic Sunni sources.
      2. 'details': Provide the FULL content here (2-3 paragraphs or the full Hadith text). Don't make it too long, but enough to read inline.
      3. 'type': 'hadith' | 'verse' | 'wonder' | 'story'.
      4. 'praise': One of ["Subhanallah", "Alhamdulillah", "Allahu Akbar"].
      5. No humans/faces in description implied.

      Schema:
      [
        {
          "type": "string",
          "content": "Title/Hook",
          "summary": "One sentence teaser",
          "details": "The full text/reflection/hadith content to show inline.",
          "author": "Source Name",
          "praise": "Praise Word",
          "tags": ["tag1", "tag2"],
          "readTime": "1 min read"
        }
      ]`,
      config: {
        responseMimeType: "application/json"
      }
    });

    const r = response as any;
    const text = typeof r.text === 'function' ? r.text() : (r.text as string);
    if (!text) return [];

    const results = JSON.parse(text);

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
    const ai = getAiClient();
    if (!ai) return item.summary || "AI content unavailable (API Key missing).";

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: `Write a profound, soul-shaking Islamic spiritual essay based on this topic: "${item.content}".
      
      Context: ${item.summary}
      
      Strict Guidelines:
      1. **Tone**: Deeply moving, poetic, and spiritual.
      2. **Methodology**: Strictly Sunni/Salafi/Traditional.
      3. **Content**: Connect the reader's daily modern struggles to Allah.
      4. **Length**: 500-800 words.
      5. **Output**: Plain text (paragraphs).
      
      Begin directly with the essay.`
    });

    const r = response as any;
    const text = typeof r.text === 'function' ? r.text() : (r.text as string);
    return text || item.summary || "Content unavailable.";
  } catch (error) {
    console.error("Gemini Deep Dive Error:", error);
    return item.summary || "Content unavailable.";
  }
}