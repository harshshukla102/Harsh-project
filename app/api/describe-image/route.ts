import { NextResponse } from "next/server";
import { describeImageWithGemini } from "@/lib/gemini";
import { getSessionUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { sourceImageUrl?: string; mimeType?: string };
    const { sourceImageUrl, mimeType = "image/jpeg" } = body;

    if (!sourceImageUrl) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    let buffer: Buffer;
    if (sourceImageUrl.startsWith("data:")) {
      const base64Data = sourceImageUrl.split(",")[1];
      buffer = Buffer.from(base64Data, "base64");
    } else {
      const res = await fetch(sourceImageUrl);
      if (!res.ok) {
        return NextResponse.json({ error: "Failed to fetch image" }, { status: 400 });
      }
      buffer = Buffer.from(await res.arrayBuffer());
    }

    const description = await describeImageWithGemini({ buffer, mimeType });
    if (!description) {
      return NextResponse.json(
        { error: "Could not generate description with Gemini" },
        { status: 502 },
      );
    }

    return NextResponse.json({ description });
  } catch (err) {
    console.error("describe-image error:", err);
    return NextResponse.json({ error: "Failed to analyze image" }, { status: 500 });
  }
}
