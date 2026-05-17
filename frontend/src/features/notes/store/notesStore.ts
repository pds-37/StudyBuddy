import axios, { isAxiosError } from "axios";
import { create } from "zustand";
import type {
  Concept,
  ConceptHealth,
  FilterType,
  JobLink,
  NotesStats,
  PanelId,
  RecallCard,
  RecallDifficulty,
  VedaNudge
} from "../types/notes.types";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};

type NotesStore = {
  concepts: Concept[];
  stats: NotesStats;
  vedaNudges: VedaNudge[];
  recallCards: RecallCard[];
  jobLinks: JobLink[];
  activeFilter: FilterType;
  activePanel: PanelId | null;
  isLoading: boolean;
  ingestPrompt: string;
  error: string | null;
  setActivePanel: (panel: PanelId | null) => void;
  setActiveFilter: (filter: FilterType) => void;
  submitIngest: (text: string) => Promise<void>;
  submitRecall: (conceptId: string, difficulty: RecallDifficulty) => Promise<void>;
  fetchAll: () => Promise<void>;
  dismissNudge: (nudgeId: string) => void;
};

const prompts = [
  "Paste something you struggled with today — VEDA will extract the concept",
  "Drop a code snippet you want to remember",
  "Write one thing you learned from a mock interview today",
  "What concept are you most likely to forget this week?"
];

const today = new Date();
const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
const daysAgo = (days: number) => new Date(startOfToday.getTime() - days * 86400000);
const daysFromNow = (days: number) => new Date(startOfToday.getTime() + days * 86400000);

const mockConcepts: Concept[] = [
  {
    id: "concept-arrays-window",
    title: "Sliding Window",
    excerpt: "Track contiguous ranges with two pointers to optimize array and substring problems.",
    tags: ["DSA", "Arrays", "Medium"],
    health: "strong",
    recallScore: 86,
    lastReviewed: daysAgo(1),
    dueDate: daysFromNow(4),
    linkedJobId: "job-google-sde",
    linkedJobTitle: "Google SDE",
    createdAt: daysAgo(14)
  },
  {
    id: "concept-react-memo",
    title: "React Memoization",
    excerpt: "Use memo, useMemo, and useCallback only where render cost or referential stability matters.",
    tags: ["Frontend", "React", "Medium"],
    health: "needs-review",
    recallScore: 58,
    lastReviewed: daysAgo(3),
    dueDate: startOfToday,
    linkedJobId: "job-flipkart-frontend",
    linkedJobTitle: "Flipkart Frontend",
    createdAt: daysAgo(9)
  },
  {
    id: "concept-bfs-level",
    title: "BFS Levels",
    excerpt: "Process graph or tree nodes level by level with a queue and visited set.",
    tags: ["Graphs", "Trees", "DSA"],
    health: "critical",
    recallScore: 31,
    lastReviewed: daysAgo(7),
    dueDate: startOfToday,
    linkedJobId: "job-google-sde",
    linkedJobTitle: "Google SDE",
    createdAt: daysAgo(20)
  },
  {
    id: "concept-system-cache",
    title: "Cache Invalidation",
    excerpt: "Balance freshness, latency, and consistency with TTLs, tags, and event-based purges.",
    tags: ["System Design", "Backend", "Hard"],
    health: "needs-review",
    recallScore: 62,
    lastReviewed: daysAgo(4),
    dueDate: daysFromNow(1),
    linkedJobId: "job-google-sde",
    linkedJobTitle: "Google SDE",
    createdAt: daysAgo(11)
  },
  {
    id: "concept-dp-state",
    title: "DP State Design",
    excerpt: "Define state around the smallest subproblem and transition from previous known answers.",
    tags: ["DP", "DSA", "Hard"],
    health: "critical",
    recallScore: 24,
    lastReviewed: daysAgo(8),
    dueDate: startOfToday,
    linkedJobId: "job-google-sde",
    linkedJobTitle: "Google SDE",
    createdAt: daysAgo(18)
  },
  {
    id: "concept-browser-render",
    title: "Browser Rendering",
    excerpt: "Understand style, layout, paint, and compositing to avoid expensive UI updates.",
    tags: ["Frontend", "Browser", "Medium"],
    health: "strong",
    recallScore: 79,
    lastReviewed: daysAgo(2),
    dueDate: daysFromNow(5),
    linkedJobId: "job-flipkart-frontend",
    linkedJobTitle: "Flipkart Frontend",
    createdAt: daysAgo(6)
  }
];

const mockStats: NotesStats = {
  totalConcepts: 12,
  retention: 74,
  dueToday: 3,
  streakDays: 5,
  streakCompletedToday: 2,
  streakGoalToday: 3
};

const mockVedaNudges: VedaNudge[] = [
  {
    id: "nudge-dp-drop",
    type: "recall-warning",
    title: "DP recall is dropping",
    body: "Your DP State Design score fell below 30%. Review it before new graph problems.",
    actionLabel: "Review now",
    actionPrompt: "Start a focused recall pass for DP State Design."
  },
  {
    id: "nudge-bfs-cache",
    type: "connection",
    title: "Connect BFS and caching",
    body: "Both rely on choosing what state to remember. Add a link between visited sets and cache keys.",
    actionLabel: "Make link",
    actionPrompt: "Create a connection between BFS visited sets and cache invalidation."
  },
  {
    id: "nudge-google-context",
    type: "job-context",
    title: "Google SDE needs graph depth",
    body: "Four linked concepts map to Google SDE prep. BFS Levels is the weakest one.",
    actionLabel: "Open context",
    actionPrompt: "Show Google SDE concepts sorted by weakest recall."
  }
];

