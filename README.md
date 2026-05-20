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

---
Built for the AI Outfit Image Generation Tool Assignment.
