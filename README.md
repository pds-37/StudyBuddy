<div align="center">

# 🎓 StudyBuddy
### Powered by **Veda AI**

*An AI-powered Cognitive Career Operating System for modern students, self-learners, and aspiring engineers.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-Vite-blue.svg)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen.svg)](https://mongodb.com/)

</div>

---

## 🌟 What is StudyBuddy?

StudyBuddy is **not** just another roadmap app, notes tool, or job board.

> It is a **fully adaptive AI Cognitive Career Operating System** that evolves with every student.

The platform continuously understands how users learn, where they struggle, what they forget, how their interests evolve, and which career opportunities realistically fit them — combining all of this into one unified, intelligent system.

---

## ✨ Core Features

### 🧠 Veda AI — Adaptive Career Mentor
A context-aware AI mentor that knows your roadmap, notes, projects, resume, and learning patterns. Veda acts as your strategic mentor, learning coach, roadmap planner, and career guide — all in one.

- Answers questions using your own personal notes
- Detects burnout and rebalances your roadmap
- Suggests projects and interview preparation
- Generates adaptive, personalized learning paths

### 🗺️ Adaptive Multi-Track Roadmaps
Dynamic AI roadmaps tailored to your skill level, learning velocity, available time, and career goals — with full support for parallel tracks.

```
Frontend Engineering  +  AI Foundations  +  System Design
→ All simultaneously, without resetting existing progress
```

### 🧠 AI Knowledge Intelligence System
Transforms your notes into an **active cognitive memory system** — not just storage.

- Semantic search across all your notes
- Tracks memory decay and predicts forgetting
- Generates active recall prompts
- Builds knowledge graphs linking concepts to projects

### 📊 AI Skill Gap Intelligence
Continuously compares your skills, projects, and roadmap progress against real industry hiring patterns to generate:
- Readiness scores
- Missing skill detection
- Interview weakness analysis
- Personalized improvement plans

### 💼 AI Career Opportunity Engine
An intelligent opportunity matching and readiness engine — not a generic job board.
- Matches opportunities to your actual readiness
- Provides ATS alignment analysis
- Generates rejection recovery roadmaps
- Tracks market trend intelligence

### 📄 AI Resume Intelligence System
A contextual AI-powered resume strategist that lets you maintain multiple role-specific versions.

```
Frontend Resume  |  AI Resume  |  Startup Resume  |  Internship Resume
```

- ATS analysis and JD keyword extraction
- Resume vs job gap analysis
- Bullet point impact rewriting
- Interview alignment prediction

### 🔁 Adaptive Recall & Memory System
Spaced repetition powered by forgetting curve analysis to continuously reinforce weak concepts and interview-critical topics.

### 🧩 Hybrid Career Intelligence
Intelligently detects emerging hybrid career paths:

| Track Combination | Detected Role |
|---|---|
| Frontend + AI | AI Frontend Engineer |
| Backend + DevOps | Cloud Infrastructure Engineer |
| AI + Cybersecurity | AI Security Engineer |

### 💻 Offline-First C++ Sync Agent
A high-performance C++17 CLI agent for local-first workflows, Obsidian/VS Code users, and terminal-based learning.

---

## 🏗️ Architecture

```
studybuddy/
├── /frontend              # React + Vite SPA
├── /backend               # Node.js + Express API
│   └── /cpp-agent         # C++17 Offline Sync Agent
└── /packages/shared       # Shared TypeScript types & Zod schemas
```

### Frontend
`React` · `Vite` · `TailwindCSS` · `Framer Motion` · `Zustand` · `Lucide Icons`

### Backend
`Node.js` · `Express.js` · `MongoDB` · `Mongoose` · `Zod` · `JWT`

### AI Stack
| Model | Used For |
|---|---|
| **Groq** | Low-latency mentor chat, conversational reasoning, realtime roadmap assistance |
| **Google Gemini** | Roadmap generation, long-term planning, adaptive curriculum structuring |
| **HuggingFace** | Semantic embeddings, note understanding, retrieval & knowledge graph systems |

### CLI Agent
`C++17` · `CPR` · `Nlohmann JSON`

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB
- CMake *(for C++ Agent)*

### 1. Clone & Configure

```bash
git clone https://github.com/your-username/studybuddy.git
cd studybuddy
cp .env.example .env
```

Edit `backend/.env` with your API keys:

```env
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
HUGGINGFACE_API_KEY=your_hf_key
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Servers

```bash
npm run dev
```

Frontend available at: `http://localhost:5173`

---

## 💻 C++ Sync Agent

### Install (Windows)

```powershell
powershell -ExecutionPolicy Bypass -File "backend/cpp-agent/install.ps1"
```

Restart your terminal, then configure:

```bash
studybuddy config set sync_url http://localhost:5000/api
studybuddy config set auth_token <YOUR_TOKEN>
studybuddy config set user_id <YOUR_USER_ID>
```

### CLI Commands

```bash
# Create a note
studybuddy note add "Title"

# Push notes to cloud
studybuddy sync push

# Pull notes from cloud
studybuddy sync pull

# Start AI mentor session in terminal
studybuddy chat

# View all commands
studybuddy help
```

---

## ☁️ Deployment

One-click deployment via [Render](https://render.com) using the included `render.yaml`:

```bash
# Provisions automatically:
# ✅ Backend API service
# ✅ React frontend
# ✅ Environment configuration
# ✅ Build pipelines
```

---

## 🛠️ Full Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React, Vite, TailwindCSS, Framer Motion, Zustand, Lucide Icons |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose, Zod, JWT |
| **AI/ML** | HuggingFace Embeddings, Groq LLM, Google Gemini, Semantic Search, Knowledge Graphs |
| **CLI** | C++17, CPR, Nlohmann JSON |
| **Deployment** | Render (render.yaml) |

---

## 🌟 Long-Term Vision

> A platform that continuously understands how students learn, how memory changes, how careers evolve, how motivation fluctuates, and how opportunities emerge — then intelligently adapts everything in real time.

StudyBuddy is built to grow from a student companion into a fully autonomous AI career operating system.

---

## 📄 License

MIT © 2026 StudyBuddy AI

---
<div align="center">
  <i>Built for students who refuse to learn the ordinary way.</i>
</div>
