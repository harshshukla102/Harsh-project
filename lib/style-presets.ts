export type StylePreset = {
  slug: string;
  label: string;
  description: string;
  thumbnailPath: string;
  thumbnailAlt: string;
  prompt: string;
};

export const stylePresets: StylePreset[] = [
  {
    slug: "storybook-3d",
    label: "Storybook 3D",
    description: "Soft cinematic lighting with polished 3D storybook character detail.",
    thumbnailPath: "/storybook-example.png",
    thumbnailAlt: "Storybook 3D preset example",
    prompt:
      "A premium Disney/Pixar 3D animated character portrait and scene transformation of the subject from the reference photo. Accurately preserve the person's face, facial hair, hairstyle, expression, outfit colors, pose, and framing. Soft depth, warm cinematic lighting, tactile materials, polished 3D animated film finish, 8k resolution.",
  },
  {
    slug: "anime-cel",
    label: "Anime Cel",
    description: "Clean cel shading with expressive color and crisp outlines.",
    thumbnailPath: "/anime-cel-example.png",
    thumbnailAlt: "Anime cel preset example",
    prompt:
      "A high-end Japanese anime cel artwork transformation of the subject in the reference photo. Accurately preserve the person's facial features, facial hair, hairstyle, expression, pose, and clothing. Crisp linework, vibrant cel shading, expressive studio-animation character styling, 8k aesthetic.",
  },
  {
    slug: "clay-render",
    label: "Clay Render",
    description: "Handcrafted clay texture with sculpted forms and warm depth.",
    thumbnailPath: "/clay-render-example.png",
    thumbnailAlt: "Clay render preset example",
    prompt:
      "A handcrafted stop-motion clay-render portrait of the subject in the reference photo. Preserve the person's facial likeness, hairstyle, facial hair, pose, and clothing in sculpted clay. Tactile plasticine surfaces, soft rounded forms, studio spotlighting, claymation artistry, 8k resolution.",
  },
  {
    slug: "pixart",
    label: "Pixart",
    description: "Bright, expressive family-animation styling with polished 3D charm.",
    thumbnailPath: "/pixart-example.png",
    thumbnailAlt: "Pixart preset example",
    prompt:
      "A vibrant, cheerful 3D family-animation character illustration of the subject in the reference photo. Preserve the person's facial features, hair, expression, clothing, and posture. Expressive friendly character design, Pixar 3D aesthetic, warm rim lighting, high-fidelity render.",
  },
  {
    slug: "voxel-block",
    label: "Voxel Block",
    description: "Chunky block-built styling with playful forms and pixel-crafted depth.",
    thumbnailPath: "/voxel-block-example.png",
    thumbnailAlt: "Voxel block preset example",
    prompt:
      "A detailed 3D voxel block-art portrait of the subject in the reference photo. Transform the person's hairstyle, facial features, and clothing into stylized cubic pixel geometry. Bright game-like ambient lighting, Minecraft and voxel art aesthetic, 8k render.",
  },
  {
    slug: "marble-sculpture",
    label: "Marble Sculpture",
    description: "Elegant carved-stone portraiture with refined texture and museum lighting.",
    thumbnailPath: "/marble-sculpture-example.png",
    thumbnailAlt: "Marble sculpture preset example",
    prompt:
      "A museum-quality classical Roman marble sculpture portrait of the subject from the reference photo. Meticulously carve the person's facial structure, hair, facial hair, and posture into polished white marble with delicate chiselled stone texture and soft gallery lighting.",
  },
];

export function getStylePreset(slug: string) {
  return stylePresets.find((preset) => preset.slug === slug);
}
