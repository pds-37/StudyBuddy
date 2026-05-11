import { NoteModel, type NoteDocument } from "../notes/note.model.js";
import { vectorSearchService } from "../../services/ai/vector-search.service.js";
import { ConceptNodeModel } from "../knowledge/concept.model.js";
import { MemoryItemModel } from "../memory/memory.model.js";
import { StudentIntelligenceEventModel, StudentIntelligenceProfileModel } from "../intelligence/student-intelligence.model.js";
import { MemoryEngine } from "../../engines/memory.engine.js";

/** Shape of a note coming from the C++ agent. */
export type SyncNotePayload = {
  note_id: string;
  user_id: string;
  title: string;
  content: string;
  topic?: string;
  tags: string[];
  source: "cli" | "web";
  created_at: string;
  updated_at: string;
  synced_at: string | null;
  strength?: number;
  next_review_at?: string | null;
  last_reviewed?: string | null;
  review_count?: number;
  lapse_count?: number;
  deleted?: boolean;
  deleted_at?: string | null;
};

type SyncResult = {
  accepted: string[];
  rejected: Array<{ note_id: string; reason: string }>;
  conflicts: Array<{ note_id: string; server_version: ReturnType<typeof toSyncShape> }>;
};

type PullResult = {
  notes: ReturnType<typeof toSyncShape>[];
};

type RecallSyncPayload = {
  note_id: string;
  quality?: number;
  strength?: number;
  next_review_at?: string | null;
  last_reviewed?: string | null;
  review_count?: number;
  lapse_count?: number;
};

/** Converts a Mongoose note document to the canonical sync shape. */
function toSyncShape(doc: NoteDocument) {
  return {
    note_id: doc.noteId,
    user_id: doc.userId,
    title: doc.title,
    content: doc.content,
    topic: doc.topic ?? null,
    tags: doc.tags,
    source: doc.sourceType === "web" ? "web" : "cli",
    created_at: doc.createdAt.toISOString(),
    updated_at: doc.updatedAt.toISOString(),
    synced_at: doc.syncedAt ? doc.syncedAt.toISOString() : null,
    strength: doc.strength ?? 0,
    next_review_at: doc.nextReviewAt ? doc.nextReviewAt.toISOString() : null,
    last_reviewed: doc.lastReviewed ? doc.lastReviewed.toISOString() : null,
    review_count: doc.reviewCount ?? 0,
    lapse_count: doc.lapseCount ?? 0,
    deleted: doc.deleted ?? false,
    deleted_at: doc.deletedAt ? doc.deletedAt.toISOString() : null,
  };
}

/**
 * Processes an array of notes pushed from the C++ agent.
 * Uses last-write-wins conflict resolution based on updated_at.
 */
