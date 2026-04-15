import * as SQLite from "expo-sqlite";

import type {
  CustomReminderInput,
  Milestone,
  Note,
  Reminder,
  Roadmap,
  RoadmapWithMilestones
} from "@/lib/types";

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

type NoteRow = {
  id: string;
  content: string;
  subject: string | null;
  category: string | null;
  key_concepts: string | null;
  summary: string | null;
  confidence: number | null;
  roadmap_topic: string | null;
  created_at: string;
  updated_at: string;
};

type ReminderRow = {
  id: string;
  note_id: string | null;
  title: string;
  scheduled_at: string;
  interval_days: number;
  is_reviewed: number;
  next_reminder_id: string | null;
  subject?: string | null;
  note_summary?: string | null;
};

type RoadmapRow = {
  id: string;
  goal_title: string;
  subject: string | null;
  target_date: string | null;
  created_at: string;
  is_active: number;
};

type MilestoneRow = {
  id: string;
  roadmap_id: string;
  topic: string;
  description: string | null;
  order_index: number;
  status: "upcoming" | "in_progress" | "completed";
  estimated_notes: number;
  actual_notes: number;
};

const openDatabase = async () => {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync("study-buddy.db");
  }

  return databasePromise;
};

const mapNote = (row: NoteRow): Note => ({
  id: row.id,
  content: row.content,
  subject: row.subject ?? "Uncategorised",
  category: row.category ?? "General",
  keyConcepts: row.key_concepts ? JSON.parse(row.key_concepts) : [],
  summary: row.summary ?? "Study note saved locally.",
  confidence: row.confidence ?? 0,
  roadmapTopic: row.roadmap_topic ?? "",
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const mapReminder = (row: ReminderRow): Reminder => ({
  id: row.id,
  noteId: row.note_id,
  title: row.title,
  scheduledAt: row.scheduled_at,
  intervalDays: row.interval_days,
  isReviewed: row.is_reviewed === 1,
  nextReminderId: row.next_reminder_id,
  subject: row.subject ?? null,
  noteSummary: row.note_summary ?? null
});

const mapRoadmap = (row: RoadmapRow): Roadmap => ({
  id: row.id,
  goalTitle: row.goal_title,
  subject: row.subject ?? "",
  targetDate: row.target_date ?? "",
  createdAt: row.created_at,
  isActive: row.is_active === 1
});

const mapMilestone = (row: MilestoneRow): Milestone => ({
  id: row.id,
  roadmapId: row.roadmap_id,
  topic: row.topic,
  description: row.description ?? "",
  orderIndex: row.order_index,
  status: row.status,
  estimatedNotes: row.estimated_notes,
  actualNotes: row.actual_notes
});

export const initDatabase = async () => {
  const db = await openDatabase();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY NOT NULL,
      content TEXT NOT NULL,
      subject TEXT,
      category TEXT,
      key_concepts TEXT,
      summary TEXT,
      confidence INTEGER,
      roadmap_topic TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY NOT NULL,
      note_id TEXT,
      title TEXT NOT NULL,
      scheduled_at TEXT NOT NULL,
      interval_days INTEGER NOT NULL,
      is_reviewed INTEGER DEFAULT 0,
      next_reminder_id TEXT,
      FOREIGN KEY (note_id) REFERENCES notes(id)
    );
    CREATE TABLE IF NOT EXISTS roadmaps (
      id TEXT PRIMARY KEY NOT NULL,
      goal_title TEXT NOT NULL,
      subject TEXT,
      target_date TEXT,
      created_at TEXT NOT NULL,
      is_active INTEGER DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS milestones (
      id TEXT PRIMARY KEY NOT NULL,
      roadmap_id TEXT NOT NULL,
      topic TEXT NOT NULL,
      description TEXT,
      order_index INTEGER,
      status TEXT DEFAULT 'upcoming',
      estimated_notes INTEGER DEFAULT 2,
      actual_notes INTEGER DEFAULT 0,
      FOREIGN KEY (roadmap_id) REFERENCES roadmaps(id)
    );
  `);
};

export const getAllNotes = async () => {
  const db = await openDatabase();
  const rows = await db.getAllAsync<NoteRow>(
    "SELECT * FROM notes ORDER BY datetime(created_at) DESC"
  );
  return rows.map(mapNote);
};

export const getNoteById = async (noteId: string) => {
  const db = await openDatabase();
  const row = await db.getFirstAsync<NoteRow>("SELECT * FROM notes WHERE id = ?", [noteId]);
  return row ? mapNote(row) : null;
};

export const saveNoteRecord = async (note: Note) => {
  const db = await openDatabase();
  await db.runAsync(
    `INSERT INTO notes (
      id, content, subject, category, key_concepts, summary, confidence, roadmap_topic, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      content = excluded.content,
      subject = excluded.subject,
      category = excluded.category,
      key_concepts = excluded.key_concepts,
      summary = excluded.summary,
      confidence = excluded.confidence,
      roadmap_topic = excluded.roadmap_topic,
      updated_at = excluded.updated_at`,
    [
      note.id,
      note.content,
      note.subject,
      note.category,
      JSON.stringify(note.keyConcepts),
      note.summary,
      note.confidence,
      note.roadmapTopic,
      note.createdAt,
      note.updatedAt
    ]
  );
};

export const deleteNoteRecord = async (noteId: string) => {
  const db = await openDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync("DELETE FROM reminders WHERE note_id = ?", [noteId]);
    await db.runAsync("DELETE FROM notes WHERE id = ?", [noteId]);
  });
};

export const getDistinctSubjects = async () => {
  const db = await openDatabase();
  const rows = await db.getAllAsync<{ subject: string }>(
    `SELECT DISTINCT subject
     FROM notes
     WHERE subject IS NOT NULL AND trim(subject) <> ''
     ORDER BY subject COLLATE NOCASE ASC`
  );
  return rows.map((row) => row.subject);
};

export const searchNotes = async (query: string, subject = "All") => {
  const db = await openDatabase();
  const normalized = `%${query.trim().toLowerCase()}%`;
  const rows = await db.getAllAsync<NoteRow>(
    `SELECT *
     FROM notes
     WHERE (? = 'All' OR subject = ?)
       AND (
         lower(content) LIKE ?
         OR lower(COALESCE(subject, '')) LIKE ?
         OR lower(COALESCE(category, '')) LIKE ?
         OR lower(COALESCE(key_concepts, '')) LIKE ?
       )
     ORDER BY datetime(created_at) DESC`,
    [subject, subject, normalized, normalized, normalized, normalized]
  );
  return rows.map(mapNote);
};

export const getAllReminders = async () => {
  const db = await openDatabase();
  const rows = await db.getAllAsync<ReminderRow>(
    `SELECT reminders.*, notes.subject AS subject, notes.summary AS note_summary
     FROM reminders
     LEFT JOIN notes ON notes.id = reminders.note_id
     ORDER BY datetime(reminders.scheduled_at) ASC`
  );
  return rows.map(mapReminder);
};

export const saveReminderRecord = async (reminder: Reminder) => {
  const db = await openDatabase();
  await db.runAsync(
    `INSERT INTO reminders (
      id, note_id, title, scheduled_at, interval_days, is_reviewed, next_reminder_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      note_id = excluded.note_id,
      title = excluded.title,
      scheduled_at = excluded.scheduled_at,
      interval_days = excluded.interval_days,
      is_reviewed = excluded.is_reviewed,
      next_reminder_id = excluded.next_reminder_id`,
    [
      reminder.id,
      reminder.noteId,
      reminder.title,
      reminder.scheduledAt,
      reminder.intervalDays,
      reminder.isReviewed ? 1 : 0,
      reminder.nextReminderId
    ]
  );
};

export const markReminderReviewed = async (reminderId: string, nextReminderId?: string | null) => {
  const db = await openDatabase();
  await db.runAsync(
    `UPDATE reminders
     SET is_reviewed = 1,
         next_reminder_id = COALESCE(?, next_reminder_id)
     WHERE id = ?`,
    [nextReminderId ?? null, reminderId]
  );
};

export const updateReminderSchedule = async (reminderId: string, scheduledAt: string) => {
  const db = await openDatabase();
  await db.runAsync(
    "UPDATE reminders SET scheduled_at = ?, is_reviewed = 0 WHERE id = ?",
    [scheduledAt, reminderId]
  );
};

export const createCustomReminderRecord = async (reminder: Reminder) => {
  await saveReminderRecord(reminder);
};

export const deleteReminderRecord = async (reminderId: string) => {
  const db = await openDatabase();
  await db.runAsync("DELETE FROM reminders WHERE id = ?", [reminderId]);
};

export const saveRoadmapRecord = async (
  roadmap: Roadmap,
  milestones: Milestone[]
) => {
  const db = await openDatabase();

  await db.withTransactionAsync(async () => {
    await db.runAsync("UPDATE roadmaps SET is_active = 0");
    await db.runAsync(
      `INSERT INTO roadmaps (
        id, goal_title, subject, target_date, created_at, is_active
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        roadmap.id,
        roadmap.goalTitle,
        roadmap.subject,
        roadmap.targetDate,
        roadmap.createdAt,
        roadmap.isActive ? 1 : 0
      ]
    );

    await db.runAsync("DELETE FROM milestones WHERE roadmap_id = ?", [roadmap.id]);

    for (const milestone of milestones) {
      await db.runAsync(
        `INSERT INTO milestones (
          id, roadmap_id, topic, description, order_index, status, estimated_notes, actual_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          milestone.id,
          milestone.roadmapId,
          milestone.topic,
          milestone.description,
          milestone.orderIndex,
          milestone.status,
          milestone.estimatedNotes,
          milestone.actualNotes
        ]
      );
    }
  });
};

export const getActiveRoadmap = async (): Promise<RoadmapWithMilestones | null> => {
  const db = await openDatabase();
  const roadmapRow = await db.getFirstAsync<RoadmapRow>(
    "SELECT * FROM roadmaps WHERE is_active = 1 ORDER BY datetime(created_at) DESC LIMIT 1"
  );

  if (!roadmapRow) {
    return null;
  }

  const milestoneRows = await db.getAllAsync<MilestoneRow>(
    "SELECT * FROM milestones WHERE roadmap_id = ? ORDER BY order_index ASC",
    [roadmapRow.id]
  );

  return {
    roadmap: mapRoadmap(roadmapRow),
    milestones: milestoneRows.map(mapMilestone)
  };
};

export const updateMilestones = async (milestones: Milestone[]) => {
  if (!milestones.length) {
    return;
  }

  const db = await openDatabase();
  await db.withTransactionAsync(async () => {
    for (const milestone of milestones) {
      await db.runAsync(
        `UPDATE milestones
         SET topic = ?, description = ?, order_index = ?, status = ?, estimated_notes = ?, actual_notes = ?
         WHERE id = ?`,
        [
          milestone.topic,
          milestone.description,
          milestone.orderIndex,
          milestone.status,
          milestone.estimatedNotes,
          milestone.actualNotes,
          milestone.id
        ]
      );
    }
  });
};

export const hydrateAppData = async () => {
  const [notes, reminders, roadmap] = await Promise.all([
    getAllNotes(),
    getAllReminders(),
    getActiveRoadmap()
  ]);

  return {
    notes,
    reminders,
    roadmap
  };
};

export const buildCustomReminder = (
  id: string,
  input: CustomReminderInput
): Reminder => ({
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
