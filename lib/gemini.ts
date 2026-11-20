/**
 * Google Gemini AI SDK Helper
 * Powered by @google/genai official SDK.
 * Handles multimodal vision analysis, art direction, and native Gemini image generation.
 */
import { GoogleGenAI } from "@google/genai";

let _aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!_aiClient) {
    _aiClient = new GoogleGenAI({ apiKey });
  }
  return _aiClient;
}

/**
 * Uses Gemini 2.5 Flash Multimodal Vision to inspect the uploaded image,
 * accurately identifying the subject, facial features, hair, beard, clothing, colors, and pose.
 */
export async function describeImageWithGemini(params: {
  buffer: Buffer;
  mimeType?: string;
}): Promise<string | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  const { buffer, mimeType = "image/jpeg" } = params;
  const base64Data = buffer.toString("base64");

  const models = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.0-flash"];

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [
              {
                text:
                  "Analyze this photo and provide a concise, high-detail description of the main subject (gender, approximate age, ethnicity, facial features, hairstyle, facial hair, facial expression, clothing type, exact colors, and pose/framing) in 2-3 clear sentences for an AI art restyling prompt. Do not use conversational filler, just the descriptive prompt text.",
              },
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
      });

      const text = response.text?.trim();
      if (text) {
        return text;
      }
    } catch (err: any) {
      console.warn(`Gemini SDK [${model}] vision analysis failed:`, err?.status || err?.message?.slice(0, 100));
    }
  }

  return null;
}

/**
 * Attempts native Google Gemini image generation using official Gemini Image models
 * (e.g. gemini-2.5-flash-image / gemini-3.1-flash-image).
 * Requires billing/quota enabled on the Google AI Studio project.
 */
export async function generateNativeGeminiImage(params: {
  prompt: string;
  buffer: Buffer;
  mimeType?: string;
  model?: string;
}): Promise<Buffer | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  const { prompt, buffer, mimeType = "image/jpeg", model = "gemini-2.5-flash-image" } = params;
  const base64Data = buffer.toString("base64");

  const candidateModels = [model, "gemini-2.5-flash-image", "gemini-3.1-flash-image"].filter(
    (m, i, arr) => arr.indexOf(m) === i,
  );

  for (const candidate of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: candidate,
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ["IMAGE"],
        },
      });

      const candidatePart = response.candidates?.[0]?.content?.parts?.find(
        (p: any) => p.inlineData?.data,
      );

      if (candidatePart?.inlineData?.data) {
        return Buffer.from(candidatePart.inlineData.data, "base64");
      }
    } catch (err: any) {
      console.warn(
        `Gemini Native Image Gen [${candidate}] unavailable:`,
        err?.status || err?.message?.slice(0, 120),
      );
    }
  }

  return null;
}
