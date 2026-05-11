import { NoteModel, type NoteDocument } from "../notes/note.model.js";
import { MemoryEngine } from "../../engines/memory.engine.js";
import { DecayEngine } from "../../engines/decay.engine.js";
import { PriorityEngine } from "../../engines/priority.engine.js";
import { ApiError } from "../../utils/api-error.js";
import { studentIntelligenceService } from "../intelligence/student-intelligence.service.js";
import type { CareerNote, RecallGrade, RecallPrompt, RecallReviewResult, WeakTopic, RevisionPriority } from "@studybuddy/shared";

type RecallStats = {
  totalNotes: number;
  dueCount: number;
  averageStrength: number;
  weakTopics: WeakTopic[];
  reviewedToday: number;
  streakDays: number;
  retentionScore: number;
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
    concepts: note.concepts || [],
    difficulty: (note.difficulty as any) || "beginner",
    knowledgeLayer: (note.knowledgeLayer as any) || "surface",
    interviewImportance: note.interviewImportance ?? 0,
    confusionCount: note.confusionCount ?? 0,
    revisionStrategy: (note.revisionStrategy as any) || "conceptual",
    relatedNoteIds: note.relatedNoteIds || [],
    projectLinks: note.projectLinks || [],
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

/**
 * Generates a diverse recall prompt based on the note's revision strategy and content.
 * Instead of always asking "Explain X from memory", adapts the prompt type
 * based on the concept type, difficulty, and past performance.
 */
function toPrompt(note: NoteDocument): RecallPrompt {
  const topic = topicFor(note);
  const strength = note.strength ?? 0;
  const lapseCount = note.lapseCount ?? 0;
  const reviewCount = note.reviewCount ?? 0;
  const strategy = note.revisionStrategy || "conceptual";
  const concepts = note.concepts || [];
  const metadata = note.metadata as any;

  // Pick the best prompt type based on context
  const { prompt, promptType } = generateDiversePrompt(
    topic,
    note.title,
    strength,
    lapseCount,
    reviewCount,
    strategy,
    concepts,
    metadata
  );

  return {
    noteId: String(note._id),
    title: note.title,
    topic,
    prompt,
    promptType,
    strength,
    nextReviewAt: note.nextReviewAt ? note.nextReviewAt.toISOString() : undefined
  };
}

/**
 * Generates diverse prompt text based on multiple context factors.
 */
function generateDiversePrompt(
  topic: string,
  title: string,
  strength: number,
  lapseCount: number,
  reviewCount: number,
  strategy: string,
  concepts: string[],
  metadata: any
): { prompt: string; promptType: "explain" | "implement" | "compare" | "quiz" | "own_words" } {

  // First review or very weak → simple explanation
  if (reviewCount === 0 || strength < 0.1) {
    return {
      prompt: `Explain "${title}" in your own words. What are the key ideas?`,
      promptType: "own_words"
    };
  }

  // Repeated failures → simplified approach
  if (lapseCount > 3) {
    return {
      prompt: `You've struggled with "${title}" before. In 2-3 simple sentences, explain the core idea of ${topic} as if teaching a beginner.`,
      promptType: "own_words"
    };
  }

  // Implementation strategy → code challenge
  if (strategy === "implementation") {
    const tasks = metadata?.executionTasks;
    if (tasks && tasks.length > 0) {
      const task = tasks[Math.floor(Math.random() * tasks.length)];
      return {
        prompt: `Implementation Challenge: ${task.title}\nDescribe the approach, key steps, and edge cases for this ${topic} problem.`,
        promptType: "implement"
      };
    }
    return {
      prompt: `Write pseudocode or describe step-by-step how you would implement a solution involving ${topic}. Include time/space complexity.`,
      promptType: "implement"
    };
  }

  // If there are multiple concepts → comparison prompt
  if (concepts.length >= 2 && Math.random() < 0.35) {
    const c1 = concepts[Math.floor(Math.random() * concepts.length)];
    let c2 = concepts[Math.floor(Math.random() * concepts.length)];
    if (c1 === c2 && concepts.length > 1) {
      c2 = concepts.find(c => c !== c1) || c2;
    }
    return {
      prompt: `Compare and contrast "${c1}" and "${c2}". When would you use each? What are the key differences?`,
      promptType: "compare"
    };
  }

  // Interview-important concepts → quiz style
  if (metadata?.interviewRelevance?.importance > 60 && Math.random() < 0.4) {
    const questions = metadata.interviewRelevance.commonQuestions;
    if (questions && questions.length > 0) {
      const question = questions[Math.floor(Math.random() * questions.length)];
      return {
        prompt: `Interview Question: ${question}`,
        promptType: "quiz"
      };
    }
    return {
      prompt: `You're in a technical interview. The interviewer asks: "Can you explain ${topic} and when you'd use it in a real project?"`,
      promptType: "quiz"
    };
  }

  // High-strength notes → deepen understanding
  if (strength > 0.6) {
    return {
      prompt: `You've reviewed "${title}" several times. Now go deeper: What are the edge cases, limitations, or common mistakes with ${topic}?`,
      promptType: "explain"
    };
  }

  // Practical repetition strategy
  if (strategy === "practical_repetition") {
    return {
      prompt: `Describe a real-world scenario where you would use ${topic}. Walk through the implementation step by step.`,
      promptType: "implement"
    };
  }

  // Default: active recall
  return {
    prompt: `Explain ${topic} from memory. Cover the key concepts and how they work.`,
    promptType: "explain"
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

/**
 * Gets due prompts with intelligent prioritization.
 * Prioritizes by: urgency (decay), interview importance, lapse count.
 */
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
    .sort({ strength: 1, nextReviewAt: 1 })
    .limit(limit * 2); // Over-fetch to allow re-ranking

  // Re-rank by composite urgency score
  const ranked = notes.map(note => {
    const retention = DecayEngine.calculateRetention(note.lastReviewed, note.strength ?? 0.25);
    const urgencyScore = PriorityEngine.calculatePriorityScore(
      note.strength ?? 0.25,
      retention,
      note.interviewImportance ?? 0,
      note.lapseCount ?? 0,
      note.reviewCount ?? 0,
      true
    );
    return { note, urgencyScore };
  });

  ranked.sort((a, b) => b.urgencyScore - a.urgencyScore);

  return ranked.slice(0, limit).map(r => toPrompt(r.note));
}

/**
 * Reviews a note with enhanced feedback and confusion tracking.
 */
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
    // Track confusion — repeated wrong answers signal confusion
    if ((note.lapseCount ?? 0) > 2) {
      note.confusionCount = (note.confusionCount ?? 0) + 1;
    }
  }

  await note.save();
  
  // Sync with the SM-2 Memory Engine
  const qualityScore = grade === "good" ? 5 : grade === "weak" ? 3 : 1;
  await MemoryEngine.processRecall(userId, noteId, qualityScore).catch(e => console.error("MemoryEngine error:", e));

  // Generate contextual feedback based on grade and history
  const feedback = generateFeedback(grade, note);

  studentIntelligenceService.emitEvent(userId, {
    type: grade === "good" ? "RECALL_PASSED" : grade === "weak" ? "RECALL_WEAK" : "RECALL_FAILED",
    source: "recall",
    entityId: noteId,
    payload: {
      noteTitle: note.title,
      topic: topicFor(note),
      grade,
      score,
      nextStrength,
      concepts: note.concepts ?? []
    }
  }).catch(error => console.error("Student intelligence event failed:", error));

  return {
    note: toNote(note),
    grade,
    score,
    nextReviewAt: nextReviewAt.toISOString(),
    feedback
  };
}

