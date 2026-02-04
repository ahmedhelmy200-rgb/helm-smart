import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `أنت المساعد القانوني الذكي المخصص لمكتب "أحمد حلمي للاستشارات القانونية" في مدينة العين، دولة الإمارات العربية المتحدة.
تقدم استشارات دقيقة بناءً على التشريعات الإماراتية الحديثة.
تحدث دائماً برصانة ومهنية قانونية عالية.
عند صياغة المذكرات، التزم بالنماذج المعتمدة في دائرة القضاء - أبوظبي ومحاكم العين.
أجب دائماً باللغة العربية.`;

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

  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== "string") {
    res.status(400).json({ error: "Missing prompt" });
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    res.status(200).json({ text: response.text || "" });
  } catch (e: any) {
    console.error("Gemini API Error:", e);
    res.status(500).json({ error: "Gemini request failed" });
  }
}
