<<<<<<< HEAD
# StudyBuddy
StudyBuddy is an AI-powered study companion that helps students turn messy notes into structured knowledge, track their learning progress, and never forget what they study. It intelligently schedules revisions, identifies weak areas, and provides personalized explanations—acting like a smart system that adapts to how you learn.
=======
# Study Buddy

Study Buddy is now scaffolded as a PC-first MERN-style app with:

- `apps/web`: React + Vite + React Router
- `apps/api`: Node.js + Express
- `packages/shared`: shared study engine types and UI contracts

The UI is dark themed and designed around a GPT-like study workflow:
- Ask Buddy
- capture notes fast
- generate roadmaps
- build a daily return habit through reminders and streaks

## Current Status

Implemented and verified:

- workspace monorepo setup
- dark web shell and navigation
- auth pages and protected app shell
- notes flow with server-side Gemini analysis fallback
- Buddy chat route
- roadmap generation route
- reminders and dashboard routes
- in-memory development store
- Mongo-ready data abstraction for later Atlas setup

Checks passed:

- `npm run typecheck`
- `npm run build`
- API smoke test: `GET /api/health` returned `{"status":"ok","database":"memory"}`

## Run On Your PC

Open a terminal in:

```bat
cd /d "D:\Projects\Personal Notes AI"
```

Install dependencies:

```bat
npm.cmd install
```

Start both web and API together:

```bat
npm.cmd run dev
```

Then open:

- Web app: `http://localhost:5173`
- API health: `http://localhost:4000/api/health`

You can also run them separately:

```bat
npm.cmd run dev:web
npm.cmd run dev:api
```

## Gemini Setup

Create an API env file from the example:

```bat
copy apps\api\.env.example apps\api\.env
```

Then put your Gemini key in:

```env
GEMINI_API_KEY=your_real_gemini_key_here
```

Optional values:

```env
PORT=4000
CLIENT_URL=http://localhost:5173
JWT_SECRET=change-me-in-production
GEMINI_MODEL=gemini-2.5-flash-lite
MONGODB_URI=
MONGODB_DB=studybuddy
```

If `GEMINI_API_KEY` is missing:

- notes still save
- Buddy chat falls back gracefully
- roadmap generation returns a helpful error instead of crashing the app

## MongoDB Setup Later

Right now the API runs in memory mode if `MONGODB_URI` is empty.

To switch to MongoDB Atlas later, set:

```env
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=studybuddy
```

Then restart the API.

## Main Workspace Scripts

At the repo root:

- `npm run dev`
- `npm run dev:web`
- `npm run dev:api`
- `npm run typecheck`
- `npm run build`

## Notes

- The old Expo prototype files still exist in the repo, but the new active stack is the MERN-style workspace under `apps/` and `packages/`.
- For public sharing later, keep Gemini server-side only. Do not expose the key in the browser.
>>>>>>> a420bce (Initial Study Buddy web platform)
