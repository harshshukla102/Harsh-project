export const openAiImageModels = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.5-flash-image",
  "gemini-3.1-flash-image",
] as const;

export type OpenAiImageModel = (typeof openAiImageModels)[number];

export const openAiImageModelLabels: Record<OpenAiImageModel, string> = {
  "gemini-2.5-flash": "Google Gemini 2.5 Flash (Recommended / High Quality)",
  "gemini-2.5-pro": "Google Gemini 2.5 Pro (Studio Frontier Quality)",
  "gemini-2.5-flash-image": "Google Gemini 2.5 Flash Image (Native Generator)",
  "gemini-3.1-flash-image": "Google Gemini 3.1 Flash Image (Next-Gen Multimodal)",
};
