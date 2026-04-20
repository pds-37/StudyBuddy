import { apiClient } from "./client";
import type { CareerNote } from "@studybuddy/shared";

type CreateNoteRequest = {
  title: string;
  content: string;
  tags?: string[];
  linkedSkills?: string[];
  sourceUrl?: string;
};

type UpdateNoteRequest = Partial<CreateNoteRequest>;

type ListNotesResponse = {
  notes: CareerNote[];
  total: number;
};

type VectorSearchResult = {
  note: CareerNote;
  similarity: number;
};

type VectorSearchResponse = {
  results: VectorSearchResult[];
};

type UpdateEmbeddingsResponse = {
  message: string;
};

type NoteResponse = {
  note: CareerNote;
};

/** Creates a new note. */
export async function createNote(data: CreateNoteRequest): Promise<CareerNote> {
  const response = await apiClient.post<NoteResponse>("/notes", data);
  return response.data.note;
}

/** Retrieves a single note by ID. */
export async function getNote(id: string): Promise<CareerNote> {
  const response = await apiClient.get<NoteResponse>(`/notes/${id}`);
  return response.data.note;
}

/** Updates an existing note. */
export async function updateNote(id: string, data: UpdateNoteRequest): Promise<CareerNote> {
  const response = await apiClient.put<NoteResponse>(`/notes/${id}`, data);
  return response.data.note;
}

/** Deletes a note. */
export async function deleteNote(id: string): Promise<void> {
  await apiClient.delete(`/notes/${id}`);
}

/** Lists notes with optional filtering. */
export async function listNotes(params?: {
  tags?: string;
  linkedSkills?: string;
  limit?: number;
  offset?: number;
}): Promise<ListNotesResponse> {
  const response = await apiClient.get<ListNotesResponse>("/notes", { params });
  return response.data;
}

/** Searches notes using semantic vector search. */
export async function searchNotesVector(query: string, options?: {
  limit?: number;
  minSimilarity?: number;
}): Promise<VectorSearchResult[]> {
  const params = {
    q: query,
    limit: options?.limit || 5,
    minSimilarity: options?.minSimilarity || 0.1
  };

  const response = await apiClient.get<VectorSearchResponse>("/notes/search/vector", { params });
  return response.data.results;
}

/** Updates embeddings for all user notes. */
export async function updateAllNoteEmbeddings(): Promise<string> {
  const response = await apiClient.post<UpdateEmbeddingsResponse>("/notes/embeddings/update-all");
  return response.data.message;
}
