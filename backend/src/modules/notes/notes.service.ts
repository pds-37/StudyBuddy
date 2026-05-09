import { NoteModel, type NoteDocument } from "./note.model.js";
import { MemoryItemModel } from "../memory/memory.model.js";
import { ConceptNodeModel } from "../knowledge/concept.model.js";
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

import { groqService } from "../../services/ai/groq.service.js";
import { usersService } from "../users/users.service.js";

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
    sourceType: note.sourceType as any,
    strength: note.strength ?? 0,
    metadata: note.metadata,
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

  // Start AI analysis pipeline asynchronously
  runAnalysisPipeline(userId, note).catch(error =>
    console.error("AI Analysis Pipeline failed for note:", note._id, error)
  );

  // Generate embedding for the new note asynchronously
  vectorSearchService.updateNoteEmbedding(note._id.toString(), userId)
    .catch(error => console.error("Failed to generate embedding for new note:", error));

  // Initialize a MemoryItem for the note itself
  await MemoryItemModel.create({
    userId,
    noteId: note._id.toString(),
    content: note.content.substring(0, 150),
    nextReview: new Date(),
    strength: 0,
    interval: 1,
    repetitions: 0,
    easeFactor: 2.5
  }).catch(error => console.error("Failed to create MemoryItem for note:", error));

  return toNote(note);
}

/**
 * Full AI analysis pipeline for a newly created note.
 * Extracts concepts, builds graph relationships, generates flashcards, and updates concept nodes.
 */
async function runAnalysisPipeline(userId: string, note: NoteDocument): Promise<void> {
  const profile = await usersService.getProfile(userId).catch(() => null);
  const userContext = profile ? `Target roles: ${profile.targetRoles?.join(", ")}` : "";

  const analysis = await groqService.analyzeNote(note.title, note.content, userContext);

  // Update note with enriched analysis data
  await NoteModel.updateOne(
    { _id: note._id },
    {
      $set: {
        metadata: {
          summary: analysis.summary,
          concepts: analysis.concepts,
          flashcards: analysis.flashcards,
          retentionStrength: 25, // Initial
          difficulty: analysis.difficulty,
          conceptGraph: analysis.conceptGraph,
          executionTasks: analysis.executionTasks,
          confusionSignals: analysis.confusionSignals,
          knowledgeLayer: analysis.knowledgeLayer,
          interviewRelevance: analysis.interviewRelevance
        },
        topic: analysis.topic,
        tags: [...new Set([...note.tags, ...analysis.tags])],
        concepts: analysis.concepts,
        difficulty: analysis.difficulty,
        knowledgeLayer: analysis.knowledgeLayer,
        interviewImportance: analysis.interviewRelevance.importance,
        revisionStrategy: analysis.revisionStrategy
      }
    }
  );

  // Initialize MemoryItems for flashcards
  if (analysis.flashcards && analysis.flashcards.length > 0) {
    await Promise.all(analysis.flashcards.map(card =>
      MemoryItemModel.create({
        userId,
        noteId: note._id.toString(),
        content: `Q: ${card.question} | A: ${card.answer}`,
        nextReview: new Date(),
        strength: 0,
        interval: 1,
        repetitions: 0,
        easeFactor: 2.5
      })
    ));
  }

  // Upsert ConceptNodes and link to this note
  await upsertConceptNodes(userId, note._id.toString(), analysis);

  // Find and link related notes by shared concepts
  await linkRelatedNotes(userId, note._id.toString(), analysis.concepts);
}

/**
 * Creates or updates ConceptNode entries for extracted concepts.
 */
