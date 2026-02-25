require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

async function test() {
  const apiKey = process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) { console.error("No API key"); return; }
  const genAI = new GoogleGenAI({ apiKey });
  try {
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Just reply with the word Test",
      config: { responseMimeType: "text/plain" }
    });
    console.log("Success:", result.text || result.response?.text());
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
