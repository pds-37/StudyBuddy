import type {
  CustomReminderInput,
  Milestone,
  Note,
  Reminder,
  RoadmapWithMilestones
} from "@/lib/types";

type WebStore = {
  notes: Note[];
  reminders: Reminder[];
  roadmap: RoadmapWithMilestones | null;
};

const STORAGE_KEY = "study-buddy-web-store";

let memoryStore: WebStore = {
  notes: [],
  reminders: [],
  roadmap: null
};

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const readStore = (): WebStore => {
  if (!canUseStorage()) {
    return memoryStore;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return memoryStore;
    }

    const parsed = JSON.parse(raw) as Partial<WebStore>;
    return {
      notes: parsed.notes ?? [],
      reminders: parsed.reminders ?? [],
      roadmap: parsed.roadmap ?? null
    };
  } catch {
    return memoryStore;
  }
};

const writeStore = (nextStore: WebStore) => {
  memoryStore = nextStore;
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStore));
};

export const initDatabase = async () => {
  writeStore(readStore());
};

export const getAllNotes = async () =>
  [...readStore().notes].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );

export const getNoteById = async (noteId: string) =>
  readStore().notes.find((note) => note.id === noteId) ?? null;

export const saveNoteRecord = async (note: Note) => {
  const store = readStore();
  const notes = [note, ...store.notes.filter((item) => item.id !== note.id)].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );

  writeStore({
    ...store,
    notes
  });
};

export const deleteNoteRecord = async (noteId: string) => {
  const store = readStore();
  writeStore({
    ...store,
    notes: store.notes.filter((note) => note.id !== noteId),
    reminders: store.reminders.filter((reminder) => reminder.noteId !== noteId)
  });
};

export const getDistinctSubjects = async () =>
  [...new Set(readStore().notes.map((note) => note.subject).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );

export const searchNotes = async (query: string, subject = "All") => {
  const normalized = query.trim().toLowerCase();
  return readStore().notes.filter((note) => {
    const subjectMatch = subject === "All" || note.subject === subject;
    if (!subjectMatch) {
      return false;
    }

    if (!normalized) {
      return true;
    }

    return [note.content, note.subject, note.category, note.summary, note.keyConcepts.join(" ")]
      .join(" ")
      .toLowerCase()
      .includes(normalized);
  });
};

export const getAllReminders = async () =>
  [...readStore().reminders].sort(
    (left, right) => new Date(left.scheduledAt).getTime() - new Date(right.scheduledAt).getTime()
  );

export const saveReminderRecord = async (reminder: Reminder) => {
  const store = readStore();
  const reminders = [...store.reminders.filter((item) => item.id !== reminder.id), reminder].sort(
    (left, right) => new Date(left.scheduledAt).getTime() - new Date(right.scheduledAt).getTime()
  );

  writeStore({
    ...store,
    reminders
  });
};

export const markReminderReviewed = async (reminderId: string, nextReminderId?: string | null) => {
  const store = readStore();
  writeStore({
    ...store,
    reminders: store.reminders.map((reminder) =>
      reminder.id === reminderId
        ? {
            ...reminder,
            isReviewed: true,
            nextReminderId: nextReminderId ?? reminder.nextReminderId
          }
        : reminder
    )
  });
};

export const updateReminderSchedule = async (reminderId: string, scheduledAt: string) => {
  const store = readStore();
  writeStore({
    ...store,
    reminders: store.reminders.map((reminder) =>
      reminder.id === reminderId
        ? {
            ...reminder,
            scheduledAt,
            isReviewed: false
          }
        : reminder
    )
  });
};

export const createCustomReminderRecord = async (reminder: Reminder) => {
  await saveReminderRecord(reminder);
};

export const deleteReminderRecord = async (reminderId: string) => {
  const store = readStore();
  writeStore({
    ...store,
    reminders: store.reminders.filter((reminder) => reminder.id !== reminderId)
  });
};

export const saveRoadmapRecord = async (
  roadmap: RoadmapWithMilestones["roadmap"],
  milestones: Milestone[]
) => {
  const store = readStore();
  writeStore({
    ...store,
    roadmap: {
      roadmap,
      milestones
    }
  });
};

export const getActiveRoadmap = async (): Promise<RoadmapWithMilestones | null> => readStore().roadmap;

export const updateMilestones = async (milestones: Milestone[]) => {
  const store = readStore();
  if (!store.roadmap) {
    return;
  }

  writeStore({
    ...store,
    roadmap: {
      ...store.roadmap,
      milestones
    }
  });
};

export const hydrateAppData = async () => {
  const store = readStore();
  return {
    notes: [...store.notes].sort(
      (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    ),
    reminders: [...store.reminders].sort(
      (left, right) => new Date(left.scheduledAt).getTime() - new Date(right.scheduledAt).getTime()
    ),
    roadmap: store.roadmap
  };
};

export const buildCustomReminder = (id: string, input: CustomReminderInput): Reminder => ({
  id,
  noteId: input.noteId ?? null,
  title: input.title,
  scheduledAt: input.scheduledAt,
  intervalDays: 0,
  isReviewed: false,
  nextReminderId: null,
  subject: input.subject ?? null,
  noteSummary: input.title
});
