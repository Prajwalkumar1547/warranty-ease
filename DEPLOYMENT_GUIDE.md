# 🚀 24/7 Cloud Deployment Guide for WarrantyEase OCR Backend

This guide explains in **simple, beginner-friendly steps** how to deploy your FastAPI + PaddleOCR backend to the cloud so that it runs **24 hours a day, 7 days a week**, completely independent of your Mac, laptop, or localhost.

---

## 🌟 Recommended Hosting Platform: Render.com

We recommend **[Render](https://render.com)** because:
- ✅ **Free / low-cost tier**
- ✅ **Runs Docker automatically** (pre-configured with PaddleOCR)
- ✅ **Free automatic SSL/HTTPS** (`https://...`)
- ✅ **Zero server maintenance** (connects directly to your GitHub repo)
- ✅ **Automatic rebuilds** whenever you push updates to GitHub

---

## 📋 Step-by-Step Deployment Instructions

### Step 1: Push Your Project to GitHub
Make sure your latest code (including the new `backend/Dockerfile`) is committed and pushed to your GitHub repository:
```bash
git add .
git commit -m "Add production Dockerfile and cloud readiness for OCR backend"
git push origin main
```

---

### Step 2: Create a Free Account on Render
1. Open your browser and go to: **[https://dashboard.render.com/register](https://dashboard.render.com/register)**
2. Click **"Sign up with GitHub"** (this connects your repositories automatically).

---

### Step 3: Create a New Web Service
1. On the Render Dashboard, click the blue button in the top right: **"New +"** → **"Web Service"**.
2. Under "Connect a repository", find your **`warranty-ease`** repository and click **"Connect"**.
3. Fill in the following simple fields:
   - **Name**: `warrantyease-ocr` (or any name you prefer)
   - **Region**: Choose the closest region (e.g., *Singapore* or *Frankfurt*)
   - **Root Directory**: `backend`
   - **Language / Runtime**: Choose **Docker**
   - **Instance Type**: Select **Free** (or Starter for higher memory)

---

### Step 4: Add Environment Variables
Scroll down to the **Environment Variables** section and click **"Add Environment Variable"**:

| Key | Value | Notes |
| :--- | :--- | :--- |
| `ALLOWED_ORIGINS` | `https://srishailampotti.github.io` | Allows your GitHub Pages site to call this backend |
| `AI_PROVIDER` | `none` *(or `gemini`)* | `none` uses offline rule-based AI, `gemini` uses Google Gemini |
| `GEMINI_API_KEY` | *(Your Gemini API Key)* | Optional (only if `AI_PROVIDER=gemini`) |
| `OCR_LANG` | `en` | Standard English language model |

---

### Step 5: Click Deploy!
1. Click the button at the bottom: **"Create Web Service"**.
2. Render will build the Docker container and pre-cache the PaddleOCR models.
3. Once completed (usually 2-3 minutes), you will see a green badge: **"Live"**.
4. Render will give you a public URL at the top of your page, like:
   ```
   https://warrantyease-ocr.onrender.com
   ```

---

### Step 6: Verify It's Working 24/7
Open a new browser tab and visit:
```
https://warrantyease-ocr.onrender.com/health
```
You should see:
```json
{
  "status": "ok",
  "service": "WarrantyEase OCR API",
  "version": "1.0.0",
  "ready": true
}
```

---

## 🔗 Step 7: Connect the Frontend to Your Cloud Backend

Now tell your frontend (hosted on GitHub Pages) to use your new cloud backend instead of `localhost:8000`:

### Option A: Via GitHub Repository Secrets (Automated)
1. Go to your GitHub repository: `https://github.com/srishailampotti/warranty-ease`
2. Click **Settings** → **Secrets and variables** → **Actions**.
3. Click **"New repository secret"** (or Environment secret):
   - **Name**: `VITE_OCR_BACKEND_URL`
   - **Value**: `https://warrantyease-ocr.onrender.com` *(your actual Render URL from Step 5)*
4. Next time GitHub Actions deploys the site, it will automatically connect to your 24/7 cloud backend!

### Option B: Local Build for Production
Create a `.env.production` file in your project folder:
```env
VITE_OCR_BACKEND_URL=https://warrantyease-ocr.onrender.com
```
Then run:
```bash
npm run build
```

---

## 💡 Notes on Cold Starts (Free Tier)
- On Render's free tier, the service sleeps after 15 minutes of inactivity.
- When a user uploads a document after it has been sleeping, the first request may take ~30-45 seconds to spin back up.
- Subsequent scans are instantaneous (< 50 milliseconds).
- If you upgrade to Render Starter ($7/month), the service never sleeps and is always hot 24/7.
