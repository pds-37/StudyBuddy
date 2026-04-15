import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef
} from "react";

import {
  analyseNote,
  askBuddyQuestion
} from "@/lib/gemini";
import {
  buildCustomReminder,
  deleteNoteRecord,
  deleteReminderRecord,
  getNoteById,
  hydrateAppData,
  initDatabase,
  markReminderReviewed,
  saveNoteRecord,
  saveReminderRecord,
  saveRoadmapRecord,
  updateMilestones,
  updateReminderSchedule
} from "@/lib/db";
import {
  addDays,
  addHours,
  createId,
  nowIso,
  sortByNewest
} from "@/lib/date";
import { requestNotificationPermissions, resyncReminderNotifications } from "@/lib/notifications";
import { configureQuickActions } from "@/lib/quickActions";
import { syncRoadmapWithNotes } from "@/lib/roadmapSync";
import type {
  ChatMessage,
  CustomReminderInput,
  GeminiRoadmap,
  Milestone,
  Note,
  Reminder,
  RoadmapWithMilestones,
  SaveNoteInput,
  ToastState
} from "@/lib/types";

type NoteModalState = {
  visible: boolean;
  note: Note | null;
  selectedSubject: string | null;
  suggestedTopic: string | null;
};

type AppState = {
  notes: Note[];
  reminders: Reminder[];
  roadmap: RoadmapWithMilestones | null;
  chatMessages: ChatMessage[];
  askBuddyContextNote: Note | null;
  isHydrating: boolean;
  noteModal: NoteModalState;
  toast: ToastState | null;
  highlightedReminderId: string | null;
  confettiTopic: string | null;
  isConfettiVisible: boolean;
};

type OpenComposerOptions = {
  note?: Note | null;
  subject?: string | null;
  topic?: string | null;
};

type AppContextValue = AppState & {
  refreshApp: () => Promise<void>;
  openNoteComposer: (options?: OpenComposerOptions) => void;
  closeNoteComposer: () => void;
  saveNote: (input: SaveNoteInput) => Promise<Note>;
  deleteNote: (noteId: string) => Promise<void>;
  saveCustomReminder: (input: CustomReminderInput) => Promise<void>;
  deleteReminder: (reminderId: string) => Promise<void>;
  reviewReminder: (reminderId: string) => Promise<void>;
  snoozeReminder: (reminderId: string) => Promise<void>;
  saveRoadmap: (draft: GeminiRoadmap, milestones: GeminiRoadmap["milestones"]) => Promise<void>;
  sendBuddyMessage: (question: string) => Promise<void>;
  clearChatSession: () => void;
  setAskBuddyContextNote: (note: Note | null) => void;
  setHighlightedReminderId: (reminderId: string | null) => void;
  showToast: (message: string, tone?: ToastState["tone"]) => void;
};

const initialState: AppState = {
  notes: [],
  reminders: [],
  roadmap: null,
  chatMessages: [],
  askBuddyContextNote: null,
  isHydrating: true,
  noteModal: {
    visible: false,
    note: null,
    selectedSubject: null,
    suggestedTopic: null
  },
  toast: null,
  highlightedReminderId: null,
  confettiTopic: null,
  isConfettiVisible: false
};

type Action =
  | {
      type: "HYDRATE";
      payload: Pick<AppState, "notes" | "reminders" | "roadmap">;
    }
  | {
      type: "SET_HYDRATING";
      payload: boolean;
    }
  | {
      type: "OPEN_NOTE_MODAL";
      payload: NoteModalState;
    }
  | {
      type: "CLOSE_NOTE_MODAL";
    }
  | {
      type: "SET_TOAST";
      payload: ToastState | null;
    }
  | {
      type: "SET_CHAT_MESSAGES";
      payload: ChatMessage[];
    }
  | {
      type: "SET_ASK_CONTEXT";
      payload: Note | null;
    }
  | {
      type: "SET_HIGHLIGHTED_REMINDER";
      payload: string | null;
    }
  | {
      type: "SHOW_CONFETTI";
      payload: string;
    }
  | {
      type: "HIDE_CONFETTI";
    };

