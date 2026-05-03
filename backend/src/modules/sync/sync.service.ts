import { NoteModel, type NoteDocument } from "../notes/note.model.js";
import { vectorSearchService } from "../../services/ai/vector-search.service.js";

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

/** Converts a Mongoose note document to the canonical sync shape. */
function toSyncShape(doc: NoteDocument) {
  return {
    note_id: doc.noteId,
    user_id: doc.userId,
    title: doc.title,
    content: doc.content,
    topic: doc.topic ?? null,
    tags: doc.tags,
    source: doc.source ?? "web",
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
      existing.source = incoming.source;
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
        source: incoming.source,
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

/** Returns sync health/status information for the given user. */
async function getSyncStatus(userId: string) {
  const lastPushed = await NoteModel.findOne({ userId, source: "cli" })
    .sort({ syncedAt: -1 })
    .select("syncedAt");

  const lastPulled = await NoteModel.findOne({ userId, source: "web" })
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
  getSyncStatus,
};
