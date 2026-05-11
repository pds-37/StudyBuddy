import { NoteModel } from "../../modules/notes/note.model.js";
import { embeddingsService } from "../../services/ai/embeddings.service.js";
import type { CareerNote } from "@studybuddy/shared";

/** Result of a vector search with similarity score. */
export type VectorSearchResult = {
  note: CareerNote;
  similarity: number;
};

/** Converts a note document to the public API shape. */
function toNote(note: any): CareerNote {
  return {
    id: String(note._id),
    userId: note.userId,
    title: note.title,
    content: note.content,
    topic: note.topic ?? undefined,
    tags: note.tags,
    linkedSkills: note.linkedSkills,
    sourceUrl: note.sourceUrl,
    strength: note.strength ?? 0,
    concepts: note.concepts || [],
    difficulty: note.difficulty || "beginner",
    knowledgeLayer: note.knowledgeLayer || "surface",
    interviewImportance: note.interviewImportance ?? 0,
    confusionCount: note.confusionCount ?? 0,
    revisionStrategy: note.revisionStrategy || "conceptual",
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

/** Performs semantic search on user's notes using vector similarity. */
async function searchNotes(
  userId: string,
  query: string,
  limit: number = 5,
  minSimilarity: number = 0.1
): Promise<VectorSearchResult[]> {
  // Generate embedding for the search query
  const queryEmbedding = await embeddingsService.embedText(query);

  // Get all notes for the user that have embeddings
  const notes = await NoteModel.find({
    userId,
    embedding: { $exists: true, $ne: [] }
  });

  // Calculate similarity for each note
  const results: VectorSearchResult[] = [];

  for (const note of notes) {
    if (note.embedding && note.embedding.length > 0) {
      const similarity = embeddingsService.cosineSimilarity(
        queryEmbedding.vector,
        note.embedding
      );

      if (similarity >= minSimilarity) {
        results.push({
          note: toNote(note),
          similarity
        });
      }
    }
  }

  const ranked = results
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);

  if (ranked.length > 0) {
    return ranked;
  }

  const queryTokens = tokenize(query);
  if (queryTokens.size === 0) return [];

  const textNotes = await NoteModel.find({ userId, deleted: { $ne: true } })
    .sort({ updatedAt: -1 })
    .limit(100);

  return textNotes
    .map((note) => {
      const noteTokens = tokenize(`${note.title} ${note.topic ?? ""} ${note.tags.join(" ")} ${(note.concepts ?? []).join(" ")} ${note.content}`);
      let matches = 0;
      for (const token of queryTokens) {
        if (noteTokens.has(token)) matches += 1;
      }
      return { note: toNote(note), similarity: matches / Math.max(queryTokens.size, 1) };
    })
    .filter((result) => result.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

function tokenize(value: string) {
  return new Set(
    value
      .toLowerCase()
      .replace(/[^a-z0-9+#\s-]/g, " ")
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length > 2)
  );
}

/** Updates the embedding for a note. */
async function updateNoteEmbedding(noteId: string, userId: string): Promise<void> {
  const note = await NoteModel.findOne({ _id: noteId, userId });

  if (!note) {
    throw new Error("Note not found");
  }

  // Combine title and content for embedding
  const textToEmbed = `${note.title}\n\n${note.content}`;

  // Generate embedding
  const embedding = await embeddingsService.embedText(textToEmbed);

  // Update the note with the new embedding
  await NoteModel.updateOne(
    { _id: noteId, userId },
    {
      embedding: embedding.vector,
      embeddingProvider: embedding.provider
    }
  );
}

/** Updates embeddings for all notes that don't have them. */
async function updateAllNoteEmbeddings(userId: string): Promise<number> {
  const notesWithoutEmbeddings = await NoteModel.find({
    userId,
    $or: [
      { embedding: { $exists: false } },
      { embedding: { $size: 0 } }
    ]
  });

  let updatedCount = 0;

  for (const note of notesWithoutEmbeddings) {
    try {
      await updateNoteEmbedding(note._id.toString(), userId);
      updatedCount++;
    } catch (error) {
      console.error(`Failed to update embedding for note ${note._id}:`, error);
    }
  }

  return updatedCount;
}

/** Gets notes context for AI chat by finding semantically similar notes. */
async function getNotesContextForQuery(
  userId: string,
  query: string,
  maxNotes: number = 3
): Promise<string> {
  const searchResults = await searchNotes(userId, query, maxNotes, 0.2);

  if (searchResults.length === 0) {
    return "";
  }

  const contextParts = searchResults.map(result =>
    `Note: "${result.note.title}"\nContent: ${result.note.content.substring(0, 500)}${result.note.content.length > 500 ? '...' : ''}`
  );

  return `Relevant notes from your knowledge base:\n\n${contextParts.join('\n\n---\n\n')}`;
}

export const vectorSearchService = {
  searchNotes,
  updateNoteEmbedding,
  updateAllNoteEmbeddings,
  getNotesContextForQuery
};
