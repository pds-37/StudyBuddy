import { NoteModel, type NoteDocument } from "./note.model.js";
import { MemoryItemModel } from "../memory/memory.model.js";
import { ApiError } from "../../utils/api-error.js";
import { vectorSearchService } from "../../services/ai/vector-search.service.js";
import type { CareerNote } from "@studybuddy/shared";

type CreateNoteData = {
  title: string;
  content: string;
  topic?: string;
  tags?: string[];
  linkedSkills?: string[];
  sourceUrl?: string;
  strength?: number;
  nextReviewAt?: string;
};

type UpdateNoteData = Partial<CreateNoteData>;

type NotesQuery = {
  tags?: string;
  linkedSkills?: string;
  limit: number;
  offset: number;
};

/** Converts a note document to the public API shape. */
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

/** Creates a new note for the user. */
async function createNote(userId: string, data: CreateNoteData): Promise<CareerNote> {
  const note = await NoteModel.create({
    userId,
    title: data.title,
    content: data.content,
    topic: data.topic ?? data.tags?.[0],
    tags: data.tags ?? [],
    linkedSkills: data.linkedSkills ?? [],
    sourceUrl: data.sourceUrl,
    strength: data.strength ?? 0.25,
    nextReviewAt: data.nextReviewAt ? new Date(data.nextReviewAt) : new Date()
  });

  // Generate embedding for the new note asynchronously
  // We don't await this to avoid blocking the response
  vectorSearchService.updateNoteEmbedding(note._id.toString(), userId)
    .catch(error => console.error("Failed to generate embedding for new note:", error));

  // Initialize a MemoryItem for Spaced Repetition tracking
  await MemoryItemModel.create({
    userId,
    noteId: note._id.toString(),
    content: note.content.substring(0, 150), // brief snippet
    nextReview: new Date(), // start review cycle immediately
    strength: 0,
    interval: 1,
    repetitions: 0,
    easeFactor: 2.5
  }).catch(error => console.error("Failed to create MemoryItem for note:", error));

  return toNote(note);
}

/** Retrieves a single note by ID, ensuring it belongs to the user. */
async function getNote(userId: string, noteId: string): Promise<CareerNote> {
  const note = await NoteModel.findOne({ _id: noteId, userId });

  if (!note) {
    throw new ApiError(404, "Note not found.");
  }

  return toNote(note);
}

/** Updates an existing note, ensuring it belongs to the user. */
async function updateNote(userId: string, noteId: string, data: UpdateNoteData): Promise<CareerNote> {
  const note = await NoteModel.findOneAndUpdate(
    { _id: noteId, userId },
    {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.content !== undefined && { content: data.content }),
      ...(data.topic !== undefined && { topic: data.topic }),
      ...(data.tags !== undefined && { tags: data.tags }),
      ...(data.linkedSkills !== undefined && { linkedSkills: data.linkedSkills }),
      ...(data.sourceUrl !== undefined && { sourceUrl: data.sourceUrl }),
      ...(data.strength !== undefined && { strength: data.strength }),
      ...(data.nextReviewAt !== undefined && { nextReviewAt: new Date(data.nextReviewAt) })
    },
    { new: true, runValidators: true }
  );

  if (!note) {
    throw new ApiError(404, "Note not found.");
  }

  // Regenerate embedding if content or title changed
  if (data.title !== undefined || data.content !== undefined) {
    vectorSearchService.updateNoteEmbedding(noteId, userId)
      .catch(error => console.error("Failed to update embedding for modified note:", error));
  }

  return toNote(note);
}

/** Deletes a note, ensuring it belongs to the user. */
async function deleteNote(userId: string, noteId: string): Promise<void> {
  const result = await NoteModel.deleteOne({ _id: noteId, userId });

  if (result.deletedCount === 0) {
    throw new ApiError(404, "Note not found.");
  }
}

/** Lists notes for the user with optional filtering. */
async function listNotes(userId: string, query: NotesQuery): Promise<{ notes: CareerNote[]; total: number }> {
  const filter: any = { userId, deleted: { $ne: true } };

  if (query.tags) {
    filter.tags = { $in: query.tags.split(",").map(tag => tag.trim()) };
  }

  if (query.linkedSkills) {
    filter.linkedSkills = { $in: query.linkedSkills.split(",").map(skill => skill.trim()) };
  }

  const total = await NoteModel.countDocuments(filter);
  const notes = await NoteModel.find(filter)
    .sort({ updatedAt: -1 })
    .skip(query.offset)
    .limit(query.limit);

  return {
    notes: notes.map(toNote),
    total
  };
}

export const notesService = {
  createNote,
  getNote,
  updateNote,
  deleteNote,
  listNotes,
  searchNotes: vectorSearchService.searchNotes,
  updateAllNoteEmbeddings: vectorSearchService.updateAllNoteEmbeddings,
  getNotesContextForQuery: vectorSearchService.getNotesContextForQuery
};