async function pushNotes(userId: string, notes: SyncNotePayload[], lastSync: string | null): Promise<SyncResult> {
  const accepted: string[] = [];
  const rejected: SyncResult["rejected"] = [];
  const conflicts: SyncResult["conflicts"] = [];

  for (const incoming of notes) {
    // Security: ensure user_id matches the authenticated user
    if (incoming.user_id !== userId) {
      rejected.push({ note_id: incoming.note_id, reason: "user_id mismatch" });
      continue;
    }

    const existing = await NoteModel.findOne({ noteId: incoming.note_id, userId });

    if (existing) {
      const incomingTime = new Date(incoming.updated_at).getTime();
      const existingTime = existing.updatedAt.getTime();

      if (incomingTime <= existingTime) {
        // Server version is newer or same — reject and return server copy
        conflicts.push({ note_id: incoming.note_id, server_version: toSyncShape(existing) });
        continue;
      }

      // Incoming is newer — update server
      existing.title = incoming.title;
      existing.content = incoming.content;
      existing.topic = incoming.topic;
      existing.tags = incoming.tags;
      existing.sourceType = incoming.source === "cli" ? "manual" : "web";
      existing.syncedAt = new Date();
      if (incoming.strength !== undefined) existing.strength = incoming.strength;
      if (incoming.next_review_at !== undefined) existing.nextReviewAt = incoming.next_review_at ? new Date(incoming.next_review_at) : new Date();
      if (incoming.last_reviewed !== undefined) existing.lastReviewed = incoming.last_reviewed ? new Date(incoming.last_reviewed) : null;
      if (incoming.review_count !== undefined) existing.reviewCount = incoming.review_count;
      if (incoming.lapse_count !== undefined) existing.lapseCount = incoming.lapse_count;
      existing.deleted = incoming.deleted ?? false;
      existing.deletedAt = incoming.deleted_at ? new Date(incoming.deleted_at) : null;
      await existing.save();

      // Trigger re-embedding asynchronously
      if (!incoming.deleted) {
        vectorSearchService.updateNoteEmbedding(existing._id.toString(), userId)
          .catch(err => console.error("[sync] Re-embedding failed:", err));
      }

      accepted.push(incoming.note_id);
    } else {
      // New note — create it
      const created = await NoteModel.create({
        noteId: incoming.note_id,
        userId,
        title: incoming.title,
        content: incoming.content,
        topic: incoming.topic ?? incoming.tags[0],
        tags: incoming.tags,
        sourceType: incoming.source === "cli" ? "manual" : "web",
        syncedAt: new Date(),
        strength: incoming.strength ?? 0.25,
        nextReviewAt: incoming.next_review_at ? new Date(incoming.next_review_at) : new Date(),
        lastReviewed: incoming.last_reviewed ? new Date(incoming.last_reviewed) : null,
        reviewCount: incoming.review_count ?? 0,
        lapseCount: incoming.lapse_count ?? 0,
        deleted: incoming.deleted ?? false,
        deletedAt: incoming.deleted_at ? new Date(incoming.deleted_at) : null,
      });

      // Trigger embedding asynchronously
      if (!incoming.deleted) {
        vectorSearchService.updateNoteEmbedding(created._id.toString(), userId)
          .catch(err => console.error("[sync] Embedding for new synced note failed:", err));
      }

      accepted.push(incoming.note_id);
    }
  }

  return { accepted, rejected, conflicts };
}

/**
 * Returns all notes created or updated on the web since the given timestamp.
 * The C++ agent uses this to merge into its local markdown files.
 */
async function pullNotes(userId: string, since: string | null): Promise<PullResult> {
  const filter: Record<string, any> = { userId };

  if (since) {
    filter.updatedAt = { $gt: new Date(since) };
  }

  const docs = await NoteModel.find(filter).sort({ updatedAt: 1 });

  return {
    notes: docs.map(toSyncShape),
  };
}

async function pullConcepts(userId: string, since: string | null) {
  const filter: Record<string, any> = { userId };
  if (since) filter.updatedAt = { $gt: new Date(since) };

  const concepts = await ConceptNodeModel.find(filter).sort({ updatedAt: 1 });
  return {
    concepts: concepts.map((concept) => ({
      id: concept._id.toString(),
      name: concept.name,
      category: concept.category,
      difficulty: concept.difficulty,
      note_ids: concept.noteIds,
      related_concept_ids: concept.relatedConceptIds,
      interview_frequency: concept.interviewFrequency,
      retention_score: concept.retentionScore ?? 0,
      retention_state: concept.retentionState ?? "critical",
      mastery_validated: concept.masteryValidated ?? false,
      last_reviewed: concept.lastReviewed ? concept.lastReviewed.toISOString() : null,
      execution_evidence: concept.executionEvidence ?? 0,
      updated_at: concept.updatedAt.toISOString()
    }))
  };
}