const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case "HYDRATE":
      return {
        ...state,
        ...action.payload,
        isHydrating: false
      };
    case "SET_HYDRATING":
      return {
        ...state,
        isHydrating: action.payload
      };
    case "OPEN_NOTE_MODAL":
      return {
        ...state,
        noteModal: action.payload
      };
    case "CLOSE_NOTE_MODAL":
      return {
        ...state,
        noteModal: {
          visible: false,
          note: null,
          selectedSubject: null,
          suggestedTopic: null
        }
      };
    case "SET_TOAST":
      return {
        ...state,
        toast: action.payload
      };
    case "SET_CHAT_MESSAGES":
      return {
        ...state,
        chatMessages: action.payload
      };
    case "SET_ASK_CONTEXT":
      return {
        ...state,
        askBuddyContextNote: action.payload
      };
    case "SET_HIGHLIGHTED_REMINDER":
      return {
        ...state,
        highlightedReminderId: action.payload
      };
    case "SHOW_CONFETTI":
      return {
        ...state,
        confettiTopic: action.payload,
        isConfettiVisible: true
      };
    case "HIDE_CONFETTI":
      return {
        ...state,
        confettiTopic: null,
        isConfettiVisible: false
      };
    default:
      return state;
  }
};

const AppContext = createContext<AppContextValue | null>(null);

const SPACED_INTERVALS = [1, 3, 7, 14, 30] as const;

const createReminderForNote = (note: Note, intervalDays: number): Reminder => ({
  id: createId("rem"),
  noteId: note.id,
  title: `Revise ${note.subject}`,
  scheduledAt: addDays(new Date(), intervalDays).toISOString(),
  intervalDays,
  isReviewed: false,
  nextReminderId: null,
  subject: note.subject,
  noteSummary: note.summary
});

