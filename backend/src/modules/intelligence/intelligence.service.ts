import { NoteModel } from "../notes/note.model.js";
import { ConceptNodeModel } from "../knowledge/concept.model.js";
import { MemoryItemModel } from "../memory/memory.model.js";
import { DecayEngine } from "../../engines/decay.engine.js";
import { PriorityEngine } from "../../engines/priority.engine.js";
import type {
  KnowledgeHealthMetrics,
  RevisionPriority,
  ConceptNode,
  MemoryDecayState
} from "@studybuddy/shared";

/**
 * Intelligence service — aggregates knowledge health, revision priorities,
 * concept analytics, and learning momentum for the Knowledge Intelligence Dashboard.
 */

/** Computes the full Knowledge Health Dashboard metrics. */
async function getKnowledgeHealth(userId: string): Promise<KnowledgeHealthMetrics> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [notes, concepts, todayReviewed] = await Promise.all([
    NoteModel.find({ userId, deleted: { $ne: true } }),
    ConceptNodeModel.find({ userId }),
    NoteModel.countDocuments({
      userId,
      deleted: { $ne: true },
      lastReviewed: { $gte: todayStart }
    })
  ]);

  // Count concept retention states
  let strongConcepts = 0;
  let stableConcepts = 0;
  let weakeningConcepts = 0;
  let criticalConcepts = 0;

  for (const concept of concepts) {
    switch (concept.retentionState) {
      case "strong": strongConcepts++; break;
      case "stable": stableConcepts++; break;
      case "weakening": weakeningConcepts++; break;
      case "critical": criticalConcepts++; break;
    }
  }

  // Calculate overall retention from notes
  const totalRetention = notes.reduce((sum, note) => {
    return sum + DecayEngine.calculateRetention(note.lastReviewed, note.strength ?? 0.25);
  }, 0);
  const overallRetention = notes.length > 0 ? Math.round(totalRetention / notes.length) : 0;

  // Recall health = average strength * 100
  const totalStrength = notes.reduce((sum, note) => sum + (note.strength ?? 0), 0);
  const recallHealth = notes.length > 0 ? Math.round((totalStrength / notes.length) * 100) : 0;

  // Interview readiness = average of interview importance weighted by retention
  const interviewNotes = notes.filter(n => (n.interviewImportance ?? 0) > 30);
  let interviewReadiness = 0;
  if (interviewNotes.length > 0) {
    const weightedSum = interviewNotes.reduce((sum, n) => {
      const retention = DecayEngine.calculateRetention(n.lastReviewed, n.strength ?? 0.25);
      return sum + (retention * (n.interviewImportance ?? 0)) / 100;
    }, 0);
    interviewReadiness = Math.round(weightedSum / interviewNotes.length);
  }

  // Execution readiness = % of notes with reviewCount > 2 and strength > 0.5
  const executionReady = notes.filter(n => (n.reviewCount ?? 0) > 2 && (n.strength ?? 0) > 0.5);
  const executionReadiness = notes.length > 0 ? Math.round((executionReady.length / notes.length) * 100) : 0;

  // Knowledge momentum from 7-day review trend
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const recentReviews = notes.filter(n =>
    n.lastReviewed && n.lastReviewed >= sevenDaysAgo
  ).length;
  const olderReviews = notes.filter(n =>
    n.lastReviewed && n.lastReviewed >= fourteenDaysAgo && n.lastReviewed < sevenDaysAgo
  ).length;

  let knowledgeMomentum: "accelerating" | "steady" | "declining" | "stalled";
  if (recentReviews === 0 && olderReviews === 0) knowledgeMomentum = "stalled";
  else if (recentReviews > olderReviews * 1.3) knowledgeMomentum = "accelerating";
  else if (recentReviews < olderReviews * 0.7) knowledgeMomentum = "declining";
  else knowledgeMomentum = "steady";

  // Due count
  const dueCount = notes.filter(n =>
    !n.nextReviewAt || n.nextReviewAt <= now
  ).length;

  // Streak calculation (consecutive days with at least 1 review)
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

  // Target: aim for reviewing 5-15 items per day based on total note count
  const todayRevisionTarget = Math.min(15, Math.max(5, Math.ceil(notes.length * 0.15)));

  return {
    totalConcepts: concepts.length,
    strongConcepts,
    stableConcepts,
    weakeningConcepts,
    criticalConcepts,
    overallRetention,
    recallHealth,
    interviewReadiness,
    executionReadiness,
    knowledgeMomentum,
    todayRevisionCount: todayReviewed,
    todayRevisionTarget,
    streakDays: Math.max(0, streakDays - 1),
    totalNotes: notes.length,
    dueCount
  };
}

/** Gets today's prioritized revision list. */
async function getRevisionPriorities(userId: string, limit: number = 8): Promise<RevisionPriority[]> {
  return PriorityEngine.generateRevisionPriorities(userId, limit);
}

/** Gets all concept nodes for the user with their retention states. */
async function getConcepts(userId: string): Promise<ConceptNode[]> {
  await DecayEngine.updateConceptRetention(userId).catch(() => {});

  const concepts = await ConceptNodeModel.find({ userId }).sort({ retentionScore: 1 });

  return concepts.map(c => ({
    id: c._id.toString(),
    userId: c.userId,
    name: c.name,
    category: c.category as any,
    difficulty: c.difficulty as any,
    noteIds: c.noteIds,
    relatedConceptIds: c.relatedConceptIds,
    interviewFrequency: c.interviewFrequency as any,
    retentionState: c.retentionState as any,
    retentionScore: c.retentionScore ?? 0,
    masteryValidated: c.masteryValidated ?? false,
    lastReviewed: c.lastReviewed ? c.lastReviewed.toISOString() : undefined,
    projectLinks: c.projectLinks,
    roadmapPhaseIds: c.roadmapPhaseIds,
    executionEvidence: c.executionEvidence ?? 0,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString()
  }));
}

/** Gets memory decay states for all user notes. */
async function getDecayStates(userId: string): Promise<MemoryDecayState[]> {
  return DecayEngine.processUserDecay(userId);
}

/** Gets learning momentum / today's focus recommendation. */
async function getMomentum(userId: string): Promise<{
  state: string;
  streakDays: number;
  reviewedToday: number;
  dailyTarget: number;
  focusConcepts: string[];
  estimatedMinutes: number;
}> {
  const health = await getKnowledgeHealth(userId);
  const priorities = await getRevisionPriorities(userId, 3);

  return {
    state: health.knowledgeMomentum,
    streakDays: health.streakDays,
    reviewedToday: health.todayRevisionCount,
    dailyTarget: health.todayRevisionTarget,
    focusConcepts: priorities.map(p => p.title),
    estimatedMinutes: priorities.reduce((sum, p) => sum + p.estimatedMinutes, 0)
  };
}

export const intelligenceService = {
  getKnowledgeHealth,
  getRevisionPriorities,
  getConcepts,
  getDecayStates,
  getMomentum
};
