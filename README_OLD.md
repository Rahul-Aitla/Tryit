# Tryit — AI Outfit Image Generation Tool

A high-performance AI fashion generation platform built with Next.js 15, Supabase, and Google Cloud Storage.

## 🚀 Features

- **Multi-Image & ZIP Upload**: Batch upload garments or extract images from ZIP files locally.
- **Organized GCS Storage**: Automatic folder structure (`/outfits`, `/references`, `/generated`) in Google Cloud Storage.
- **Structured Prompt Engine**: Advanced prompting that separates garment preservation from creative direction.
- **Async Queue System**: Scalable background processing using BullMQ and Redis.
- **Live Dashboard**: Real-time status tracking and project performance analytics.
- **Output Gallery**: Before/after comparisons, categorical filtering, and easy downloads.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), Tailwind CSS, Framer Motion, Lucide Icons.
- **Database**: Supabase (PostgreSQL) with Prisma ORM.
- **Storage**: Google Cloud Storage.
- **Queue**: BullMQ & ioredis (via Upstash Redis).
- **AI Model**: Nano Banana 2 (Simulated integration).

## 📋 Setup & Architecture

### 1. Environment Variables
Create a `.env` file with the following:
```bash
# Supabase Database
DATABASE_URL="postgresql://postgres.[REF]:[PASS]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASS]@db.[REF].supabase.co:5432/postgres"

# Upstash Redis (TCP Protocol)
REDIS_URL="rediss://default:[PASS]@fitting-koi-127430.upstash.io:6379"

# Google Cloud Storage
GCS_BUCKET_NAME="your-bucket"
GCS_PROJECT_ID="your-project-id"
GCS_CLIENT_EMAIL="your-service-account-email"
GCS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# AI API
NANO_BANANA_API_KEY="your_api_key"
```

### 2. Database Sync
```bash
npx prisma generate
npx prisma db push
```

### 3. Start the Application
You need two terminals:
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: AI Worker
npm run worker
```

## 🧠 Consistency Logic
The tool preserves garment consistency through a **Structured Prompt Block**:
1. **Preservation Block**: Locked instructions for fabric, stitching, and seams.
2. **Creative Block**: Dynamic styling and aesthetic instructions.
3. **Reference Block**: Interpretive logic for lighting, pose, and background.

## ⚠️ Limitations
- **Worker Environment**: In local dev, ensure the worker is running alongside the Next.js server.
- **Cold Starts**: Initial generation might take 5-10 seconds due to worker initialization.
- **Storage Access**: Ensure GCS bucket "Public Access Prevention" is OFF for gallery rendering.

## 📦 Submission Requirements

Please submit the following items:

1. **Working Tool Link, Deployed Prototype, or Local Setup Files**
   - Deployed frontend: https://tryit-yourself.vercel.app
   - Local setup: Clone repository and follow Setup & Architecture section

2. **Source Code Repository**
   - GitHub: https://github.com/Rahul-Aitla/Tryit
   - Includes all frontend, worker, and configuration code

3. **Short Product Documentation**
   - See Tech Stack, Features, and Consistency Logic sections above
   - Deployment guide: `DEPLOYMENT.md`
   - Quick start: `QUICK_START.md`

4. **Setup Instructions**
   - **Local Setup**: Follow "📋 Setup & Architecture" section
   - **Google Cloud Console Setup**: 
     - Enable Cloud Storage, Cloud Build, and Cloud Run APIs
     - Create service account and download JSON key
     - Configure `GCS_*` environment variables with key details
   - **Nano Banana 2 Integration**: 
     - Sign up at https://www.banana.dev/
     - Obtain API key and set `NANO_BANANA_API_KEY`
     - See `server/ai/nanoBanana.ts` for integration implementation

5. **Sample Input Outfit Images and Reference Images**
   - Uploaded through the tool's upload interface
   - Organized in GCS: `/outfits` and `/references` folders
   - Examples available in project gallery after test runs

6. **Sample Generated Outputs**
   - Available in deployed tool's gallery section
   - Before/after comparisons visible in dashboard
   - Downloadable from output gallery interface

7. **Explanation of Outfit Consistency Maintenance**
   - **Structured Prompt Block System**:
     - Preservation Block: Locked instructions preserve fabric texture, stitching, seams, and garment shape
     - Creative Block: Dynamic styling and aesthetic variations while maintaining consistency
     - Reference Block: Uses uploaded reference images for consistent interpretation of lighting, pose, and background
   - Implementation: `server/prompts/promptEngine.ts` constructs layered prompts that prioritize garment preservation
   - AI Model: Nano Banana 2 (GPT-4 Vision) interprets the structured prompts to maintain consistency

8. **Explanation of Nano Banana 2 Integration**
   - **Service**: Banana.dev provides serverless GPU inference for generative AI models
   - **Implementation** (`server/ai/nanoBanana.ts`):
     - Sends structured prompts with uploaded outfit and reference images
     - Receives generated images as base64-encoded outputs
     - Integrates with BullMQ queue system for async processing
   - **Flow**: Upload → Prompt Generation → Banana API Call → Image Processing → GCS Storage → Gallery Display
   - **Configuration**: API key stored securely in environment variables

9. **Known Limitations and Possible Improvements**
   - **Current Limitations**:
     - Worker cold starts (5-10s initialization on first generation)
     - Nano Banana 2 API rate limiting (handled via queue)
     - Single outfit image input per generation
     - Image processing limited by GPU availability
   - **Possible Improvements**:
     - Multi-outfit combination support
     - Advanced style transfer parameters
     - Batch processing for bulk generations
     - Custom model fine-tuning for specific fashion styles
     - Real-time preview during processing
     - Advanced color palette preservation options

10. **Assumptions Made During Build**
    - Assumes GCS bucket is publicly accessible for gallery rendering (can be restricted with authentication)
    - Assumes Supabase connection pooler is available (pgBouncer configuration)
    - Assumes Redis connection via Upstash is stable (TCP protocol recommended)
    - Assumes Nano Banana 2 API maintains 99% uptime availability
    - Assumes Next.js 15+ with Turbopack enabled for optimal performance
    - Assumes worker runs continuously or on scheduled intervals (GitHub Actions or Cloud Run)

## ❌ What Not To Do

Avoid the following mistakes. These will reduce the quality of the submission even if the images look visually attractive:

- **Do not use a generic text prompt without using the uploaded outfit image as the product reference.**
  - ❌ Wrong: "Create a fashionable outfit in summer style"
  - ✅ Correct: Use uploaded outfit image as primary reference, guide styling with text prompts
  - The tool explicitly uses the uploaded outfit image as the main visual reference to ensure consistency

- **Do not skip the preservation block in prompting**
  - Without locked preservation instructions, the AI may drastically alter the garment structure
  - Always include fabric, stitching, and shape preservation in the prompt

- **Do not ignore environment variable configuration**
  - Missing GCS credentials will cause storage failures
  - Missing Nano Banana API key will cause generation failures
  - Verify all variables are set before running

- **Do not deploy without database synchronization**
  - Run `npx prisma db push` before deployment
  - Without schema sync, API endpoints will fail with database errors

- **Do not use generic reference images**
  - Reference images should be contextually relevant to desired output
  - Generic stock photos reduce consistency quality
  - Use fashion-specific, high-quality reference images

- **Do not overlook the worker process**
  - Generations require the background worker running
  - Without worker, jobs queue but never process
  - Ensure GitHub Actions workflow or Cloud Run service is active

---
Built for the AI Outfit Image Generation Tool Assignment.
