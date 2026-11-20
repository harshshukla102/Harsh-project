import { createGeneration } from "@/db/generations";
import { getSessionUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import sharp from "sharp";

import { ACCEPTED_SOURCE_IMAGE_MIME_TYPES } from "@/lib/constants";
import { getStylePreset } from "@/lib/style-presets";
import { uploadBufferToImageKit } from "@/lib/imagekit";
import { uploadToPublicCdn } from "@/lib/public-upload";
import { describeImageWithGemini, generateNativeGeminiImage } from "@/lib/gemini";

export const runtime = "nodejs";

type GenerateImageRequest = {
  sourceImageUrl?: string;
  sourceMimeType?: string;
  originalFileName?: string;
  styleSlug?: string;
  model?: string;
  subjectDescription?: string;
};

/**
 * Reads dimensions from source image and computes ideal resolution for generation.
 */
async function inferDimensions(imageBuffer: Buffer): Promise<{ width: number; height: number }> {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    if (!metadata.width || !metadata.height) {
      return { width: 1024, height: 1024 };
    }

    const aspectRatio = metadata.width / metadata.height;
    if (aspectRatio > 1.1) return { width: 1280, height: 832 }; // Landscape
    if (aspectRatio < 0.9) return { width: 832, height: 1280 }; // Portrait
    return { width: 1024, height: 1024 }; // Square
  } catch {
    return { width: 1024, height: 1024 };
  }
}

/**
 * High-fidelity AI style synthesis engine (zero watermarks, nologo=true)
 * used as seamless fallback when Google AI Studio project is on Free Tier (limit: 0).
 */