async function upsertConceptNodes(
  userId: string,
  noteId: string,
  analysis: Awaited<ReturnType<typeof groqService.analyzeNote>>
): Promise<void> {
  const conceptIds: string[] = [];

  for (const conceptName of analysis.concepts) {
    try {
      const existing = await ConceptNodeModel.findOne({ userId, name: conceptName });

      if (existing) {
        // Add this note to the concept if not already linked
        if (!existing.noteIds.includes(noteId)) {
          existing.noteIds.push(noteId);
          await existing.save();
        }
        conceptIds.push(existing._id.toString());
      } else {
        // Determine category from concept graph relationships
        const category = inferConceptCategory(conceptName, analysis.topic);

        const newConcept = await ConceptNodeModel.create({
          userId,
          name: conceptName,
          category,
          difficulty: analysis.difficulty,
          noteIds: [noteId],
          interviewFrequency: analysis.interviewRelevance.frequency === "high" ? "high" : "medium"
        });
        conceptIds.push(newConcept._id.toString());
      }
    } catch (error) {
      // Duplicate key errors are fine — concept already exists
      if ((error as any)?.code !== 11000) {
        console.error(`Failed to upsert concept "${conceptName}":`, error);
      }
    }
  }

  // Link related concepts based on conceptGraph edges
  for (const edge of analysis.conceptGraph) {
    try {
      const fromConcept = await ConceptNodeModel.findOne({ userId, name: edge.from });
      const toConcept = await ConceptNodeModel.findOne({ userId, name: edge.to });

      if (fromConcept && toConcept) {
        const fromId = fromConcept._id.toString();
        const toId = toConcept._id.toString();

        if (!fromConcept.relatedConceptIds.includes(toId)) {
          fromConcept.relatedConceptIds.push(toId);
          await fromConcept.save();
        }
        if (!toConcept.relatedConceptIds.includes(fromId)) {
          toConcept.relatedConceptIds.push(fromId);
          await toConcept.save();
        }
      }
    } catch (error) {
      console.error("Failed to link concept edge:", edge, error);
    }
  }
}

/**
 * Infers concept category from the topic and concept name.
 */
function inferConceptCategory(
  conceptName: string,
  topic: string
): "algorithm" | "framework" | "pattern" | "language" | "concept" | "tool" {
  const lower = (conceptName + " " + topic).toLowerCase();

  const algoKeywords = ["algorithm", "sort", "search", "bfs", "dfs", "tree", "graph", "heap", "dynamic programming", "recursion", "traversal"];
  if (algoKeywords.some(k => lower.includes(k))) return "algorithm";

  const frameworkKeywords = ["react", "next", "vue", "angular", "express", "node", "django", "flask", "spring"];
  if (frameworkKeywords.some(k => lower.includes(k))) return "framework";

  const patternKeywords = ["pattern", "singleton", "observer", "factory", "decorator", "middleware", "mvc"];
  if (patternKeywords.some(k => lower.includes(k))) return "pattern";

  const langKeywords = ["javascript", "typescript", "python", "java", "c++", "rust", "go"];
  if (langKeywords.some(k => lower.includes(k))) return "language";

  const toolKeywords = ["git", "docker", "kubernetes", "webpack", "vite", "npm", "database", "sql", "mongodb", "redis"];
  if (toolKeywords.some(k => lower.includes(k))) return "tool";

  return "concept";
}

/**
 * Finds notes that share concepts and creates bidirectional links.
 */
async function linkRelatedNotes(
  userId: string,
  noteId: string,
  concepts: string[]
): Promise<void> {
  if (concepts.length === 0) return;

  // Find other notes that share any of these concepts
  const relatedNotes = await NoteModel.find({
    userId,
    _id: { $ne: noteId },
    concepts: { $in: concepts },
    deleted: { $ne: true }
  }).limit(10);

  const relatedIds = relatedNotes.map(n => n._id.toString());

  if (relatedIds.length > 0) {
    // Link this note to related notes
    await NoteModel.updateOne(
      { _id: noteId },
      { $addToSet: { relatedNoteIds: { $each: relatedIds } } }
    );

    // Link related notes back to this note
    await NoteModel.updateMany(
      { _id: { $in: relatedIds } },
      { $addToSet: { relatedNoteIds: noteId } }
    );
  }
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

  // Re-run AI analysis if content or title changed
  if (data.title !== undefined || data.content !== undefined) {
    vectorSearchService.updateNoteEmbedding(noteId, userId)
      .catch(error => console.error("Failed to update embedding for modified note:", error));

    // Re-analyze in background
    runAnalysisPipeline(userId, note).catch(error =>
      console.error("Re-analysis pipeline failed:", error)
    );
  }

  return toNote(note);
}

/** Deletes a note, ensuring it belongs to the user. */
async function deleteNote(userId: string, noteId: string): Promise<void> {
  const result = await NoteModel.deleteOne({ _id: noteId, userId });

  if (result.deletedCount === 0) {
    throw new ApiError(404, "Note not found.");
  }

  // Clean up related data
  await MemoryItemModel.deleteMany({ userId, noteId }).catch(() => {});

  // Remove this note from concept nodes
  await ConceptNodeModel.updateMany(
    { userId, noteIds: noteId },
    { $pull: { noteIds: noteId } }
  ).catch(() => {});

  // Remove from related notes
  await NoteModel.updateMany(
    { userId, relatedNoteIds: noteId },
    { $pull: { relatedNoteIds: noteId } }
  ).catch(() => {});
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
