# Complete Step-by-Step Vercel Deployment Guide for RAIZO

This guide provides exhaustive, end-to-end instructions for deploying the **RAIZO** application to [Vercel](https://vercel.com).

---

## Architecture Overview

| Component | Technology | Recommended Host | Role |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | Next.js 16 (React 19, TypeScript, Tailwind) | **Vercel** (`vercel.com`) | Hosts the UI, 3D Welcome/Login Command Center, DAG Visualizer, and client experiences |
| **Backend API** | FastAPI (Python 3.11+, SQLite / PostgreSQL) | **Render / Railway / Cloud Run** | Handles server-side auth, DAG calculations, ReportLab PDF certificates, and AI agents |

---

## Pre-requisites Checklist

Before you begin, ensure you have:
1. A **GitHub account** ([github.com](https://github.com)).
2. A **Vercel account** ([vercel.com](https://vercel.com)) connected to your GitHub account.

---

## STEP 1: Push Your Code to GitHub

Open PowerShell or Terminal in your project root (`c:\Users\badal\Downloads\BADAL NEO\Raizo`):

```powershell
# 1. Stage all modified and new files
git add .

# 2. Commit the changes
git commit -m "feat: complete production vercel deployment configuration and 3d welcome experience"

# 3. Push to your GitHub repository
git push origin main
```

Verify that all files are up-to-date at your repository URL:
👉 `https://github.com/badalsahu200ns-png/raizo-edtech`

---

## STEP 2: Deploy the FastAPI Backend (Render or Railway)

Because Vercel provides a serverless Edge/Node.js environment, the Python FastAPI backend (`apps/api`) needs a live URL that the Vercel frontend can communicate with.

### Option A: Deploy on Render (Recommended - Free & Instant)

1. Go to [dashboard.render.com](https://dashboard.render.com) and log in with GitHub.
2. Click **New +** → **Web Service**.
3. Select your GitHub repository: `badalsahu200ns-png/raizo-edtech`.
4. Configure the Web Service settings:
   - **Name**: `raizo-api`
   - **Region**: Select closest to you (e.g. *Singapore*, *Oregon*, or *Frankfurt*)
   - **Branch**: `main`
   - **Root Directory**: Leave blank (root)
   - **Environment**: `Docker` (Render will automatically detect `apps/api/Dockerfile`)
     - *Alternative without Docker:*
       - Environment: `Python 3`
       - Build Command: `pip install -r apps/api/requirements.txt`
       - Start Command: `uvicorn apps.api.app.main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables in Render:
   - `GEMINI_API_KEY`: *(Your Google Gemini API Key, if available)*
   - `DATABASE_URL`: `sqlite:///raizo_learning.db`
   - `ALLOW_LOCAL_DEMO`: `true` (enables learner session access)
6. Click **Create Web Service**.
7. Once deployed, copy your API URL:
   `https://raizo-api.onrender.com`
   Your API endpoint is: `https://raizo-api.onrender.com/api`

---

## STEP 3: Deploy the Frontend to Vercel

1. Navigate to [vercel.com/new](https://vercel.com/new).
2. Under **Import Git Repository**, find:
   **`badalsahu200ns-png/raizo-edtech`** and click **Import**.
3. In the **Configure Project** screen:

### Project Settings
- **Project Name**: `raizo-edtech` (or your preferred name)
- **Framework Preset**: Select **`Next.js`**
- **Root Directory**: 
  - Click **Edit** next to Root Directory.
  - Select **`apps/web`** and click **Continue**.
  *(This instructs Vercel to build the Next.js application inside the `apps/web` workspace folder).*

### Build and Output Settings
- Leave all toggles on their defaults (Vercel automatically detects Next.js build commands from `package.json`).
  - Build Command: `next build`
  - Output Directory: `.next`
  - Install Command: `npm install`

### Environment Variables
Expand the **Environment Variables** section and add the following:

| Key | Value | Notes |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://raizo-api.onrender.com/api` | Replace with your live backend API URL |

4. Click the blue **Deploy** button.

---

## STEP 4: Verification & Post-Deployment Checklist

Vercel will build the application in approximately 1 to 2 minutes. When completed, you will see the celebration screen with your live deployment URL (e.g. `https://raizo-edtech.vercel.app`).

### Verify the Live Site
1. Visit your Vercel URL: `https://raizo-edtech.vercel.app`.
2. Check the **Welcome Page**:
   - Hero title: *"Welcome to RAIZO"*
   - Subtitle: *"Learn. Practice. Prove. Prepare for your Career."*
   - Interactive 3D Education & AI emblem and tilt cards.
3. Test **Session Sign-In**:
   - Click **"Start Learning Session"**.
   - Verify that your learner session authenticates and securely redirects to `/dashboard`.
4. Check **Trust Badges & Security**:
   - Confirm SSL padlock (`HTTPS`) is active.

---

## Automatic Continuous Deployment (CI/CD)

Every time you run `git push origin main`, Vercel will automatically build and deploy the update with zero downtime.
