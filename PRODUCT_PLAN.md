# 🧠 STUDYBUDDY (VEDA AI) — FULL PRODUCT PLAN

## 1. 🎯 Core Philosophy
**“AI that makes sure you don’t fail your own plan”**
The system must:
* Track behavior
* Intervene when needed
* Adapt continuously

## 2. 👤 User Journey
1. **Onboarding**: User enters targetRoles, current skills, time availability. AI creates roadmap & behavior baseline.
2. **Daily Usage**: Dashboard shows today's tasks, revision, progress. System learns from completion/skips.
3. **AI Interaction**: Contextual RAG. AI adjusts explanation based on user's level.
4. **Weekly Adaptation**: System adjusts roadmap difficulty, study load, and revision schedule.

## 3. 🧱 System Architecture
```
/backend
  /core
    ai-orchestrator
  /engines
    behavior-engine
    memory-engine
    roadmap-engine
    recommendation-engine
    nudging-engine
  /services
    note-service
    user-service
    task-service
    analytics-service
```

## 4. ⚙️ Core Engines
* **Behavior Engine**: Tracks consistency, procrastination, peak time. (`BehaviorProfile`)
* **Memory Engine**: Spaced repetition (flashcards, quizzes, review schedule). (`MemoryItem`)
* **Roadmap Engine**: Llama/Gemini-powered. Converts targetRoles/skill gaps into micro tasks.
* **Recommendation Engine**: The Brain. Combines behavior + memory + roadmap.
* **Nudging Engine**: Smart reminders for inactivity or exams.

## 5. 📱 Frontend UX Flow
* **Today Dashboard**: Today's tasks, Revision Queue, Progress Bar, Streak.
* **Modes**: Study Mode (guided flow), Revision Mode (quizzes), Career Mode (roadmap, jobs).
* **Veda AI Chat**: Contextual suggestions ("Need help with today's task?").
* **Authentication**: Secure JWT-based auth with Google Sign-In integration.

## 6. 🗄️ Database Design
* **User**: `email`, `googleId`, `targetRoles[]`, `currentSkills[]`, `availableHours`, `BehaviorProfile`
* **Task**: `userId`, `type`, `difficulty`, `status`, `scheduledAt`
* **Note**: `content`, `embeddings`, `tags[]`
* **Memory**: `noteId`, `nextReview`, `strength`
* **Behavior**: `userId`, `action`, `timestamp`

## 7. 🔌 API Design
Core APIs:
* `POST /generate-roadmap`
* `GET /today-tasks`
* `POST /complete-task`
* `POST /log-behavior`
* `GET /revision-queue`
* `POST /chat`
* `POST /auth/google` (Google OAuth 2.0 verification)

Smart Endpoint:
* `GET /next-best-action` (Frontend calls this → AI decides what user should do)

## 8. 🚀 Build Roadmap
* **Phase 1 (MVP)**: Roadmap generation, Task breakdown, Simple dashboard, Chat (Groq Llama 3.1), Google Auth.
* **Phase 2 (Differentiation)**: Behavior tracking, Spaced repetition, Smart nudges.
* **Phase 3 (Advanced AI)**: Adaptive roadmap, Confidence engine, Knowledge graph.
