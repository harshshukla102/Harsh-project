import ImageKit, { toFile } from "@imagekit/nodejs";

let _client: InstanceType<typeof ImageKit> | null = null;

function getClient() {
  if (!_client && process.env.IMAGEKIT_PRIVATE_KEY) {
    _client = new ImageKit({
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    });
  }
  return _client;
}

export async function uploadBufferToImageKit(params: {
  buffer: Buffer;
  fileName: string;
  folder: string;
  mimeType: string;
}): Promise<{ url: string; fileId?: string } | null> {
  const client = getClient();
  if (!client) {
    return null;
  }

  try {
    const file = await toFile(params.buffer, params.fileName, { type: params.mimeType });

    const result = await client.files.upload({
      file,
      fileName: params.fileName,
      folder: params.folder,
      useUniqueFileName: true,
    });

    return { url: result.url!, fileId: result.fileId! };
  } catch (err) {
    console.warn("ImageKit upload failed, will fallback to direct storage:", err);
    return null;
  }
}
