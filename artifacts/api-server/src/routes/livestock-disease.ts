import { Router, type IRouter } from "express";
import { GoogleGenAI } from "@google/genai";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.post("/livestock/scan", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { imageBase64 } = req.body;
  if (!imageBase64) {
    res.status(400).json({ error: "imageBase64 is required" });
    return;
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const prompt = `You are an expert veterinarian and livestock disease specialist with deep knowledge of animal diseases common in Zambia and Southern Africa.

Analyze this animal/livestock image and provide a veterinary diagnosis in the following JSON format only (no markdown, no extra text):
{
  "condition": "Disease/condition name or 'Healthy Animal' if no issue detected",
  "animalType": "cattle | goat | sheep | pig | poultry | rabbit | unknown",
  "confidence": <number 0-100>,
  "description": "Brief description of the condition and how it affects the animal",
  "symptoms": ["visible symptom 1", "visible symptom 2", "visible symptom 3"],
  "urgency": "routine" | "soon" | "urgent" | "emergency",
  "treatment": ["treatment step 1", "treatment step 2", "treatment step 3"],
  "medicines": ["medicine/drug name 1", "medicine name 2"],
  "prevention": ["prevention tip 1", "prevention tip 2"],
  "vetAdvice": "One sentence of key advice for the farmer"
}

Focus on diseases common in Zambia: Foot and Mouth Disease, East Coast Fever, Lumpy Skin Disease, Newcastle Disease, African Swine Fever, PPR (Peste des Petits Ruminants), Blackleg, Anthrax, Trypanosomiasis.
If the image is not an animal, set condition to "Unable to analyze - not a livestock image" and confidence to 0.`;

  let base64Data = imageBase64;
  let mimeType = "image/jpeg";

  if (imageBase64.startsWith("data:")) {
    const [header, data] = imageBase64.split(",");
    base64Data = data;
    const match = header.match(/data:([^;]+)/);
    if (match) mimeType = match[1];
  }

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: { data: base64Data, mimeType } },
        ],
      },
    ],
  });

  const text = (result.text ?? "").trim();
  let diagnosis: any;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    diagnosis = JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch {
    logger.warn({ text }, "Failed to parse Gemini livestock response as JSON");
    diagnosis = {
      condition: "Analysis complete",
      animalType: "unknown",
      confidence: 70,
      description: text.slice(0, 200),
      symptoms: [],
      urgency: "routine",
      treatment: [],
      medicines: [],
      prevention: [],
      vetAdvice: "Consult a local veterinarian for a full examination.",
    };
  }

  req.log.info({ condition: diagnosis.condition }, "Livestock scan completed");
  res.json(diagnosis);
});

export default router;