/**
 * Generates intelligent feedback based on grade and note history.
 */
function generateFeedback(grade: RecallGrade, note: NoteDocument): string {
  const reviewCount = note.reviewCount ?? 0;
  const lapseCount = note.lapseCount ?? 0;
  const strength = note.strength ?? 0;
  const topic = topicFor(note);

  if (grade === "good") {
    if (strength > 0.7) {
      return `Excellent mastery of "${topic}"! Review interval has been extended significantly. Consider tackling implementation challenges next.`;
    }
    if (reviewCount > 3) {
      return `Consistent improvement on "${topic}". Your retention is building solid neural pathways. Keep it up!`;
    }
    return `Good recall! "${topic}" is strengthening. The next review has been pushed back to reinforce long-term memory.`;
  }

  if (grade === "weak") {
    if (lapseCount > 2) {
      return `"${topic}" keeps slipping. Try a different approach: write it out step-by-step, or explain it to someone. Scheduled for tomorrow.`;
    }
    return `Partial recall on "${topic}". The core idea is there but details are fading. Another pass tomorrow will solidify it.`;
  }

  // Wrong
  if (lapseCount > 3) {
    return `"${topic}" has lapsed ${lapseCount} times. This signals a fundamental gap. Try breaking it into smaller sub-concepts and revise each separately. Coming back in 6 hours.`;
  }
  if (reviewCount > 5 && strength < 0.2) {
    return `Despite multiple reviews, "${topic}" isn't sticking. Consider re-learning from scratch with a different resource or approach. Scheduled for today.`;
  }
  return `"${topic}" needs another pass today. Focus on the WHY — understanding the reasoning helps more than memorizing facts.`;
}

/**
 * Gets enhanced recall stats with retention and streak data.
 */
async function getStats(userId: string): Promise<RecallStats> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
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

  // Count today's reviews
  const reviewedToday = notes.filter(n =>
    n.lastReviewed && n.lastReviewed >= todayStart
  ).length;

  // Calculate streak
  let streakDays = 0;
  const checkDate = new Date(todayStart);
  for (let i = 0; i < 30; i++) {
    const dayStart = new Date(checkDate);
    const dayEnd = new Date(checkDate);
    dayEnd.setDate(dayEnd.getDate() + 1);
    const hasReview = notes.some(n =>
      n.lastReviewed && n.lastReviewed >= dayStart && n.lastReviewed < dayEnd
    );
    if (hasReview || i === 0) {
      streakDays++;
    } else {
      break;
    }
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Overall retention via decay engine
  const totalRetention = notes.reduce((sum, note) => {
    return sum + DecayEngine.calculateRetention(note.lastReviewed, note.strength ?? 0.25);
  }, 0);
  const retentionScore = notes.length > 0 ? Math.round(totalRetention / notes.length) : 0;

  return {
    totalNotes: notes.length,
    dueCount: notes.filter((note) => !note.nextReviewAt || note.nextReviewAt <= now).length,
    averageStrength: notes.length === 0 ? 0 : totalStrength / notes.length,
    weakTopics,
    reviewedToday,
    streakDays: Math.max(0, streakDays - 1),
    retentionScore
  };
}

export const recallService = {
  getDuePrompts,
  reviewNote,
  getStats
};

export const __recallTestUtils = {
  gradeFromScore,
  applyStrength,
  scheduleNext
};
