# StudyBuddy — Featuring Veda AI

StudyBuddy is a next-generation AI Career Copilot designed to bridge the gap between your educational notes and professional career goals. Powered by **Veda AI**, it provides contextual guidance, roadmap generation, and skill-gap analysis based on your unique study materials.

---

## ✨ Key Features

- **🧠 Contextual AI Copilot**: A RAG-powered chat assistant that knows your notes, resume, and target career path.
- **📊 AI Skill Gap Analysis**: Automatically compares your current skill set against industry-standard role requirements using semantic matching.
- **🗺️ Dynamic Roadmaps**: Converts identified skill gaps into actionable, week-by-week learning milestones.
- **💼 Job Matcher**: A live job feed that scores every listing based on your personal skill profile and notes.
- **💻 C++ Sync Agent**: A lightning-fast, offline-first CLI tool for Windows/Unix that securely syncs your local markdown notes (e.g., from Obsidian/VS Code) to the cloud.

---

## 🏗️ Architecture

The project is a Monorepo built for scalability and performance:

- **`/frontend`**: React + Vite SPA with TailwindCSS and Framer Motion.
- **`/backend`**: Node.js + Express.js API with MongoDB and HuggingFace/Gemini/Groq AI integration.
- **`/backend/cpp-agent`**: A high-performance C++17 CLI tool for local file operations and cloud syncing.
- **`/packages/shared`**: Shared TypeScript types and Zod schemas for end-to-end type safety.

---

## 🚀 Getting Started

### 1. Prerequisites

- [Node.js v18+](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- [Cmake](https://cmake.org/) (Only for building the C++ Agent from source)

### 2. Environment Setup

1. Copy the example environment file at the root:
   ```bash
   cp .env.example .env
   ```
2. Fill in your API keys for **Groq**, **Google Gemini**, and **HuggingFace** in the `backend/.env` file.

### 3. Running the Web Platform

Install dependencies:
```bash
npm install
```

Start both backend and frontend in development mode:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 💻 Using the C++ Sync Agent (CLI)

The StudyBuddy Agent allows you to manage your notes locally and sync them to your cloud profile.

### Installation (Windows)
We provide a simple PowerShell script to install the agent:
```powershell
powershell -ExecutionPolicy Bypass -File "backend/cpp-agent/install.ps1"
```
After installation, restart your terminal and type `studybuddy help`.

### Initial Setup
1. **Login** to the StudyBuddy web dashboard.
2. Go to **Settings** to find your **API Token** and **User ID**.
3. Configure the CLI:
   ```bash
   studybuddy config set sync_url http://localhost:5000/api
   studybuddy config set auth_token <YOUR_TOKEN>
   studybuddy config set user_id <YOUR_USER_ID>
   ```

### Commands
- `studybuddy note add "Title"`: Create a new note from the terminal.
- `studybuddy sync push`: Securely push local notes to the cloud.
- `studybuddy sync pull`: Retrieve cloud notes to your local machine.
- `studybuddy chat`: Start an AI-powered career consultation in your terminal.

---

## ☁️ Deployment

The project includes a `render.yaml` blueprint for easy deployment to **Render**.

1. Connect your GitHub repository to Render.
2. Create a new **Blueprint**.
3. Render will automatically provision:
   - The Node.js API Web Service.
   - The Static Site for the React Frontend.
   - All necessary build/start commands.

---

## 🛠️ Tech Stack

- **Frontend**: React, TailwindCSS, Zustand, Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express, Mongoose, Zod, JWT.
- **AI/ML**: HuggingFace (Embeddings), Groq (LLM Inference), Google Gemini (Roadmap Generation).
- **CLI**: C++17, CPR (HTTP client), Nlohmann JSON.

---

## 📄 License

MIT © 2026 StudyBuddy AI.
