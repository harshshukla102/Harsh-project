"use client";

import {
  type PropsWithChildren,
  type SubmitEvent,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { upload } from "@imagekit/next";

import { openAiImageModels, type OpenAiImageModel } from "@/lib/openai-image-models";
import { stylePresets, type StylePreset } from "@/lib/style-presets";
import {
  GenerationHistorySummaryItem,
  GenerationResult,
  StudioWorkbenchProps,
  UploadedSource,
} from "@/lib/types";

type StudioWorkbenchContextValue = {
  error: string | null;
  file: File | null;
  history: GenerationHistorySummaryItem[];
  inputId: string;
  isGenerateDisabled: boolean;
  isLoading: boolean;
  resultPreview: string | null;
  selectedModel: OpenAiImageModel;
  selectedPreset: StylePreset;
  selectedStyle: string;
  sourcePreview: string | null;
  subjectDescription: string;
  isAnalyzingImage: boolean;
  viewedHistoryItem: GenerationHistorySummaryItem | null;
  autoDescribeWithGemini: () => Promise<void>;
  closeHistoryPreview: () => void;
  handleSubmit: (event: SubmitEvent<HTMLFormElement>) => Promise<void>;
  openHistoryPreview: (item: GenerationHistorySummaryItem) => void;
  replaceFile: (nextFile: File | null) => void;
  selectModel: (model: OpenAiImageModel) => void;
  selectStyle: (styleSlug: string) => void;
  setSubjectDescription: (val: string) => void;
};

const StudioWorkbenchContext = createContext<StudioWorkbenchContextValue | null>(null);

const uploadInputId = "studio-image-upload";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function getImageKitAuthParams() {
  try {
    const response = await fetch("/api/upload");
    if (!response.ok) return { configured: false };
    const data = await response.json();
    return data as {
      configured: boolean;
      token?: string;
      expire?: number;
      signature?: string;
      publicKey?: string;
    };
  } catch {
    return { configured: false };
  }
}

export function StudioWorkbenchProvider({
  children,
  userId,
  initialHistory,
}: PropsWithChildren<StudioWorkbenchProps>) {
  const value = useStudioWorkbenchValue({ userId, initialHistory });

  return (
    <StudioWorkbenchContext.Provider value={value}>{children}</StudioWorkbenchContext.Provider>
  );
}

export function useStudioWorkbench() {
  const value = useContext(StudioWorkbenchContext);

  if (!value) {
    throw new Error("useStudioWorkbench must be used within StudioWorkbenchProvider.");
  }

  return value;
}

function useStudioWorkbenchValue({
  userId,
  initialHistory,
}: StudioWorkbenchProps): StudioWorkbenchContextValue {
  const [selectedStyle, setSelectedStyle] = useState(stylePresets[0]?.slug ?? "");
  const [selectedModel, setSelectedModel] = useState<OpenAiImageModel>(openAiImageModels[0]);
  const [file, setFile] = useState<File | null>(null);
  const [uploadedSource, setUploadedSource] = useState<UploadedSource | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [subjectDescription, setSubjectDescription] = useState("");
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [history, setHistory] = useState(initialHistory);
  const [viewedHistoryItem, setViewedHistoryItem] = useState<GenerationHistorySummaryItem | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!file) {
      setSourcePreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setSourcePreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const selectedPreset =
    stylePresets.find((p) => p.slug === selectedStyle) ?? stylePresets[0]!;

  const resultPreview = result?.imageBase64
    ? `data:${result.mimeType};base64,${result.imageBase64}`
    : null;

  const isGenerateDisabled = isLoading || !file || !selectedStyle || !selectedModel;

  function replaceFile(nextFile: File | null) {
    setFile(nextFile);
    setUploadedSource(null);
    setResult(null);
    setError(null);
  }

  function openHistoryPreview(item: GenerationHistorySummaryItem) {
    setViewedHistoryItem(item);
  }

  function closeHistoryPreview() {
    setViewedHistoryItem(null);
  }

  async function autoDescribeWithGemini() {
    if (!file || isAnalyzingImage) return;
    setIsAnalyzingImage(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const res = await fetch("/api/describe-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceImageUrl: dataUrl,
          mimeType: file.type || "image/jpeg",
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { description?: string };
        if (data.description) {
          setSubjectDescription(data.description);
        }
      }
    } catch (err) {
      console.warn("Auto describe error:", err);
    } finally {
      setIsAnalyzingImage(false);
    }
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isGenerateDisabled || !file) return;

    setIsLoading(true);
    setError(null);

    try {
      let nextUploadedSource = uploadedSource;

      if (!nextUploadedSource) {
        let imageUrl: string | null = null;

        try {
          const authParams = await getImageKitAuthParams();
          if (authParams.configured && authParams.token && authParams.publicKey) {
            const uploadResponse = await upload({
              file,
              fileName: `${Date.now()}-${file.name}`,
              folder: `/users/${userId}/sources`,
              token: authParams.token,
              expire: authParams.expire!,
              signature: authParams.signature!,
              publicKey: authParams.publicKey,
            });

            if (uploadResponse.url) {
              imageUrl = uploadResponse.url;
            }
          }
        } catch {
          // If ImageKit fails, continue to Data URL fallback
        }

        if (!imageUrl) {
          imageUrl = await fileToDataUrl(file);
        }

        nextUploadedSource = {
          imageUrl,
          originalFileName: file.name,
          sourceMimeType: file.type,
        };

        setUploadedSource(nextUploadedSource);
      }

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceImageUrl: nextUploadedSource.imageUrl,
          sourceMimeType: nextUploadedSource.sourceMimeType,
          originalFileName: nextUploadedSource.originalFileName,
          styleSlug: selectedStyle,
          model: selectedModel,
          subjectDescription: subjectDescription.trim() || undefined,
        }),
      });

      const payload = (await response.json()) as GenerationResult;

      if (!response.ok) {
        setResult(null);
        const err = (payload as { error?: string }).error;
        setError(typeof err === "string" ? err : "Generation failed.");
        return;
      }

      const resultPayload = payload as GenerationResult;
      const g = resultPayload.savedGeneration;

      setResult(resultPayload);
      setHistory((current) => [g, ...current.filter((item) => item.id !== g.id)]);
    } catch {
      setResult(null);
      setError("Something went wrong while generating the image.");
    } finally {
      setIsLoading(false);
    }
  }

  return {
    closeHistoryPreview,
    error,
    file,
    handleSubmit,
    history,
    inputId: uploadInputId,
    isAnalyzingImage,
    isGenerateDisabled,
    isLoading,
    openHistoryPreview,
    autoDescribeWithGemini,
    replaceFile,
    resultPreview,
    selectedModel,
    selectedPreset,
    selectedStyle,
    selectModel: setSelectedModel,
    selectStyle: setSelectedStyle,
    setSubjectDescription,
    sourcePreview,
    subjectDescription,
    viewedHistoryItem,
  };
}
