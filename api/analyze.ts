import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    return;
  }

  const { base64Image, prompt } = req.body || {};
  if (!base64Image || typeof base64Image !== "string") {
    res.status(400).json({ error: "Missing base64Image" });
    return;
  }
  if (!prompt || typeof prompt !== "string") {
    res.status(400).json({ error: "Missing prompt" });
    return;
  }

  try {
    // base64Image is expected as data URL: data:image/png;base64,....
    const base64Data = base64Image.split(",")[1] || "";
    const mimeType = base64Image.substring(
      base64Image.indexOf(":") + 1,
      base64Image.indexOf(";")
    );

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
          { text: prompt },
        ],
      },
    });

    res.status(200).json({ text: response.text || "" });
  } catch (e: any) {
    console.error("Gemini Image Analysis Error:", e);
    res.status(500).json({ error: "Gemini analyze failed" });
  }
}
