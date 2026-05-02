# Deployment Guide

This repo is set up to deploy as:

- `frontend` on Vercel
- `backend` on Render

## What Was Added

- `frontend/vercel.json` adds SPA rewrites so client-side routes like `/dashboard` do not 404 on refresh.
- `render.yaml` adds a Render Blueprint for the API service.
- The API now accepts multiple frontend origins via `CLIENT_ORIGIN` and optional regex preview matching via `CLIENT_ORIGIN_REGEX`.
- The API now binds on `0.0.0.0`, which is safer for Render web services.

## Before You Deploy

1. Create a MongoDB database and copy the connection string.
2. Decide your frontend production URL or custom domain.
3. Decide whether you want Vercel preview deployments to call the API.

## Render Deployment

Recommended order: deploy the API first.

### Option A: Use `render.yaml`

1. Push this repo to GitHub.
2. In Render, create a new Blueprint from the repo.
3. Review the generated `studybuddy-api` service.
4. Fill in the prompted secret values:
   - `CLIENT_ORIGIN`
   - `MONGODB_URI`
   - `GROQ_API_KEY` if you want roadmap and copilot AI responses
   - `HUGGINGFACE_API_KEY` if you want remote embeddings instead of the local fallback

### Option B: Configure Render manually

- Root directory: repo root
- Build command: `npm install && npm run build --workspace @studybuddy/shared && npm run build --workspace @studybuddy/api`
- Start command: `npm run start --workspace @studybuddy/api`
- Health check path: `/health`

### Render env vars

Required:

- `CLIENT_ORIGIN=https://your-frontend-domain.vercel.app`
- `MONGODB_URI=...`

Recommended:

- `NODE_ENV=production`
- `PORT=10000`
- `LOG_LEVEL=tiny`

Optional:

- `CLIENT_ORIGIN_REGEX=^https://.*\\.vercel\\.app$`
  Use this only if you want preview deployments to call the API without updating `CLIENT_ORIGIN` every time.
- `GROQ_API_KEY=...`
  Required for roadmap generation and copilot chat.
- `HUGGINGFACE_API_KEY=...`
  Optional because the app falls back to a local embedding strategy.
- `GOOGLE_GEMINI_API_KEY=...`
  Not used by the current code yet.

## Vercel Deployment

Deploy the frontend after the Render API is live.

1. Import the same repo into Vercel as a separate project.
2. Set the Root Directory to `frontend`.
3. Add this environment variable:
   - `VITE_API_BASE_URL=https://your-render-service.onrender.com/api`
4. Deploy.

### Notes

- `frontend/vercel.json` is already in place for SPA routing.
- If you add a custom frontend domain later, update Render `CLIENT_ORIGIN` to match it.
- If you change the Render API URL, update `VITE_API_BASE_URL` in Vercel and redeploy.

## Safe First-Deploy Order

1. Deploy Render.
2. Confirm `https://your-render-service.onrender.com/health` returns JSON.
3. Set `VITE_API_BASE_URL` in Vercel to that Render URL plus `/api`.
4. Deploy Vercel.
5. If the frontend domain changed after deploy, update Render `CLIENT_ORIGIN`.

## Quick Smoke Test

- Frontend loads on Vercel.
- Refreshing a nested route like `/dashboard` still works.
- Render `/health` responds with `200`.
- Signup/login works against the deployed API.
- If `GROQ_API_KEY` is configured, roadmap/copilot endpoints return responses.