async function pullMemory(userId: string, since: string | null) {
  const filter: Record<string, any> = { userId };
  if (since) filter.updatedAt = { $gt: new Date(since) };

  const items = await MemoryItemModel.find(filter).sort({ updatedAt: 1 });
  return {
    memory: items.map((item) => ({
      id: item._id.toString(),
      note_id: item.noteId,
      content: item.content,
      type: item.type,
      next_review: item.nextReview.toISOString(),
      strength: item.strength ?? 0,
      interval: item.interval ?? 1,
      repetitions: item.repetitions ?? 0,
      ease_factor: item.easeFactor ?? 2.5,
      updated_at: item.updatedAt.toISOString()
    }))
  };
}

async function pushRecall(userId: string, reviews: RecallSyncPayload[]) {
  const accepted: string[] = [];
  const rejected: Array<{ note_id: string; reason: string }> = [];

  for (const review of reviews) {
    const note = await NoteModel.findOne({ noteId: review.note_id, userId });
    if (!note) {
      rejected.push({ note_id: review.note_id, reason: "note not found" });
      continue;
    }

    if (typeof review.quality === "number") {
      await MemoryEngine.processRecall(userId, note._id.toString(), Math.max(0, Math.min(5, review.quality)));
    }

    if (typeof review.strength === "number") note.strength = Math.max(0, Math.min(1, review.strength));
    if (review.next_review_at !== undefined) note.nextReviewAt = review.next_review_at ? new Date(review.next_review_at) : new Date();
    if (review.last_reviewed !== undefined) note.lastReviewed = review.last_reviewed ? new Date(review.last_reviewed) : null;
    if (typeof review.review_count === "number") note.reviewCount = review.review_count;
    if (typeof review.lapse_count === "number") note.lapseCount = review.lapse_count;
    note.syncedAt = new Date();
    await note.save();
    accepted.push(review.note_id);
  }

  return { accepted, rejected };
}

async function pullMentorMemory(userId: string, since: string | null) {
  const [profile, events] = await Promise.all([
    StudentIntelligenceProfileModel.findOne({ userId }),
    StudentIntelligenceEventModel.find({
      userId,
      ...(since ? { updatedAt: { $gt: new Date(since) } } : {})
    }).sort({ createdAt: -1 }).limit(100)
  ]);

  return {
    profile: profile ? {
      user_id: profile.userId,
      target_roles: profile.targetRoles,
      active_tracks: profile.activeTracks,
      weak_concepts: profile.weakConcepts,
      strong_concepts: profile.strongConcepts,
      recall_health: profile.recallHealth,
      memory_retention: profile.memoryRetention,
      consistency_score: profile.consistencyScore,
      learning_velocity: profile.learningVelocity,
      emotional_state: profile.emotionalState,
      adaptive_difficulty: profile.adaptiveDifficulty,
      daily_intelligence: profile.dailyIntelligence,
      system_memory: profile.systemMemory,
      updated_at: profile.updatedAt.toISOString()
    } : null,
    events: events.map((event) => ({
      id: event._id.toString(),
      type: event.type,
      source: event.source,
      entity_id: event.entityId ?? null,
      payload: event.payload,
      impact: event.impact,
      created_at: event.createdAt.toISOString(),
      updated_at: event.updatedAt.toISOString()
    }))
  };
}

/** Returns sync health/status information for the given user. */
async function getSyncStatus(userId: string) {
  const lastPushed = await NoteModel.findOne({ userId, sourceType: "manual" })
    .sort({ syncedAt: -1 })
    .select("syncedAt");

  const lastPulled = await NoteModel.findOne({ userId, sourceType: "web" })
    .sort({ updatedAt: -1 })
    .select("updatedAt");

  const totalNotes = await NoteModel.countDocuments({ userId, deleted: { $ne: true } });

  return {
    last_push: lastPushed?.syncedAt?.toISOString() ?? null,
    last_pull: lastPulled?.updatedAt?.toISOString() ?? null,
    total_notes: totalNotes,
    user_id: userId,
  };
}

export const syncService = {
  pushNotes,
  pullNotes,
  pullConcepts,
  pullMemory,
  pushRecall,
  pullMentorMemory,
  getSyncStatus,
};
