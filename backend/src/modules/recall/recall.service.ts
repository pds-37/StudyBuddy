import { NoteModel, type NoteDocument } from "../notes/note.model.js";
import { MemoryEngine } from "../../engines/memory.engine.js";
import { ApiError } from "../../utils/api-error.js";
import type { CareerNote, RecallGrade, RecallPrompt, RecallReviewResult, WeakTopic } from "@studybuddy/shared";

type RecallStats = {
  totalNotes: number;
  dueCount: number;
  averageStrength: number;
  weakTopics: WeakTopic[];
};

const STOP_WORDS = new Set([
  "about", "after", "again", "also", "because", "before", "being", "between", "could", "from",
  "have", "into", "more", "only", "that", "their", "there", "these", "this", "with", "would",
  "what", "when", "where", "which", "while", "your"
]);

function toNote(note: NoteDocument): CareerNote {
  return {
    id: String(note._id),
    userId: note.userId,
    title: note.title,
    content: note.content,
    topic: note.topic ?? undefined,
    tags: note.tags,
    linkedSkills: note.linkedSkills,
    sourceUrl: note.sourceUrl ?? undefined,
    strength: note.strength ?? 0,
    nextReviewAt: note.nextReviewAt ? note.nextReviewAt.toISOString() : undefined,
    lastReviewed: note.lastReviewed ? note.lastReviewed.toISOString() : undefined,
    reviewCount: note.reviewCount ?? 0,
    lapseCount: note.lapseCount ?? 0,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString()
  };
}

function topicFor(note: NoteDocument) {
  return note.topic || note.tags[0] || note.linkedSkills[0] || note.title;
}

function toPrompt(note: NoteDocument): RecallPrompt {
  const topic = topicFor(note);

  return {
    noteId: String(note._id),
    title: note.title,
    topic,
    prompt: `Explain ${topic} from memory.`,
    strength: note.strength ?? 0,
    nextReviewAt: note.nextReviewAt ? note.nextReviewAt.toISOString() : undefined
  };
}

function tokenize(value: string) {
  return new Set(
    value
      .toLowerCase()
      .replace(/[^a-z0-9+#\s-]/g, " ")
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length > 3 && !STOP_WORDS.has(token))
  );
}

function scoreAnswer(note: NoteDocument, answer: string) {
  const sourceTokens = tokenize(`${note.title} ${topicFor(note)} ${note.tags.join(" ")} ${note.content}`);
  const answerTokens = tokenize(answer);

  if (sourceTokens.size === 0 || answerTokens.size === 0) {
    return 0;
  }

  let matches = 0;
  for (const token of sourceTokens) {
    if (answerTokens.has(token)) {
      matches += 1;
    }
  }

  return Math.min(1, matches / Math.min(sourceTokens.size, 12));
}

function gradeFromScore(score: number, requestedGrade?: RecallGrade): RecallGrade {
  if (requestedGrade) {
    return requestedGrade;
  }

  if (score >= 0.55) {
    return "good";
  }

  if (score >= 0.22) {
    return "weak";
  }

  return "wrong";
}

function addHours(base: Date, hours: number) {
  return new Date(base.getTime() + hours * 60 * 60 * 1000);
}

function scheduleNext(strength: number, grade: RecallGrade) {
  const now = new Date();

  if (grade === "good") {
    return addHours(now, Math.max(72, Math.round((3 + strength * 10) * 24)));
  }

  if (grade === "weak") {
    return addHours(now, 24);
  }

  return addHours(now, 6);
}

function applyStrength(current: number, grade: RecallGrade) {
  if (grade === "good") {
    return Math.min(1, current + 0.18);
  }

  if (grade === "weak") {
    return Math.min(0.8, current + 0.06);
  }

  return Math.max(0.05, current * 0.45);
}

async function getDuePrompts(userId: string, limit = 10): Promise<RecallPrompt[]> {
  const notes = await NoteModel.find({
    userId,
    deleted: { $ne: true },
    $or: [
      { nextReviewAt: { $lte: new Date() } },
      { nextReviewAt: null },
      { nextReviewAt: { $exists: false } }
    ]
  })
    .sort({ nextReviewAt: 1, strength: 1 })
    .limit(limit);

  return notes.map(toPrompt);
}

async function reviewNote(
  userId: string,
  noteId: string,
  answer: string,
  requestedGrade?: RecallGrade
): Promise<RecallReviewResult> {
  const note = await NoteModel.findOne({ _id: noteId, userId, deleted: { $ne: true } });

  if (!note) {
    throw new ApiError(404, "Recall note not found.");
  }

  const score = scoreAnswer(note, answer);
  const grade = gradeFromScore(score, requestedGrade);
  const nextStrength = applyStrength(note.strength ?? 0.25, grade);
  const nextReviewAt = scheduleNext(nextStrength, grade);

  note.strength = nextStrength;
  note.lastReviewed = new Date();
  note.nextReviewAt = nextReviewAt;
  note.reviewCount = (note.reviewCount ?? 0) + 1;
  if (grade === "wrong") {
    note.lapseCount = (note.lapseCount ?? 0) + 1;
  }

  await note.save();
  
  // Sync with the new SM-2 Memory Engine architecture
  const qualityScore = grade === "good" ? 5 : grade === "weak" ? 3 : 1;
  await MemoryEngine.processRecall(userId, noteId, qualityScore).catch(e => console.error("MemoryEngine error:", e));

  return {
    note: toNote(note),
    grade,
    score,
    nextReviewAt: nextReviewAt.toISOString(),
    feedback: grade === "good"
      ? "Strong recall. The review interval has been expanded."
      : grade === "weak"
        ? "Partial recall. Review this again tomorrow."
        : "This needs another pass today before it sticks."
  };
}

async function getStats(userId: string): Promise<RecallStats> {
  const now = new Date();
  const notes = await NoteModel.find({ userId, deleted: { $ne: true } });
  const totalStrength = notes.reduce((sum, note) => sum + (note.strength ?? 0), 0);
  const topicMap = new Map<string, { strength: number; count: number; due: number }>();

  for (const note of notes) {
    const topic = topicFor(note);
    const bucket = topicMap.get(topic) ?? { strength: 0, count: 0, due: 0 };
    bucket.strength += note.strength ?? 0;
    bucket.count += 1;
    if (!note.nextReviewAt || note.nextReviewAt <= now) {
      bucket.due += 1;
    }
    topicMap.set(topic, bucket);
  }

  const weakTopics = [...topicMap.entries()]
    .map(([topic, value]) => ({
      topic,
      noteCount: value.count,
      averageStrength: value.count === 0 ? 0 : value.strength / value.count,
      dueCount: value.due
    }))
    .sort((a, b) => a.averageStrength - b.averageStrength || b.dueCount - a.dueCount)
    .slice(0, 8);

  return {
    totalNotes: notes.length,
    dueCount: notes.filter((note) => !note.nextReviewAt || note.nextReviewAt <= now).length,
    averageStrength: notes.length === 0 ? 0 : totalStrength / notes.length,
    weakTopics
  };
}

export const recallService = {
  getDuePrompts,
  reviewNote,
  getStats
};
