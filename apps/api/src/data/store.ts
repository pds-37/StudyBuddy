import crypto from "node:crypto";

import { Collection, Db, MongoClient } from "mongodb";

import { env } from "../config/env";

const REVIEW_INTERVALS = [1, 3, 7, 15] as const;

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  streak: number;
  createdAt: string;
};

export type StoredUser = PublicUser & {
  passwordHash: string;
};

export type StoredNote = {
  id: string;
  userId: string;
  content: string;
  subject: string;
  category: string;
  keyConcepts: string[];
  summary: string;
  confidence: number;
  roadmapTopic: string;
  createdAt: string;
  updatedAt: string;
};

export type StoredReminder = {
  id: string;
  userId: string;
  title: string;
  scheduledAt: string;
  intervalDays: number;
  isReviewed: boolean;
  noteId?: string | null;
  topic?: string;
  kind?: "revision" | "custom";
};

export type StoredLearningItem = {
  id: string;
  userId: string;
  noteId: string;
  subject: string;
  topic: string;
  kind: "flashcard" | "mcq" | "short_answer";
  prompt: string;
  answer: string;
  options: string[];
  correctOption: number | null;
  reviewStage: number;
  reviewCount: number;
  correctCount: number;
  dueAt: string;
  lastReviewedAt: string | null;
  lastOutcome: "correct" | "wrong" | null;
  createdAt: string;
  updatedAt: string;
};

export type StoredMilestone = {
  id: string;
  topic: string;
  description: string;
  orderIndex: number;
  status: "upcoming" | "in_progress" | "completed";
  estimatedNotes: number;
  actualNotes: number;
};

export type StoredRoadmap = {
  id: string;
  userId: string;
  goalTitle: string;
  subject: string;
  targetDate: string;
  isActive: boolean;
  createdAt: string;
  milestones: StoredMilestone[];
};

export type TopicInsight = {
  topic: string;
  subject: string;
  masteryScore: number;
  revisionCount: number;
  reviewAccuracy: number;
  daysUntilForget: number;
  nextReviewAt: string | null;
  riskLevel: "stable" | "watch" | "urgent";
  warning: string;
};

export type StudyPlanBlock = {
  id: string;
  subject: string;
  topic: string;
  minutes: number;
  reason: string;
  status: "todo" | "done" | "missed";
};

export type EmotionalFeedback = {
  tone: "positive" | "neutral" | "recovery";
  message: string;
};

export type DashboardPayload = {
  totalNotes: number;
  dueToday: number;
  activeRoadmaps: number;
  latestSubject: string;
  strongestSubject: string;
  streak: number;
  quickPrompts: string[];
  todayPlan: StudyPlanBlock[];
  revisionQueue: StoredLearningItem[];
  weakTopicAlert: TopicInsight | null;
  riskTopics: TopicInsight[];
  topicInsights: TopicInsight[];
  emotionalFeedback: EmotionalFeedback | null;
  planCompletion: number;
};

type DashboardBundle = {
  dashboard: DashboardPayload;
  notes: StoredNote[];
  reminders: StoredReminder[];
  roadmap: StoredRoadmap | null;
};

type CreateUserInput = {
  email: string;
  name: string;
  passwordHash: string;
};

export type CreateNoteInput = Omit<StoredNote, "id" | "createdAt" | "updatedAt">;

type CreateRoadmapInput = Omit<StoredRoadmap, "id" | "createdAt" | "isActive">;

type CreateReminderInput = Omit<StoredReminder, "id">;

export type CreateLearningItemInput = Omit<
  StoredLearningItem,
  "id" | "reviewCount" | "correctCount" | "lastReviewedAt" | "lastOutcome" | "createdAt" | "updatedAt"
>;

export interface DataStore {
  init(): Promise<void>;
  createUser(input: CreateUserInput): Promise<StoredUser>;
  findUserByEmail(email: string): Promise<StoredUser | null>;
  findUserById(id: string): Promise<StoredUser | null>;
  listNotes(userId: string): Promise<StoredNote[]>;
  createNote(input: CreateNoteInput): Promise<StoredNote>;
  deleteNote(userId: string, noteId: string): Promise<boolean>;
  listReminders(userId: string): Promise<StoredReminder[]>;
  createReminder(input: CreateReminderInput): Promise<StoredReminder>;
  listLearningItems(userId: string): Promise<StoredLearningItem[]>;
  createLearningItems(input: CreateLearningItemInput[]): Promise<StoredLearningItem[]>;
  reviewLearningItem(userId: string, itemId: string, outcome: "correct" | "wrong"): Promise<StoredLearningItem | null>;
  getActiveRoadmap(userId: string): Promise<StoredRoadmap | null>;
  saveRoadmap(input: CreateRoadmapInput): Promise<StoredRoadmap>;
  clearActiveRoadmap(userId: string): Promise<void>;
  getDashboard(userId: string): Promise<DashboardBundle>;
}

