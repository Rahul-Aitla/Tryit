# 🚀 Tryit Deployment Guide

This guide explains how to deploy the **Tryit** platform to production.

## 🏗️ Architecture Overview
- **Frontend**: Next.js (App Router) deployed on **Vercel**.
- **Background Worker**: BullMQ generation worker deployed on **Render**.
- **Database**: PostgreSQL (Supabase).
- **Queue**: Redis (Upstash).
- **Storage**: Google Cloud Storage (GCS).

---

## 1. ⚡ Frontend Deployment (Vercel)

1. **Connect Repository**: Push your code to GitHub/GitLab and connect it to a new project on [Vercel](https://vercel.com).
2. **Build Settings**:
   - Framework Preset: `Next.js`
   - Build Command: `npm run build` (This automatically runs `prisma generate`).
3. **Environment Variables**: Add all keys from your `.env` to Vercel's Environment Variables settings.

---

## 2. ⚙️ Backend Worker Deployment (Render)

1. **Create New Service**: On [Render](https://render.com), click **New +** and select **Background Worker**.
2. **Connect Repository**: Link the same repository.
3. **Docker Configuration**:
   - Render will detect the `Dockerfile.worker`.
   - Ensure the "Docker File Path" is set to `Dockerfile.worker` (if not detected automatically).
4. **Environment Variables**:
   - Copy all variables from `.env`.
   - **CRITICAL**: Ensure `DIRECT_URL` is used for Prisma to bypass connection pooling issues if using Supabase/Neon.

---

## 🔑 Required Environment Variables

Ensure these are set on both Vercel and Render:

| Variable | Description |
| :--- | :--- |
| `DATABASE_URL` | Prisma connection string (with PGBouncer if applicable) |
| `DIRECT_URL` | Direct Prisma connection string (Required for migrations/workers) |
| `REDIS_URL` | Upstash Redis connection string (`rediss://...`) |
| `GCS_BUCKET_NAME` | Your Google Cloud Storage bucket name |
| `GCS_PROJECT_ID` | Your GCP project ID |
| `GCS_CLIENT_EMAIL` | GCP Service Account email |
| `GCS_PRIVATE_KEY` | GCP Service Account private key (with `\n` preserved) |
| `NANO_BANANA_API_KEY` | Your AI Generation API Key |

---

## 🛠️ Post-Deployment Checklist
1. **Database Migrations**: Run `npx prisma db push` locally once to ensure the production DB schema is ready.
2. **Dependency Conflicts**: If you see `ERESOLVE` errors during build, ensure `.npmrc` is present with `legacy-peer-deps=true` (already included in the project).
3. **CORS**: If you encounter issues with images, ensure your GCS bucket allows the Vercel domain in its CORS configuration.
3. **Worker Logs**: Check Render logs to ensure the worker says `✅ Worker is listening for jobs`.