async function generateStylizedImageFallback(params: {
  prompt: string;
  width: number;
  height: number;
  sourceImageUrl?: string;
}): Promise<Buffer> {
  const { prompt, width, height, sourceImageUrl } = params;
  const seed = Math.floor(Math.random() * 10000000);
  const encodedPrompt = encodeURIComponent(prompt);

  const candidateEngines = ["sana", "flux", "flux-realism", "turbo"];
  let lastError: Error | null = null;

  for (const engine of candidateEngines) {
    let url = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=${encodeURIComponent(
      engine,
    )}&width=${width}&height=${height}&seed=${seed}&nologo=true`;

    if (sourceImageUrl && (sourceImageUrl.startsWith("http://") || sourceImageUrl.startsWith("https://"))) {
      url += `&image=${encodeURIComponent(sourceImageUrl)}`;
    }

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 35000);

        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const arrayBuffer = await res.arrayBuffer();
          if (arrayBuffer.byteLength > 1000) {
            return Buffer.from(arrayBuffer);
          }
        }
      } catch (err) {
        lastError = err as Error;
      }

      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  throw (
    lastError ||
    new Error("AI style synthesis failed. Please try again in a few moments.")
  );
}

export async function POST(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as GenerateImageRequest;
  const {
    model = "gemini-2.5-flash",
    originalFileName,
    sourceImageUrl,
    sourceMimeType,
    styleSlug,
    subjectDescription,
  } = body;

  if (!sourceImageUrl) {
    return NextResponse.json({ error: "Please upload an image first." }, { status: 400 });
  }

  if (
    sourceMimeType &&
    !ACCEPTED_SOURCE_IMAGE_MIME_TYPES.has(sourceMimeType) &&
    !sourceImageUrl.startsWith("data:image/")
  ) {
    return NextResponse.json({ error: "Unsupported image type." }, { status: 400 });
  }

  if (!styleSlug) {
    return NextResponse.json({ error: "Please select a style preset." }, { status: 400 });
  }

  const preset = getStylePreset(styleSlug);
  if (!preset) {
    return NextResponse.json({ error: "Unknown style preset." }, { status: 400 });
  }

  try {
    let imageBuffer: Buffer;

    if (sourceImageUrl.startsWith("data:")) {
      const base64Data = sourceImageUrl.split(",")[1];
      imageBuffer = Buffer.from(base64Data, "base64");
    } else {
      const sourceRes = await fetch(sourceImageUrl);
      if (!sourceRes.ok) {
        return NextResponse.json(
          { error: "Could not load uploaded image. Please try again." },
          { status: 400 },
        );
      }
      imageBuffer = Buffer.from(await sourceRes.arrayBuffer());
    }

    const { width, height } = await inferDimensions(imageBuffer);

    // 1. Google Gemini Multimodal Vision Analysis:
    // If user didn't enter custom notes, Gemini analyzes photo likeness and features
    let finalSubjectDescription = subjectDescription?.trim();
    if (!finalSubjectDescription) {
      try {
        const geminiDesc = await describeImageWithGemini({
          buffer: imageBuffer,
          mimeType: sourceMimeType || "image/jpeg",
        });
        if (geminiDesc) {
          finalSubjectDescription = geminiDesc;
        }
      } catch (err) {
        console.warn("Gemini auto-description failed in generate route:", err);
      }
    }

    const subjectClause = finalSubjectDescription
      ? `A high-end styled transformation of ${finalSubjectDescription} from the reference photo, accurately matching their face, hairstyle, facial hair, clothing, and likeness.`
      : `A high-end styled transformation of the person and subject in the reference photo, accurately preserving their face, facial hair, hairstyle, expression, outfit colors, pose, and framing.`;

    const prompt = [
      `Artistic restyle in ${preset.label} style.`,
      subjectClause,
      preset.prompt,
      "Maintain recognizable subject likeness, high aesthetic fidelity, 8k resolution, polished artwork.",
    ].join(" ");

    // 2. Try native Google Gemini Image Generation using official SDK
    let resultBuffer: Buffer | null = null;
    try {
      resultBuffer = await generateNativeGeminiImage({
        prompt,
        buffer: imageBuffer,
        mimeType: sourceMimeType || "image/jpeg",
        model,
      });
    } catch (err) {
      console.warn("Native Gemini image generation attempt failed, using fallback:", err);
    }

    // 3. If native Google Gemini key has Free Tier limit (quota 0 for direct image output),
    // use high-fidelity style transfer with zero watermarks (nologo=true)
    if (!resultBuffer) {
      let publicSourceUrl: string | undefined = undefined;
      if (sourceImageUrl.startsWith("http://") || sourceImageUrl.startsWith("https://")) {
        publicSourceUrl = sourceImageUrl;
      } else {
        const uploadedPublicUrl = await uploadToPublicCdn(
          imageBuffer,
          sourceMimeType || "image/jpeg",
          originalFileName || "user-source.jpg",
        );
        if (uploadedPublicUrl) {
          publicSourceUrl = uploadedPublicUrl;
        }
      }

      resultBuffer = await generateStylizedImageFallback({
        prompt,
        width,
        height,
        sourceImageUrl: publicSourceUrl,
      });
    }

    const imageBase64 = resultBuffer.toString("base64");

    // Attempt to upload to ImageKit or fallback to data URL
    let resultImageUrl: string;
    const uploadedKit = await uploadBufferToImageKit({
      buffer: resultBuffer,
      fileName: `${preset.slug}-${Date.now()}.jpg`,
      folder: `/users/${user.userId}/results`,
      mimeType: "image/jpeg",
    });

    if (uploadedKit?.url) {
      resultImageUrl = uploadedKit.url;
    } else {
      resultImageUrl = `data:image/jpeg;base64,${imageBase64}`;
    }

    const savedGeneration = await createGeneration({
      userId: user.userId,
      originalFileName: typeof originalFileName === "string" ? originalFileName : null,
      sourceImageUrl: sourceImageUrl.startsWith("data:") ? "(Uploaded image)" : sourceImageUrl,
      resultImageUrl,
      styleSlug: preset.slug,
      styleLabel: preset.label,
      model,
      promptUsed: prompt,
    });

    return NextResponse.json({
      imageBase64,
      mimeType: "image/jpeg",
      promptUsed: prompt,
      style: { slug: preset.slug, label: preset.label },
      model,
      savedGeneration,
    });
  } catch (error) {
    console.error("generate-image route failed:", error);
    return NextResponse.json(
      { error: "Image generation failed. Please try again in a few moments." },
      { status: 500 },
    );
  }
}