const nowIso = () => new Date().toISOString();
const createId = (prefix: string) => `${prefix}_${crypto.randomUUID()}`;

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function addDaysIso(days: number, from = new Date()) {
  return addDays(from, days).toISOString();
}

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function isSameDay(left: string | Date | null | undefined, right = new Date()) {
  if (!left) {
    return false;
  }

  const candidate = new Date(left);
  return candidate.toDateString() === right.toDateString();
}

function daysSince(value: string | null | undefined) {
  if (!value) {
    return 999;
  }

  const difference = Date.now() - new Date(value).getTime();
  return Math.max(0, Math.floor(difference / 86_400_000));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalize(value: string | null | undefined) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function computeStreak(notes: StoredNote[]) {
  if (!notes.length) {
    return 0;
  }

  const noteDays = Array.from(
    new Set(notes.map((note) => startOfDay(new Date(note.createdAt)).toISOString().slice(0, 10)))
  ).sort((left, right) => right.localeCompare(left));

  let streak = 0;
  let cursor = startOfDay(new Date());

  for (const day of noteDays) {
    const cursorDay = cursor.toISOString().slice(0, 10);
    if (day !== cursorDay) {
      break;
    }

    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function extractNoteTopics(note: StoredNote) {
  const filtered = uniqueStrings([note.roadmapTopic, note.category, ...note.keyConcepts]).filter((value) => {
    const normalized = normalize(value);
    return normalized && normalized !== "general" && normalized !== "quick capture";
  });

  return filtered.length ? filtered : uniqueStrings([note.subject]).filter(Boolean);
}

function noteTouchesTopic(note: StoredNote, topic: string) {
  const target = normalize(topic);
  return extractNoteTopics(note).some((candidate) => {
    const normalized = normalize(candidate);
    return normalized === target || normalized.includes(target) || target.includes(normalized);
  });
}

function syncRoadmapProgress(roadmap: StoredRoadmap | null, notes: StoredNote[]): StoredRoadmap | null {
  if (!roadmap) {
    return null;
  }

  return {
    ...roadmap,
    milestones: roadmap.milestones
      .map<StoredMilestone>((milestone) => {
        const actualNotes = notes.filter((note) => {
          const subjectMatches =
            !roadmap.subject ||
            normalize(note.subject) === normalize(roadmap.subject) ||
            normalize(note.subject).includes(normalize(roadmap.subject)) ||
            normalize(roadmap.subject).includes(normalize(note.subject));

          return subjectMatches && noteTouchesTopic(note, milestone.topic);
        }).length;

        const status: StoredMilestone["status"] =
          actualNotes >= milestone.estimatedNotes ? "completed" : actualNotes > 0 ? "in_progress" : "upcoming";

        return {
          ...milestone,
          actualNotes,
          status
        };
      })
      .sort((left, right) => left.orderIndex - right.orderIndex)
  };
}

function buildTopicInsights(notes: StoredNote[], learningItems: StoredLearningItem[], roadmap: StoredRoadmap | null) {
  const buckets = new Map<
    string,
    {
      subject: string;
      topic: string;
      noteCount: number;
      lastActivityAt: string | null;
      items: StoredLearningItem[];
    }
  >();

  const touchBucket = (subject: string, topic: string, activityAt: string | null) => {
    const key = `${normalize(subject)}::${normalize(topic)}`;
    const current = buckets.get(key);
    if (current) {
      current.noteCount += 1;
      current.lastActivityAt =
        !current.lastActivityAt || (activityAt && activityAt > current.lastActivityAt) ? activityAt : current.lastActivityAt;
      return current;
    }

    const created = {
      subject: subject || "General",
      topic,
      noteCount: 1,
      lastActivityAt: activityAt,
      items: [] as StoredLearningItem[]
    };
    buckets.set(key, created);
    return created;
  };

  for (const note of notes) {
    for (const topic of extractNoteTopics(note)) {
      touchBucket(note.subject, topic, note.updatedAt);
    }
  }

  for (const item of learningItems) {
    const bucket = touchBucket(item.subject, item.topic, item.lastReviewedAt ?? item.createdAt);
    bucket.items.push(item);
    bucket.noteCount = Math.max(1, bucket.noteCount);
  }

  if (roadmap) {
    for (const milestone of roadmap.milestones) {
      touchBucket(roadmap.subject, milestone.topic, roadmap.createdAt);
    }
  }

  const riskWeight = { urgent: 0, watch: 1, stable: 2 } as const;

  return Array.from(buckets.values())
    .map<TopicInsight>((bucket) => {
      const reviewCount = bucket.items.reduce((total, item) => total + item.reviewCount, 0);
      const correctCount = bucket.items.reduce((total, item) => total + item.correctCount, 0);
      const reviewAccuracy = reviewCount ? Math.round((correctCount / reviewCount) * 100) : 0;
      const averageStage = bucket.items.length
        ? bucket.items.reduce((total, item) => total + item.reviewStage, 0) / bucket.items.length
        : 0;
      const latestReviewAt =
        bucket.items
          .map((item) => item.lastReviewedAt)
          .filter((value): value is string => Boolean(value))
          .sort((left, right) => right.localeCompare(left))[0] ?? bucket.lastActivityAt;
      const nextReviewAt = bucket.items.map((item) => item.dueAt).sort((left, right) => left.localeCompare(right))[0] ?? null;
      const elapsedDays = daysSince(latestReviewAt);
      const baseScore = Math.min(34, bucket.noteCount * 12);
      const accuracyScore = Math.round((reviewAccuracy / 100) * 34);
      const revisionScore = Math.min(18, reviewCount * 3 + Math.round(averageStage * 4));
      const decayPenalty = Math.min(30, Math.round(elapsedDays * 3.5));
      const masteryScore = clamp(baseScore + accuracyScore + revisionScore - decayPenalty, 8, 99);
      const daysUntilForget = Math.max(0, Math.round(masteryScore / 18 + averageStage * 2 - elapsedDays));

      const riskLevel =
        masteryScore < 45 || daysUntilForget <= 2 ? "urgent" : masteryScore < 68 || daysUntilForget <= 5 ? "watch" : "stable";

      const warning =
        riskLevel === "urgent"
          ? masteryScore < 45
            ? `${bucket.topic} is currently your weakest topic.`
            : `You will likely forget ${bucket.topic} in ${Math.max(1, daysUntilForget)} day${daysUntilForget === 1 ? "" : "s"}.`
          : riskLevel === "watch"
            ? `${bucket.topic} needs a revision pass soon.`
            : `${bucket.topic} is stable for now.`;

      return {
        topic: bucket.topic,
        subject: bucket.subject,
        masteryScore,
        revisionCount: reviewCount,
        reviewAccuracy,
        daysUntilForget,
        nextReviewAt,
        riskLevel,
        warning
      };
    })
    .sort((left, right) => {
      const riskDifference = riskWeight[left.riskLevel] - riskWeight[right.riskLevel];
      if (riskDifference !== 0) {
        return riskDifference;
      }

      if (left.masteryScore !== right.masteryScore) {
        return left.masteryScore - right.masteryScore;
      }

      return left.topic.localeCompare(right.topic);
    });
}

function buildQuickPrompts(notes: StoredNote[], weakTopicAlert: TopicInsight | null, todayPlan: StudyPlanBlock[]) {
  const latestNote = notes[0];
  const firstPlan = todayPlan[0];
  const focusTopic = weakTopicAlert?.topic ?? firstPlan?.topic ?? latestNote?.category ?? "my next topic";

  return [
    "What should I study today?",
    `Quiz me on ${latestNote?.subject ?? "my latest subject"}`,
    `Explain ${focusTopic} simply`,
    "Make my revision sprint"
  ];
}

function buildTodayPlan(
  notes: StoredNote[],
  learningItems: StoredLearningItem[],
  revisionQueue: StoredLearningItem[],
  topicInsights: TopicInsight[],
  roadmap: StoredRoadmap | null
) {
  const blocks: StudyPlanBlock[] = [];
  const seen = new Set<string>();
  const reviewedToday = new Set(
    learningItems.filter((item) => isSameDay(item.lastReviewedAt)).map((item) => normalize(item.topic))
  );
  const notedToday = new Set(
    notes.filter((note) => isSameDay(note.createdAt)).flatMap((note) => extractNoteTopics(note).map((topic) => normalize(topic)))
  );

  const addBlock = (subject: string, topic: string, minutes: number, reason: string) => {
    const key = normalize(topic);
    if (!key || seen.has(key)) {
      return;
    }

    const done = reviewedToday.has(key) || notedToday.has(key);
    blocks.push({
      id: createId("plan"),
      subject,
      topic,
      minutes,
      reason,
      status: done ? "done" : "todo"
    });
    seen.add(key);
  };

  const dueGroups = new Map<string, { subject: string; topic: string; count: number }>();
  for (const item of revisionQueue) {
    const key = `${normalize(item.subject)}::${normalize(item.topic)}`;
    const current = dueGroups.get(key);
    if (current) {
      current.count += 1;
      continue;
    }

    dueGroups.set(key, { subject: item.subject, topic: item.topic, count: 1 });
  }

  for (const group of Array.from(dueGroups.values()).sort((left, right) => right.count - left.count).slice(0, 2)) {
    addBlock(group.subject, group.topic, clamp(15 + group.count * 8, 20, 40), "Due revision");
  }

  for (const topic of topicInsights.filter((entry) => entry.riskLevel !== "stable").slice(0, 2)) {
    addBlock(topic.subject, topic.topic, 35, "Weak topic");
  }

  const nextMilestone = roadmap?.milestones.find((milestone) => milestone.status !== "completed");
  if (roadmap && nextMilestone) {
    addBlock(roadmap.subject, nextMilestone.topic, 45, "Roadmap milestone");
  }

  if (!blocks.length && notes[0]) {
    addBlock(notes[0].subject, notes[0].category || notes[0].subject, 30, "Stay in motion");
  }

  return blocks.slice(0, 4);
}

function buildEmotionalFeedback(notes: StoredNote[], learningItems: StoredLearningItem[], todayPlan: StudyPlanBlock[]) {
  const notesToday = notes.filter((note) => isSameDay(note.createdAt)).length;
  const yesterday = addDays(new Date(), -1);
  const notesYesterday = notes.filter((note) => isSameDay(note.createdAt, yesterday)).length;
  const reviewedToday = learningItems.filter((item) => isSameDay(item.lastReviewedAt)).length;
  const completedBlocks = todayPlan.filter((block) => block.status === "done").length;

  if (todayPlan.length && completedBlocks >= Math.ceil(todayPlan.length * 0.75)) {
    return {
      tone: "positive" as const,
      message: `You completed ${Math.round((completedBlocks / todayPlan.length) * 100)}% of today's plan.`
    };
  }

  if (notesToday > notesYesterday) {
    return {
      tone: "positive" as const,
      message: `You captured ${notesToday - notesYesterday} more study note${notesToday - notesYesterday === 1 ? "" : "s"} than yesterday.`
    };
  }

  if (reviewedToday > 0) {
    return {
      tone: "neutral" as const,
      message: `You cleared ${reviewedToday} revision item${reviewedToday === 1 ? "" : "s"} today.`
    };
  }

  if (todayPlan[0]) {
    return {
      tone: "recovery" as const,
      message: `Today's plan is still open. Start with ${todayPlan[0].topic}.`
    };
  }

  return null;
}

function buildDashboard(notes: StoredNote[], reminders: StoredReminder[], learningItems: StoredLearningItem[], roadmap: StoredRoadmap | null) {
  const syncedRoadmap = syncRoadmapProgress(roadmap, notes);
  const topicInsights = buildTopicInsights(notes, learningItems, syncedRoadmap);
  const revisionQueue = learningItems
    .filter((item) => new Date(item.dueAt).getTime() <= Date.now())
    .sort((left, right) => left.dueAt.localeCompare(right.dueAt));
  const weakTopicAlert = topicInsights[0] ?? null;
  const todayPlan = buildTodayPlan(notes, learningItems, revisionQueue, topicInsights, syncedRoadmap);
  const completedBlocks = todayPlan.filter((block) => block.status === "done").length;
  const subjectCounts = notes.reduce<Record<string, number>>((accumulator, note) => {
    accumulator[note.subject] = (accumulator[note.subject] ?? 0) + 1;
    return accumulator;
  }, {});
  const strongestSubject =
    topicInsights[0]?.subject ??
    Object.entries(subjectCounts).sort((left, right) => right[1] - left[1])[0]?.[0] ??
    "Start with one note";

  return {
    dashboard: {
      totalNotes: notes.length,
      dueToday: revisionQueue.length,
      activeRoadmaps: syncedRoadmap ? 1 : 0,
      latestSubject: notes[0]?.subject ?? syncedRoadmap?.subject ?? "Your first subject",
      strongestSubject,
      streak: computeStreak(notes),
      quickPrompts: buildQuickPrompts(notes, weakTopicAlert, todayPlan),
      todayPlan,
      revisionQueue,
      weakTopicAlert,
      riskTopics: topicInsights.filter((topic) => topic.riskLevel !== "stable").slice(0, 5),
      topicInsights: topicInsights.slice(0, 8),
      emotionalFeedback: buildEmotionalFeedback(notes, learningItems, todayPlan),
      planCompletion: todayPlan.length ? Math.round((completedBlocks / todayPlan.length) * 100) : 0
    },
    notes: notes.slice(0, 6),
    reminders: reminders.filter((reminder) => !reminder.isReviewed).slice(0, 6),
    roadmap: syncedRoadmap
  };
}

function publicUser(user: StoredUser, notes: StoredNote[]): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    streak: computeStreak(notes),
    createdAt: user.createdAt
  };
}

class MemoryStore implements DataStore {
  private users: StoredUser[] = [];
  private notes: StoredNote[] = [];
  private reminders: StoredReminder[] = [];
  private learningItems: StoredLearningItem[] = [];
  private roadmaps: StoredRoadmap[] = [];

  async init() {}

  async createUser(input: CreateUserInput) {
    const user: StoredUser = {
      id: createId("user"),
      email: input.email,
      name: input.name,
      passwordHash: input.passwordHash,
      streak: 0,
      createdAt: nowIso()
    };
    this.users.push(user);
    return user;
  }

  async findUserByEmail(email: string) {
    return this.users.find((user) => user.email === email) ?? null;
  }

  async findUserById(id: string) {
    return this.users.find((user) => user.id === id) ?? null;
  }

  async listNotes(userId: string) {
    return this.notes.filter((note) => note.userId === userId).sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  async createNote(input: CreateNoteInput) {
    const timestamp = nowIso();
    const note: StoredNote = {
      ...input,
      id: createId("note"),
      createdAt: timestamp,
      updatedAt: timestamp
    };
    this.notes.unshift(note);
    return note;
  }

  async deleteNote(userId: string, noteId: string) {
    const previousLength = this.notes.length;
    this.notes = this.notes.filter((note) => !(note.userId === userId && note.id === noteId));
    this.reminders = this.reminders.filter((reminder) => !(reminder.userId === userId && reminder.noteId === noteId));
    this.learningItems = this.learningItems.filter((item) => !(item.userId === userId && item.noteId === noteId));
    return previousLength !== this.notes.length;
  }

  async listReminders(userId: string) {
    return this.reminders
      .filter((reminder) => reminder.userId === userId)
      .sort((left, right) => left.scheduledAt.localeCompare(right.scheduledAt));
  }

  async createReminder(input: CreateReminderInput) {
    const reminder: StoredReminder = {
      ...input,
      id: createId("rem"),
      kind: input.kind ?? "revision"
    };
    this.reminders.push(reminder);
    return reminder;
  }

  async listLearningItems(userId: string) {
    return this.learningItems
      .filter((item) => item.userId === userId)
      .sort((left, right) => left.dueAt.localeCompare(right.dueAt));
  }

  async createLearningItems(input: CreateLearningItemInput[]) {
    const createdAt = nowIso();
    const items = input.map<StoredLearningItem>((item) => ({
      ...item,
      id: createId("learn"),
      reviewCount: 0,
      correctCount: 0,
      lastReviewedAt: null,
      lastOutcome: null,
      createdAt,
      updatedAt: createdAt
    }));
    this.learningItems.push(...items);
    return items;
  }

  async reviewLearningItem(userId: string, itemId: string, outcome: "correct" | "wrong") {
    const index = this.learningItems.findIndex((item) => item.userId === userId && item.id === itemId);
    if (index < 0) {
      return null;
    }

    const current = this.learningItems[index];
    const baseDate = new Date();
    const nextStage = outcome === "correct" ? Math.min(current.reviewStage + 1, REVIEW_INTERVALS.length - 1) : 0;
    const nextInterval = outcome === "correct" ? REVIEW_INTERVALS[nextStage] : REVIEW_INTERVALS[0];
    const updated: StoredLearningItem = {
      ...current,
      reviewStage: nextStage,
      reviewCount: current.reviewCount + 1,
      correctCount: current.correctCount + (outcome === "correct" ? 1 : 0),
      dueAt: addDaysIso(nextInterval, baseDate),
      lastReviewedAt: baseDate.toISOString(),
      lastOutcome: outcome,
      updatedAt: baseDate.toISOString()
    };
    this.learningItems[index] = updated;
    return updated;
  }

  async getActiveRoadmap(userId: string) {
    const roadmap = this.roadmaps.find((entry) => entry.userId === userId && entry.isActive) ?? null;
    if (!roadmap) {
      return null;
    }

    const notes = await this.listNotes(userId);
    return syncRoadmapProgress(roadmap, notes);
  }

  async saveRoadmap(input: CreateRoadmapInput) {
    this.roadmaps = this.roadmaps.map((roadmap) =>
      roadmap.userId === input.userId ? { ...roadmap, isActive: false } : roadmap
    );

    const roadmap: StoredRoadmap = {
      ...input,
      id: createId("roadmap"),
      createdAt: nowIso(),
      isActive: true
    };
    this.roadmaps.unshift(roadmap);
    return roadmap;
  }

  async clearActiveRoadmap(userId: string) {
    this.roadmaps = this.roadmaps.map((roadmap) =>
      roadmap.userId === userId ? { ...roadmap, isActive: false } : roadmap
    );
  }

  async getDashboard(userId: string) {
    const [notes, reminders, learningItems, roadmap] = await Promise.all([
      this.listNotes(userId),
      this.listReminders(userId),
      this.listLearningItems(userId),
      this.getActiveRoadmap(userId)
    ]);

    return buildDashboard(notes, reminders, learningItems, roadmap);
  }
}

class MongoStore implements DataStore {
  private client: MongoClient;
  private dbName: string;
  private db?: Db;

  constructor(uri: string, dbName: string) {
    this.client = new MongoClient(uri);
    this.dbName = dbName;
  }

  private collection(name: string): Collection<any> {
    if (!this.db) {
      throw new Error("Mongo store is not initialized.");
    }

    return this.db.collection(name);
  }

  async init() {
    await this.client.connect();
    this.db = this.client.db(this.dbName);
    await this.collection("users").createIndex({ email: 1 }, { unique: true });
    await this.collection("notes").createIndex({ userId: 1, createdAt: -1 });
    await this.collection("learning_items").createIndex({ userId: 1, dueAt: 1 });
  }

  async createUser(input: CreateUserInput) {
    const user: StoredUser = {
      id: createId("user"),
      email: input.email,
      name: input.name,
      passwordHash: input.passwordHash,
      streak: 0,
      createdAt: nowIso()
    };
    await this.collection("users").insertOne(user);
    return user;
  }

  async findUserByEmail(email: string) {
    return this.collection("users").findOne({ email }, { projection: { _id: 0 } }) as Promise<StoredUser | null>;
  }

  async findUserById(id: string) {
    return this.collection("users").findOne({ id }, { projection: { _id: 0 } }) as Promise<StoredUser | null>;
  }

  async listNotes(userId: string) {
    return this.collection("notes")
      .find({ userId }, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .toArray() as Promise<StoredNote[]>;
  }

  async createNote(input: CreateNoteInput) {
    const timestamp = nowIso();
    const note: StoredNote = {
      ...input,
      id: createId("note"),
      createdAt: timestamp,
      updatedAt: timestamp
    };
    await this.collection("notes").insertOne(note);
    return note;
  }

  async deleteNote(userId: string, noteId: string) {
    const [noteResult] = await Promise.all([
      this.collection("notes").deleteOne({ id: noteId, userId }),
      this.collection("reminders").deleteMany({ noteId, userId }),
      this.collection("learning_items").deleteMany({ noteId, userId })
    ]);
    return noteResult.deletedCount > 0;
  }

  async listReminders(userId: string) {
    return this.collection("reminders")
      .find({ userId }, { projection: { _id: 0 } })
      .sort({ scheduledAt: 1 })
      .toArray() as Promise<StoredReminder[]>;
  }

  async createReminder(input: CreateReminderInput) {
    const reminder: StoredReminder = {
      ...input,
      id: createId("rem"),
      kind: input.kind ?? "revision"
    };
    await this.collection("reminders").insertOne(reminder);
    return reminder;
  }

  async listLearningItems(userId: string) {
    return this.collection("learning_items")
      .find({ userId }, { projection: { _id: 0 } })
      .sort({ dueAt: 1 })
      .toArray() as Promise<StoredLearningItem[]>;
  }

  async createLearningItems(input: CreateLearningItemInput[]) {
    const timestamp = nowIso();
    const items = input.map<StoredLearningItem>((item) => ({
      ...item,
      id: createId("learn"),
      reviewCount: 0,
      correctCount: 0,
      lastReviewedAt: null,
      lastOutcome: null,
      createdAt: timestamp,
      updatedAt: timestamp
    }));
    if (items.length) {
      await this.collection("learning_items").insertMany(items);
    }
    return items;
  }

  async reviewLearningItem(userId: string, itemId: string, outcome: "correct" | "wrong") {
    const current = (await this.collection("learning_items").findOne(
      { id: itemId, userId },
      { projection: { _id: 0 } }
    )) as StoredLearningItem | null;

    if (!current) {
      return null;
    }

    const baseDate = new Date();
    const nextStage = outcome === "correct" ? Math.min(current.reviewStage + 1, REVIEW_INTERVALS.length - 1) : 0;
    const nextInterval = outcome === "correct" ? REVIEW_INTERVALS[nextStage] : REVIEW_INTERVALS[0];
    const updated: StoredLearningItem = {
      ...current,
      reviewStage: nextStage,
      reviewCount: current.reviewCount + 1,
      correctCount: current.correctCount + (outcome === "correct" ? 1 : 0),
      dueAt: addDaysIso(nextInterval, baseDate),
      lastReviewedAt: baseDate.toISOString(),
      lastOutcome: outcome,
      updatedAt: baseDate.toISOString()
    };

    await this.collection("learning_items").updateOne(
      { id: itemId, userId },
      {
        $set: {
          reviewStage: updated.reviewStage,
          reviewCount: updated.reviewCount,
          correctCount: updated.correctCount,
          dueAt: updated.dueAt,
          lastReviewedAt: updated.lastReviewedAt,
          lastOutcome: updated.lastOutcome,
          updatedAt: updated.updatedAt
        }
      }
    );

    return updated;
  }

  async getActiveRoadmap(userId: string) {
    const roadmap = (await this.collection("roadmaps").findOne(
      { userId, isActive: true },
      { projection: { _id: 0 } }
    )) as StoredRoadmap | null;
    if (!roadmap) {
      return null;
    }

    const notes = await this.listNotes(userId);
    return syncRoadmapProgress(roadmap, notes);
  }

  async saveRoadmap(input: CreateRoadmapInput) {
    await this.collection("roadmaps").updateMany({ userId: input.userId }, { $set: { isActive: false } });

    const roadmap: StoredRoadmap = {
      ...input,
      id: createId("roadmap"),
      createdAt: nowIso(),
      isActive: true
    };
    await this.collection("roadmaps").insertOne(roadmap);
    return roadmap;
  }

  async clearActiveRoadmap(userId: string) {
    await this.collection("roadmaps").updateMany({ userId, isActive: true }, { $set: { isActive: false } });
  }

  async getDashboard(userId: string) {
    const [notes, reminders, learningItems, roadmap] = await Promise.all([
      this.listNotes(userId),
      this.listReminders(userId),
      this.listLearningItems(userId),
      this.getActiveRoadmap(userId)
    ]);

    return buildDashboard(notes, reminders, learningItems, roadmap);
  }
}

export const store: DataStore = env.MONGODB_URI
  ? new MongoStore(env.MONGODB_URI, env.MONGODB_DB)
  : new MemoryStore();

export function serializeUser(user: StoredUser, notes: StoredNote[]) {
  return publicUser(user, notes);
}