const mockRecallCards: RecallCard[] = [
  {
    conceptId: "concept-react-memo",
    conceptTitle: "React Memoization",
    priority: "low",
    recallScore: 58,
    lastReviewed: daysAgo(3)
  },
  {
    conceptId: "concept-bfs-level",
    conceptTitle: "BFS Levels",
    priority: "medium",
    recallScore: 31,
    lastReviewed: daysAgo(7)
  },
  {
    conceptId: "concept-dp-state",
    conceptTitle: "DP State Design",
    priority: "critical",
    recallScore: 24,
    lastReviewed: daysAgo(8)
  }
];

const mockJobLinks: JobLink[] = [
  {
    jobId: "job-google-sde",
    jobTitle: "Google SDE",
    conceptCount: 4,
    color: "#a855f7"
  },
  {
    jobId: "job-flipkart-frontend",
    jobTitle: "Flipkart Frontend",
    conceptCount: 2,
    color: "#14b8a6"
  }
];

function getErrorMessage(error: unknown) {
  if (isAxiosError<ApiResponse<unknown>>(error)) {
    return error.response?.data?.error ?? error.message;
  }
  return error instanceof Error ? error.message : "Notes request failed";
}

async function getData<T>(url: string) {
  const response = await axios.get<ApiResponse<T>>(url);
  return response.data.data;
}

function healthFromScore(score: number): ConceptHealth {
  if (score >= 70) return "strong";
  if (score >= 40) return "needs-review";
  return "critical";
}

function nextDueDate(difficulty: RecallDifficulty) {
  if (difficulty === "easy") return daysFromNow(4);
  if (difficulty === "hard") return daysFromNow(1);
  return startOfToday;
}

function nextRecallScore(currentScore: number, difficulty: RecallDifficulty) {
  if (difficulty === "easy") return Math.min(100, currentScore + 10);
  if (difficulty === "forgot") return Math.max(0, currentScore - 20);
  return currentScore;
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  concepts: mockConcepts,
  stats: mockStats,
  vedaNudges: mockVedaNudges,
  recallCards: mockRecallCards,
  jobLinks: mockJobLinks,
  activeFilter: "all",
  activePanel: null,
  isLoading: false,
  ingestPrompt: prompts[today.getDay() % prompts.length],
  error: null,

  setActivePanel: (panel) => set((state) => ({
    activePanel: panel === state.activePanel ? null : panel
  })),

  setActiveFilter: (filter) => set({ activeFilter: filter }),

  submitIngest: async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    set({ isLoading: true, error: null });
    try {
      const response = await axios.post<ApiResponse<{ concept: Concept }>>("/api/notes/ingest", { text: trimmed });
      const concept = response.data.data.concept;
      set((state) => ({
        concepts: [concept, ...state.concepts],
        stats: {
          ...state.stats,
          totalConcepts: state.stats.totalConcepts + 1
        },
        isLoading: false
      }));
      await get().fetchAll();
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false });
    }
  },

  submitRecall: async (conceptId, difficulty) => {
    const reviewedAt = new Date();
    const previousConcepts = get().concepts;
    const previousRecallCards = get().recallCards;

    set((state) => ({
      concepts: state.concepts.map((concept) => {
        if (concept.id !== conceptId) return concept;
        const recallScore = nextRecallScore(concept.recallScore, difficulty);
        return {
          ...concept,
          recallScore,
          health: healthFromScore(recallScore),
          lastReviewed: reviewedAt,
          dueDate: nextDueDate(difficulty)
        };
      }),
      recallCards: state.recallCards.filter((card) => card.conceptId !== conceptId),
      stats: {
        ...state.stats,
        dueToday: Math.max(0, state.stats.dueToday - 1),
        streakCompletedToday: Math.min(state.stats.streakGoalToday, state.stats.streakCompletedToday + 1)
      },
      error: null
    }));

    try {
      await axios.post<ApiResponse<{ updated: Concept }>>("/api/notes/recall", { conceptId, difficulty });
    } catch (error) {
      set({
        concepts: previousConcepts,
        recallCards: previousRecallCards,
        error: getErrorMessage(error)
      });
    }
  },

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const [concepts, stats, vedaNudges, recallCards, jobLinks] = await Promise.all([
        getData<Concept[]>("/api/notes"),
        getData<NotesStats>("/api/notes/stats"),
        getData<VedaNudge[]>("/api/notes/veda-nudges"),
        getData<RecallCard[]>("/api/notes/recall-cards"),
        getData<JobLink[]>("/api/notes/job-links")
      ]);

      set({
        concepts,
        stats,
        vedaNudges,
        recallCards,
        jobLinks,
        isLoading: false
      });
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false });
    }
  },

  dismissNudge: (nudgeId) => set((state) => ({
    vedaNudges: state.vedaNudges.filter((nudge) => nudge.id !== nudgeId)
  }))
}));
