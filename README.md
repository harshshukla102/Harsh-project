<div align="center">

# 🎨 LUMA STUDIO – AI Image Restyler & Character Generation Platform

An advanced, full-stack AI Image Restyling and Character Transformation SaaS built with **Next.js 16 (App Router)**, **React 19**, **Google Gemini AI SDK**, **Neon PostgreSQL**, and **Tailwind CSS**.

Upload any portrait or photo and transform it into handcrafted artistic styles while accurately preserving facial features, hairstyle, facial hair, expressions, and outfit colors.

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-AI%20SDK-orange?style=flat&logo=google)](https://ai.google.dev/)
[![Neon Database](https://img.shields.io/badge/Neon-PostgreSQL-green?style=flat&logo=postgresql)](https://neon.tech/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%20v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

---

</div>

## 🌟 Key Features

- 🧠 **Google Gemini Multimodal Vision AI (`@google/genai`):**
  - **"✨ Auto-Detect with Gemini"**: In one click, Gemini 2.5 Flash Vision inspects your photo and automatically extracts facial likeness, hair structure, beard/mustache, clothing type, colors, and pose.
  - Ensures accurate character and clothing preservation (no random or mismatched results).
- 🎭 **6 Handcrafted Style Presets:**
  - **Storybook 3D:** Polished Disney/Pixar 3D animated character finish with warm cinematic lighting.
  - **Anime Cel:** High-end Japanese studio animation with clean linework and expressive cel shading.
  - **Clay Render:** Handcrafted stop-motion claymation texture with sculpted plasticine forms.
  - **Pixart:** Family-friendly 3D character design with charming expressive charm.
  - **Voxel Block:** Cubic block-world geometry and pixel-crafted lighting (Minecraft/voxel aesthetic).
  - **Marble Sculpture:** Classical Roman carved-stone portraiture with museum gallery lighting.
- ⚡ **Google Gemini AI Engine Models:**
  - **Google Gemini 2.5 Flash** (Recommended / Fast & High Accuracy)
  - **Google Gemini 2.5 Pro** (Studio Frontier Quality)
  - **Google Gemini 2.5 Flash Image** (Google Native Image Generator)
  - **Google Gemini 3.1 Flash Image** (Next-Gen Multimodal)
- 🚀 **1-Click Guest Login & Custom Auth:**
  - Instant **Guest Access** — users can start generating simply by entering their name (no email or password required!).
  - Full email/password registration and login powered by custom JWT (`jose`) and secure password hashing (`bcryptjs`).
- 📂 **PostgreSQL Database + Drizzle ORM:**
  - Serverless PostgreSQL hosted on Neon.
  - Type-safe schema for `users` and `generations` with automated relational queries.
- 🎨 **Modern Interactive Studio UI:**
  - Responsive side-by-side **Original vs Result** comparison.
  - Intelligent placeholder state (never shows confusing default examples as results).
  - 1-Click high-resolution image download.
  - Personal generation history gallery with modal preview dialog.
- 🚫 **Zero Watermarks & Clean Outputs:**
  - All generations are synthesized cleanly with zero third-party logos or branding.

---

## 🏗️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16 (Turbopack, App Router)](https://nextjs.org/) |
| **Frontend** | [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/) |
| **AI SDK** | [Google Gen AI SDK (`@google/genai`)](https://www.npmjs.com/package/@google/genai) |
| **Database** | [Neon PostgreSQL](https://neon.tech/) with [Drizzle ORM](https://orm.drizzle.team/) |
| **Authentication** | Custom Edge-compatible JWT using [jose](https://github.com/panva/jose) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js) |
| **Image Processing** | [Sharp](https://sharp.pixelplumbing.com/) & Public CDN Bridge |
| **Icons & Motion** | [Lucide React](https://lucide.dev/), [Motion](https://motion.dev/) |

---

## 📂 Project Architecture

```
ai-image-project/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── guest/route.ts       # 1-Click Guest authentication
│   │   │   ├── login/route.ts       # Email + Password login
│   │   │   ├── logout/route.ts      # Session termination
│   │   │   ├── me/route.ts          # Current authenticated user session
│   │   │   └── register/route.ts    # User signup
│   │   ├── describe-image/route.ts  # Gemini Vision analysis API
│   │   ├── generate-image/route.ts  # Core AI Restyling pipeline
│   │   └── upload/route.ts          # Image upload helper endpoint
│   ├── login/page.tsx               # Sign in & Guest access page
│   ├── register/page.tsx            # Sign up page
│   ├── studio/page.tsx              # Main AI creation studio workbench
│   ├── globals.css                  # Global styles & studio design tokens
│   ├── layout.tsx                   # Root layout & font configurations
│   └── page.tsx                     # Landing page with hero & showcase
├── components/
│   ├── studio/
│   │   ├── controls-panel.tsx       # Image upload, style selection, & AI controls
│   │   ├── history-preview-dialog.tsx # Modal dialog for inspecting past renders
│   │   ├── preview-panel.tsx        # Side-by-side original & result comparison
│   │   ├── workbench-ui.tsx         # Preset cards, result frames, & history cards
│   │   └── workbench.tsx            # Studio form wrapper
│   ├── HomeHeroSection.tsx          # Landing page hero with animated badges
│   ├── GalleryShowcaseSection.tsx   # Curated community showcases
│   └── UserDropdown.tsx             # Profile menu & logout control
├── context/
│   └── StudioWorkbenchContext.tsx   # Global studio state & Gemini auto-detect
├── db/
│   ├── generations.ts               # Database operations for saved generations
│   ├── schema.ts                    # Drizzle schema (users & generations)
│   └── users.ts                     # User persistence & password verification
├── lib/
│   ├── auth.ts                      # JWT creation, verification & cookies
│   ├── gemini.ts                    # Google Gen AI SDK client & vision helper
│   ├── public-upload.ts             # Public CDN bridge for image reference
│   ├── style-presets.ts             # 6 Handcrafted artistic style presets
│   └── types.ts                     # Core TypeScript interfaces
└── proxy.ts                         # Edge route protection & auth gate
```

---

## ⚙️ Environment Variables Setup

Create a `.env` file in the root of your project with only these 3 required variables:

```env
# Database: Neon Serverless PostgreSQL
DATABASE_URL="postgresql://<user>:<password>@<host>/<dbname>?sslmode=require"

# Custom JWT Secret (minimum 32 random characters)
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"

# Google Gemini API Key (from Google AI Studio: https://aistudio.google.com/)
GEMINI_API_KEY="your-gemini-api-key"
```

---

## 🚀 Getting Started Locally

### 1. Clone the repository
```bash
git clone https://github.com/Raghavv07/ai-image-studio-nextjs-project.git
cd ai-image-studio-nextjs-project
```

### 2. Install dependencies
```bash
npm install
```

### 3. Push database schema to Neon
```bash
npm run db:push
```

### 4. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploying to Vercel

1. Push your repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and click **"Add New..." > "Project"**.
3. Select and import your GitHub repository.
4. Under **"Environment Variables"**, add:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
5. Click **"Deploy"**. Vercel will build and deploy your application in under 2 minutes!

---

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
