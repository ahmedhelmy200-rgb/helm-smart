// Web-safe Gemini service:
// Calls Vercel Serverless Functions under /api/*.
// (Do NOT ship API keys in the browser.)

type ApiResp = { text?: string; error?: string };

export const getLegalAdvice = async (prompt: string) => {
  try {
    const r = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const json = (await r.json()) as ApiResp;
    if (!r.ok) throw new Error(json.error || "Request failed");
    return json.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "عذراً، حدث خطأ أثناء معالجة طلبك القانوني. يرجى المحاولة مرة أخرى لاحقاً.";
  }
};

export const analyzeDocument = async (base64Image: string, prompt: string) => {
  try {
    const r = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64Image, prompt }),
    });

    const json = (await r.json()) as ApiResp;
    if (!r.ok) throw new Error(json.error || "Request failed");
    return json.text || "";
  } catch (error) {
    console.error("Gemini Image Analysis Error:", error);
    return "عذراً، حدث خطأ أثناء تحليل المستند. يرجى التأكد من جودة الصورة والمحاولة مرة أخرى.";
  }
};
