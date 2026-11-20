import type { OpenAiImageModel } from "@/lib/openai-image-models";

export type GenerationHistorySummaryItem = {
  id: string;
  userId: string;
  originalFileName: string | null;
  sourceImageUrl: string;
  resultImageUrl: string;
  styleSlug: string;
  styleLabel: string;
  model: string;
  promptUsed: string;
  createdAt: Date | string;
};

export type GenerationResult = {
  imageBase64: string;
  mimeType: string;
  model: OpenAiImageModel;
  savedGeneration: GenerationHistorySummaryItem;
  style: {
    slug: string;
    label: string;
  };
  promptUsed: string;
};

export type StudioWorkbenchProps = {
  userId: string;
  initialHistory: GenerationHistorySummaryItem[];
};

export type UploadedSource = {
  imageUrl: string;
  originalFileName: string;
  sourceMimeType: string;
};
