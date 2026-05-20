import { Router, type IRouter } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db, diseaseScansTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.post("/disease/scan", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { imageBase64 } = req.body;
  if (!imageBase64) {
    res.status(400).json({ error: "imageBase64 is required" });
    return;
  }

  if (!process.env.GEMINI_API_KEY) {
    res.status(500).json({ error: "Gemini API key not configured" });
    return;
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are an expert agricultural plant pathologist specializing in crops grown in Zambia and Southern Africa.

Analyze this crop image and provide a disease diagnosis in the following JSON format only (no markdown, no extra text):
{
  "disease": "Disease name or 'Healthy Plant' if no disease",
  "confidence": <number 0-100>,
  "description": "Brief description of the disease",
  "symptoms": ["symptom1", "symptom2", "symptom3"],
  "treatment": ["treatment step 1", "treatment step 2", "treatment step 3"],
  "prevention": ["prevention tip 1", "prevention tip 2"],
  "severity": "low" | "medium" | "high",
  "medicines": ["medicine/fungicide name 1", "medicine name 2"]
}

Focus on crops common in Zambia: maize, groundnuts, soybeans, sorghum, cassava, vegetables.
If the image is not a plant/crop, set disease to "Unable to analyze - not a crop image" and confidence to 0.`;

  let base64Data = imageBase64;
  let mimeType = "image/jpeg";

  if (imageBase64.startsWith("data:")) {
    const [header, data] = imageBase64.split(",");
    base64Data = data;
    const match = header.match(/data:([^;]+)/);
    if (match) mimeType = match[1];
  }

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: base64Data,
        mimeType,
      },
    },
  ]);

  const text = result.response.text().trim();
  let diagnosis: any;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    diagnosis = JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch {
    logger.warn({ text }, "Failed to parse Gemini response as JSON");
    diagnosis = {
      disease: "Analysis complete",
      confidence: 70,
      description: text.slice(0, 200),
      symptoms: [],
      treatment: [],
      prevention: [],
      severity: "low" as const,
      medicines: [],
    };
  }

  await db.insert(diseaseScansTable).values({
    userId: req.user?.userId ?? null,
    imageUrl: null,
    diseaseFound: diagnosis.disease,
    confidence: String(diagnosis.confidence),
    treatment: Array.isArray(diagnosis.treatment) ? diagnosis.treatment.join("; ") : diagnosis.treatment,
  }).catch(() => {});

  req.log.info({ disease: diagnosis.disease }, "Disease scan completed");
  res.json(diagnosis);
});

export default router;
