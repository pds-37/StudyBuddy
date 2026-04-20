# StudyBuddy AI Career Copilot

StudyBuddy is being rebuilt as a web-first AI Career Copilot for students and early-career professionals. This repository is now scaffolded for the new product direction only.

This step intentionally includes:
- the monorepo structure
- package manifests
- environment templates
- placeholder frontend/backend/shared files
- documentation for where each feature will live

This step intentionally does **not** include:
- database schema implementation
- auth logic
- AI integrations
- feature logic

Those will come only after you approve this scaffold.

## Stack

- Frontend: React.js, TailwindCSS, React Router, Axios, Zustand
- Backend: Node.js, Express.js, MongoDB via Mongoose
- Auth: JWT + bcrypt
- AI: Groq, Google Gemini Flash, HuggingFace
- Hosting: Vercel (frontend), Render (backend)
- Shared: TypeScript package for shared types and Zod schemas

## Repository Layout

```text
.
+-- backend/                 # Express backend scaffold
|   +-- src/
|   |   +-- config/         # Env parsing, DB bootstrap
|   |   +-- middlewares/    # Express middleware placeholders
|   |   +-- modules/        # Feature-first backend modules
|   |   +-- routes/         # Root router composition
|   |   +-- scripts/        # Seed/import scripts
|   |   +-- services/       # AI, vector, and cache service placeholders
|   |   +-- types/          # Express/global TS types
|   |   +-- utils/          # Shared backend utilities
|   |   +-- app.ts          # Express app setup
|   |   +-- server.ts       # Server entrypoint
|   +-- .env.example        # Backend env template
|   +-- package.json        # Backend dependencies/scripts
|   +-- tsconfig.json       # Backend TS config
+-- frontend/                # React frontend scaffold
|   +-- public/             # Static assets
|   +-- src/
|   |   +-- assets/         # App-local visual assets
|   |   +-- components/     # Reusable UI, nav, feedback shells
|   |   +-- features/       # Feature folders for auth, roadmap, notes, jobs, copilot
|   |   +-- hooks/          # Custom hooks placeholder zone
|   |   +-- layouts/        # Marketing and app shell layouts
|   |   +-- lib/            # API client, env helpers, utility functions
|   |   +-- pages/          # Route-level pages
|   |   +-- providers/      # React Query and router providers
|   |   +-- router/         # Router config and protected route wrapper
|   |   +-- store/          # Zustand root store
|   |   +-- types/          # Frontend-only types
|   |   +-- App.tsx         # App root
|   |   +-- index.css       # Tailwind entry + theme tokens
|   |   +-- main.tsx        # Vite mount point
|   +-- .env.example        # Frontend env template
|   +-- index.html          # Vite HTML entry
|   +-- package.json        # Frontend dependencies/scripts
|   +-- postcss.config.cjs
|   +-- tailwind.config.cjs
|   +-- tsconfig.json
|   +-- tsconfig.node.json
|   +-- vite.config.ts
+-- docs/
|   +-- scaffold-notes.md    # High-level scaffold notes for the solo-dev build
+-- packages/
|   +-- shared/              # Shared TS types and Zod schemas
|       +-- src/
|       |   +-- constants/   # Cross-app constants
|       |   +-- schemas/     # Shared Zod schemas
|       |   +-- types/       # Shared domain types
|       |   +-- index.ts
|       +-- package.json
|       +-- tsconfig.json
+-- .env.example             # Combined env reference for the whole system
+-- .gitignore
+-- package.json             # Workspace root scripts
+-- tsconfig.base.json       # Shared TS compiler base
+-- tsconfig.json            # Root TS references
```

## Folder Intent By Feature

- `frontend/src/features/auth`: signup, login, token persistence, guards
- `frontend/src/features/onboarding`: initial user profile and skill input
- `frontend/src/features/profile`: profile editing and role targeting
- `frontend/src/features/skill-gap`: gap analysis UI and visualizations
- `frontend/src/features/roadmap`: roadmap generation and timeline UI
- `frontend/src/features/notes`: note capture, resource tagging, RAG context
- `frontend/src/features/jobs`: job feed and job matching UI
- `frontend/src/features/copilot`: AI career chat workspace

- `backend/src/modules/auth`: auth controllers, routes, validation, services
- `backend/src/modules/users`: user profile data and onboarding persistence
- `backend/src/modules/notes`: career notes CRUD and tagging
- `backend/src/modules/roadmaps`: roadmap storage and generation endpoints
- `backend/src/modules/jobs`: cached jobs and match scoring
- `backend/src/modules/skills`: O*NET taxonomy and skill lookup endpoints
- `backend/src/modules/copilot`: career chat and RAG orchestration

## Environment Setup

1. Copy the root example file if you want a single checklist:
   - `.env.example`
2. Create app-specific files when you start local development:
   - `backend/.env`
   - `frontend/.env.local`

## Workspace Commands

Install everything from the repo root:

```bash
npm install
```

Start both apps:

```bash
npm run dev
```

Start only the frontend:

```bash
npm run dev:web
```

Start only the backend:

```bash
npm run dev:api
```

## What To Review Now

For this step, please review:
- the folder structure
- the package choices
- the env variable list
- the frontend/backend/shared split

Once you approve this scaffold, I will stop here and move to **Step 3: Database Schema** exactly as requested.