const fallbackSummary = (content: string) => {
  const compact = content.trim().replace(/\s+/g, " ");
  if (!compact) {
    return "Study note saved locally.";
  }

  return compact.length > 90 ? `${compact.slice(0, 87).trimEnd()}...` : compact;
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confettiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const showToast = useCallback((message: string, tone: ToastState["tone"] = "neutral") => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    dispatch({
      type: "SET_TOAST",
      payload: {
        id: createId("toast"),
        message,
        tone
      }
    });

    toastTimerRef.current = setTimeout(() => {
      dispatch({ type: "SET_TOAST", payload: null });
    }, 2000);
  }, []);

  const triggerConfetti = useCallback((topic: string) => {
    if (confettiTimerRef.current) {
      clearTimeout(confettiTimerRef.current);
    }

    dispatch({ type: "SHOW_CONFETTI", payload: topic });
    confettiTimerRef.current = setTimeout(() => {
      dispatch({ type: "HIDE_CONFETTI" });
    }, 1500);
  }, []);

  const refreshApp = useCallback(async () => {
    const payload = await hydrateAppData();
    dispatch({ type: "HYDRATE", payload });
    await resyncReminderNotifications(payload.reminders, payload.notes);
  }, []);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      dispatch({ type: "SET_HYDRATING", payload: true });
      await initDatabase();
      await requestNotificationPermissions();
      await configureQuickActions();
      if (mounted) {
        await refreshApp();
      }
    };

    bootstrap().catch(() => {
      dispatch({ type: "SET_HYDRATING", payload: false });
      showToast("Study Buddy hit a setup issue. Restart and try again.", "danger");
    });

    return () => {
      mounted = false;
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      if (confettiTimerRef.current) {
        clearTimeout(confettiTimerRef.current);
      }
    };
  }, [refreshApp, showToast]);

  const openNoteComposer = useCallback((options?: OpenComposerOptions) => {
    dispatch({
      type: "OPEN_NOTE_MODAL",
      payload: {
        visible: true,
        note: options?.note ?? null,
        selectedSubject: options?.subject ?? options?.note?.subject ?? null,
        suggestedTopic: options?.topic ?? options?.note?.category ?? null
      }
    });
  }, []);

  const closeNoteComposer = useCallback(() => {
    dispatch({ type: "CLOSE_NOTE_MODAL" });
  }, []);

  const saveNote = useCallback(async (input: SaveNoteInput) => {
    const existingNote = input.id ? await getNoteById(input.id) : null;
    let warningMessage: string | null = null;

    let noteAnalysis = {
      subject: input.selectedSubject?.trim() || existingNote?.subject || "Uncategorised",
      category: existingNote?.category || "General",
      key_concepts: existingNote?.keyConcepts || [],
      summary: fallbackSummary(input.content),
      confidence: existingNote?.confidence ?? 0,
      suggested_roadmap_topic: existingNote?.roadmapTopic || ""
    };

    try {
      noteAnalysis = await analyseNote(input.content, input.selectedSubject ?? existingNote?.subject);
    } catch {
      warningMessage = "Saved offline. Buddy will classify it next time.";
    }

    const timestamp = nowIso();
    const note: Note = {
      id: input.id ?? createId("note"),
      content: input.content.trim(),
      subject: noteAnalysis.subject || input.selectedSubject?.trim() || "Uncategorised",
      category: noteAnalysis.category || "General",
      keyConcepts: Array.isArray(noteAnalysis.key_concepts) ? noteAnalysis.key_concepts.slice(0, 5) : [],
      summary: noteAnalysis.summary || fallbackSummary(input.content),
      confidence: Math.round(Number(noteAnalysis.confidence) || 0),
      roadmapTopic: noteAnalysis.suggested_roadmap_topic || "",
      createdAt: existingNote?.createdAt ?? timestamp,
      updatedAt: timestamp
    };

    await saveNoteRecord(note);

    if (!existingNote) {
      const firstReminder = createReminderForNote(note, SPACED_INTERVALS[0]);
      await saveReminderRecord(firstReminder);
    }

    const current = stateRef.current;
    const nextNotes = sortByNewest([note, ...current.notes.filter((item) => item.id !== note.id)]);
    if (current.roadmap) {
      const syncResult = syncRoadmapWithNotes(current.roadmap, nextNotes);
      if (syncResult.milestones.length) {
        await updateMilestones(syncResult.milestones);
      }
      if (syncResult.completedNow.length) {
        triggerConfetti(syncResult.completedNow[0].topic);
      }
    }

    await refreshApp();

    if (warningMessage) {
      showToast(warningMessage, "warning");
    } else {
      showToast(`Saved to ${note.subject}!`, "success");
    }

    return note;
  }, [refreshApp, showToast, triggerConfetti]);

  const deleteNote = useCallback(async (noteId: string) => {
    await deleteNoteRecord(noteId);
    if (stateRef.current.askBuddyContextNote?.id === noteId) {
      dispatch({ type: "SET_ASK_CONTEXT", payload: null });
    }
    await refreshApp();
    showToast("Note deleted.", "neutral");
  }, [refreshApp, showToast]);

  const saveCustomReminder = useCallback(async (input: CustomReminderInput) => {
    const reminder = buildCustomReminder(createId("rem"), input);
    await saveReminderRecord(reminder);
    await refreshApp();
    showToast("Custom reminder saved.", "success");
  }, [refreshApp, showToast]);

  const deleteReminder = useCallback(async (reminderId: string) => {
    await deleteReminderRecord(reminderId);
    await refreshApp();
    showToast("Reminder removed.", "neutral");
  }, [refreshApp, showToast]);

  const reviewReminder = useCallback(async (reminderId: string) => {
    const currentReminder = stateRef.current.reminders.find((item) => item.id === reminderId);
    if (!currentReminder) {
      return;
    }

    const note = currentReminder.noteId ? stateRef.current.notes.find((item) => item.id === currentReminder.noteId) : null;
    let nextReminderId: string | null = null;

    if (currentReminder.intervalDays > 0) {
      const currentIndex = SPACED_INTERVALS.indexOf(currentReminder.intervalDays as (typeof SPACED_INTERVALS)[number]);
      const nextInterval = currentIndex >= 0 ? SPACED_INTERVALS[currentIndex + 1] : undefined;
      if (nextInterval && note) {
        const nextReminder = createReminderForNote(note, nextInterval);
        nextReminderId = nextReminder.id;
        await saveReminderRecord(nextReminder);
      }
    }

    await markReminderReviewed(reminderId, nextReminderId);
    await refreshApp();
    showToast("Marked as reviewed.", "success");
  }, [refreshApp, showToast]);

  const snoozeReminder = useCallback(async (reminderId: string) => {
    await updateReminderSchedule(reminderId, addHours(new Date(), 1).toISOString());
    await refreshApp();
    showToast("Snoozed for 1 hour.", "neutral");
  }, [refreshApp, showToast]);

  const saveRoadmap = useCallback(async (draft: GeminiRoadmap, milestonesDraft: GeminiRoadmap["milestones"]) => {
    const roadmapId = createId("roadmap");
    const roadmap = {
      id: roadmapId,
      goalTitle: draft.goal_title,
      subject: draft.subject,
      targetDate: draft.target_date,
      createdAt: nowIso(),
      isActive: true
    };

    let milestones: Milestone[] = milestonesDraft.map((item, index) => ({
      id: item.id || createId("milestone"),
      roadmapId,
      topic: item.topic,
      description: item.description,
      orderIndex: index + 1,
      status: "upcoming",
      estimatedNotes: item.estimated_notes_needed || 2,
      actualNotes: 0
    }));

    const preSyncRoadmap = {
      roadmap,
      milestones
    };
    const syncResult = syncRoadmapWithNotes(preSyncRoadmap, stateRef.current.notes);
    milestones = syncResult.milestones.length ? syncResult.milestones : milestones;

    await saveRoadmapRecord(roadmap, milestones);
    await refreshApp();

    if (syncResult.completedNow.length) {
      triggerConfetti(syncResult.completedNow[0].topic);
    }

    showToast("Roadmap ready to go.", "success");
  }, [refreshApp, showToast, triggerConfetti]);

  const sendBuddyMessage = useCallback(async (question: string) => {
    const current = stateRef.current;
    const userMessage: ChatMessage = {
      id: createId("msg"),
      role: "user",
      content: question,
      createdAt: nowIso()
    };

    const nextMessages = [...current.chatMessages, userMessage];
    dispatch({ type: "SET_CHAT_MESSAGES", payload: nextMessages });

    try {
      const focusNote = current.askBuddyContextNote
        ? `Focus note:\n${current.askBuddyContextNote.subject} > ${current.askBuddyContextNote.category}: ${current.askBuddyContextNote.summary}\n\n`
        : "";

      const response = await askBuddyQuestion(
        `${focusNote}${question}`,
        sortByNewest(current.notes),
        nextMessages.map((message) => ({
          role: message.role,
          content: message.content
        }))
      );

      const assistantMessage: ChatMessage = {
        id: createId("msg"),
        role: "assistant",
        content: response.trim(),
        createdAt: nowIso()
      };

      dispatch({
        type: "SET_CHAT_MESSAGES",
        payload: [...nextMessages, assistantMessage]
      });
    } catch {
      const assistantMessage: ChatMessage = {
        id: createId("msg"),
        role: "assistant",
        content:
          "I couldn't reach Gemini right now, but your notes are still safe. Try again in a moment and keep going.",
        createdAt: nowIso()
      };
      dispatch({
        type: "SET_CHAT_MESSAGES",
        payload: [...nextMessages, assistantMessage]
      });
      showToast("Buddy is offline right now.", "warning");
    }
  }, [showToast]);

  const clearChatSession = useCallback(() => {
    dispatch({ type: "SET_CHAT_MESSAGES", payload: [] });
    dispatch({ type: "SET_ASK_CONTEXT", payload: null });
  }, []);

  const setAskBuddyContextNote = useCallback((note: Note | null) => {
    dispatch({ type: "SET_ASK_CONTEXT", payload: note });
  }, []);

  const setHighlightedReminderId = useCallback((reminderId: string | null) => {
    dispatch({ type: "SET_HIGHLIGHTED_REMINDER", payload: reminderId });
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      refreshApp,
      openNoteComposer,
      closeNoteComposer,
      saveNote,
      deleteNote,
      saveCustomReminder,
      deleteReminder,
      reviewReminder,
      snoozeReminder,
      saveRoadmap,
      sendBuddyMessage,
      clearChatSession,
      setAskBuddyContextNote,
      setHighlightedReminderId,
      showToast
    }),
    [
      state,
      refreshApp,
      openNoteComposer,
      closeNoteComposer,
      saveNote,
      deleteNote,
      saveCustomReminder,
      deleteReminder,
      reviewReminder,
      snoozeReminder,
      saveRoadmap,
      sendBuddyMessage,
      clearChatSession,
      setAskBuddyContextNote,
      setHighlightedReminderId,
      showToast
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used inside AppProvider.");
  }

  return context;
};
