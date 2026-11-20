/**
 * Helper to upload image buffers to a public CDN for image-to-image AI processing.
 * Pollinations AI requires a publicly accessible URL to use as reference image input.
 */
import { uploadBufferToImageKit } from "./imagekit";

export async function uploadToPublicCdn(
  buffer: Buffer,
  mimeType: string = "image/jpeg",
  fileName: string = "source.jpg",
): Promise<string | null> {
  // 1. Try ImageKit if credentials are provided in .env
  try {
    const kitResult = await uploadBufferToImageKit({
      buffer,
      fileName,
      folder: "/temp-sources",
      mimeType,
    });
    if (kitResult?.url) {
      return kitResult.url;
    }
  } catch (err) {
    console.warn("ImageKit public upload skipped or failed:", err);
  }

  // 2. Try freeimage.host (fast, reliable, free public image CDN)
  try {
    const form = new FormData();
    form.append("key", "6d207e02198a847aa98d0a2a901485a5"); // standard free public key
    form.append("action", "upload");
    form.append("source", buffer.toString("base64"));
    form.append("format", "json");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch("https://freeimage.host/api/1/upload", {
      method: "POST",
      body: form,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = (await res.json()) as { status_code?: number; image?: { url?: string } };
      if (data?.image?.url) {
        return data.image.url;
      }
    }
  } catch (err) {
    console.warn("freeimage.host upload failed, trying fallback:", err);
  }

  // 3. Fallback: uguu.se
  try {
    const form = new FormData();
    form.append("files[]", new Blob([new Uint8Array(buffer)], { type: mimeType }), fileName);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch("https://uguu.se/upload.php", {
      method: "POST",
      body: form,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = (await res.json()) as { success?: boolean; files?: Array<{ url?: string }> };
      if (data?.success && data?.files?.[0]?.url) {
        return data.files[0].url;
      }
    }
  } catch (err) {
    console.warn("uguu.se fallback upload failed:", err);
  }

  return null;
}
