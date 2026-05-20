# GitHub Actions Worker Setup Guide

## What's Been Done

✅ **Modified `worker.ts`** - Added graceful shutdown handlers for SIGTERM/SIGINT  
✅ **Created `.github/workflows/worker.yml`** - Workflow that runs every 10 minutes

## How It Works

1. **Every 10 minutes**: GitHub Actions starts a new workflow
2. **Install & Setup**: Dependencies installed, Prisma generated
3. **Run Worker**: Worker runs for 8 minutes processing jobs from Redis queue
4. **Graceful Shutdown**: After 8 minutes, worker shuts down cleanly (closes connections)
5. **Workflow ends**: Total time ~9 minutes, well within GitHub's limits

## Setup Steps (5 minutes)

### Step 1: Add Secrets to GitHub

1. Go to your GitHub repo: `https://github.com/Rahul-Aitla/Tryit`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add each of these:

| Secret Name | Value |
|---|---|
| `DATABASE_URL` | From `.env` |
| `DIRECT_URL` | From `.env` |
| `REDIS_URL` | From `.env` |
| `GCS_BUCKET_NAME` | From `.env` |
| `GCS_PROJECT_ID` | From `.env` |
| `GCS_CLIENT_EMAIL` | From `.env` |
| `GCS_PRIVATE_KEY` | From `.env` |
| `NANO_BANANA_API_KEY` | From `.env` |

### Step 2: Commit and Push

```bash
git add .github/workflows/worker.yml
git add worker.ts
git commit -m "Add GitHub Actions worker deployment"
git push origin main
```

### Step 3: Verify

1. Go to GitHub repo → **Actions** tab
2. You should see "AI Generation Worker" workflow
3. Click it and verify it ran successfully
4. Check workflow runs every 10 minutes automatically

## Manual Trigger (Optional)

To test immediately:
1. Go to **Actions** tab
2. Click **AI Generation Worker**
3. Click **Run workflow** → **Run workflow**
4. Check the logs

## What Happens Each Run

### Success Flow ✅
```
[Worker] Processing Job abc123...
[Worker] Calling AI (NanoBanana)...
[Worker] Generated 3 images
[Worker] Saved images to DB
[Worker] Uploading to GCS...
[Worker] ✅ Job Completed
```

### Graceful Shutdown ✅
```
⏹️  Received SIGTERM, shutting down gracefully...
Closing worker...
✅ Worker closed
Disconnecting from Redis...
✅ Redis disconnected
✅ Graceful shutdown complete
```

## Monitoring

### Check Job Status
Visit your frontend: `/api/generate/status/[jobId]`

### View Workflow Logs
1. Go to GitHub repo → **Actions**
2. Click the latest workflow run
3. Click **AI Generation Worker** job
4. Scroll to see detailed logs

### Failed Jobs
If a job fails:
- BullMQ automatically retries 3 times (exponential backoff)
- Failed jobs are stored in Redis for inspection
- Check `checkJobs.mjs` for debugging:
  ```bash
  node checkJobs.mjs
  ```

## Limitations & Notes

⚠️ **Private Repo Limit**: GitHub Actions offers 2,000 minutes/month for private repos. Your worker uses ~150 min/month (10 min × 144 runs), so you're well under the limit.

✅ **No Cost**: Free tier includes unlimited workflows for public repos

✅ **Always Runs**: Workflow continues even if you close your laptop (runs on GitHub's servers)

✅ **Automatic**: No setup needed after initial secret configuration

## Troubleshooting

### "Secrets not found" Error
→ Make sure all 8 secrets are added to GitHub Settings

### "Connection refused" Error
→ Check that your Supabase/Upstash credentials are correct

### "No jobs processed" after 10 minutes
→ Run `/api/generate` from your frontend to queue a job first

### Workflow not starting
→ Check GitHub repo **Actions** → **Enable Actions** must be turned on

## Disabling Worker

If you need to stop the worker:
1. Go to GitHub repo **Settings** → **Actions**
2. Select **Disable all** 

Or delete `.github/workflows/worker.yml` and push.

## Next Steps

1. ✅ Commit the changes
2. ✅ Add all 8 secrets in GitHub
3. ✅ Verify first workflow run succeeds
4. ✅ Test by queueing a job from your frontend
