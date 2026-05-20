## GitHub Actions Setup - Quick Reference

**Status:** Ready to deploy ✅

### What Changed
- ✅ `/api/worker/trigger` - New endpoint to trigger worker immediately
- ✅ `/api/generate` - Now calls `/api/worker/trigger` after queuing
- ✅ Workflow updated - Runs every 3 min + on-demand triggers

### Expected Performance
- **With GitHub Token**: 30-60 sec to processing
- **Without Token**: ~3 min max (scheduled)
- **Total time to generated image**: 1-3 minutes

---

## DO THIS NOW (10 min setup)

### 1. Generate GitHub Token
```
GitHub.com
  → Your profile (top-right)
  → Settings
  → Developer settings
  → Personal access tokens
  → Tokens (classic)
  → Generate new token (classic)
  
Name: digichefs-worker-trigger
Scope: ✅ repo
Expires: 90 days
COPY THE TOKEN (see only once!)
```

### 2. Add 9 Secrets to GitHub
```
Go to: https://github.com/Rahul-Aitla/Tryit
  → Settings
  → Secrets and variables
  → Actions
  → New repository secret

Add each:
  GH_WORKER_TOKEN = (from .env)
  DATABASE_URL = (from .env)
  DIRECT_URL = (from .env)
  REDIS_URL = (from .env)
  GCS_BUCKET_NAME = (from .env)
  GCS_PROJECT_ID = (from .env)
  GCS_CLIENT_EMAIL = (from .env)
  GCS_PRIVATE_KEY = (from .env)
  NANO_BANANA_API_KEY = (from .env)
```

### 3. Update .env
```
# frontend/.env
NEXT_PUBLIC_APP_URL="https://digichefs.vercel.app"
```

### 4. Commit & Push
```bash
cd frontend
git add .
git commit -m "Deploy worker with immediate job triggering"
git push origin main
```

### 5. Verify in GitHub
```
Go to GitHub repo → Actions
Should see: AI Generation Worker
Click it → verify runs every 3 minutes
```

---

## Test It
1. Go to your frontend
2. Submit a generation job
3. Check GitHub Actions
4. Should see workflow trigger within 30 seconds
5. Monitor logs for "Job Processing"

---

## Files Modified
- `app/api/worker/trigger/route.ts` (NEW)
- `app/api/generate/route.ts` (UPDATED)
- `.github/workflows/worker.yml` (UPDATED - 3 min schedule)

See `GITHUB_ACTIONS_SETUP.md` for full details
