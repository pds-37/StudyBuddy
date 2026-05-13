import { create } from "zustand";
import type { CareerNote, KnowledgeHealthMetrics, RevisionPriority, ConceptNode } from "@studybuddy/shared";
import { listNotes, createNote as apiCreateNote, deleteNote as apiDeleteNote, updateNote as apiUpdateNote, searchNotesVector, ingestLearning as apiIngestLearning, listContradictions as apiListContradictions, resolveContradiction as apiResolveContradiction, uploadStudyMaterial as apiUploadStudyMaterial, type ContradictionItem } from "../lib/api/notes";
import { getKnowledgeHealth, getRevisionPriorities, getConcepts } from "../lib/api/intelligence";

interface NotesStore {
  // Core state
  notes: CareerNote[];
  loading: boolean;
  error: string | null;

  // Knowledge intelligence state
  knowledgeHealth: KnowledgeHealthMetrics | null;
  revisionPriorities: RevisionPriority[];
  concepts: ConceptNode[];
  contradictions: ContradictionItem[];
  healthLoading: boolean;

  // Search
  searchResults: CareerNote[];
  searchLoading: boolean;

  // Active note (for detail panel)
  activeNote: CareerNote | null;

  // Core actions
  fetchNotes: () => Promise<void>;
  createNote: (data: any) => Promise<void>;
  ingestLearning: (text: string) => Promise<void>;
  uploadStudyMaterial: (file: File) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  updateNote: (id: string, data: any) => Promise<void>;
  fetchContradictions: () => Promise<void>;
  resolveContradiction: (id: string, resolutionNote?: string) => Promise<void>;
  setActiveNote: (note: CareerNote | null) => void;

  // Intelligence actions
  fetchKnowledgeHealth: () => Promise<void>;
  fetchRevisionPriorities: () => Promise<void>;
  fetchConcepts: () => Promise<void>;

  // Search actions
  searchNotes: (query: string) => Promise<void>;
  clearSearch: () => void;
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  // Core state
  notes: [],
  loading: false,
  error: null,

  // Intelligence state
  knowledgeHealth: null,
  revisionPriorities: [],
  concepts: [],
  contradictions: [],
  healthLoading: false,

  // Search state
  searchResults: [],
  searchLoading: false,

  // Active note
  activeNote: null,

  // ─── Core Actions ───

  fetchNotes: async () => {
    set({ loading: true, error: null });
    try {
      const response = await listNotes({ limit: 100 });
      set({ notes: response.notes, loading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to load notes", loading: false });
    }
  },

  createNote: async (data) => {
    set({ loading: true });
    try {
      const newNote = await apiCreateNote(data);
      set({
        notes: [newNote, ...get().notes],
        loading: false
      });
    } catch (err: any) {
      set({ loading: false });
      throw err;
    }
  },

  ingestLearning: async (text: string) => {
    set({ loading: true });
    try {
      const newNote = await apiIngestLearning({ text, source: "web" });
      set({
        notes: [newNote, ...get().notes],
        loading: false
      });
    } catch (err: any) {
      set({ loading: false });
      throw err;
    }
  },

  uploadStudyMaterial: async (file: File) => {
    set({ loading: true });
    try {
      const newNote = await apiUploadStudyMaterial(file);
      set({
        notes: [newNote, ...get().notes],
        loading: false
      });
    } catch (err: any) {
      set({ loading: false });
      throw err;
    }
  },

  deleteNote: async (id: string) => {
    try {
      await apiDeleteNote(id);
      set({ notes: get().notes.filter(n => n.id !== id) });
      if (get().activeNote?.id === id) {
        set({ activeNote: null });
      }
    } catch (err: any) {
      set({ error: err.message || "Failed to delete note" });
    }
  },

  updateNote: async (id: string, data: any) => {
    try {
      const updated = await apiUpdateNote(id, data);
      set({
        notes: get().notes.map(n => n.id === id ? updated : n),
        activeNote: get().activeNote?.id === id ? updated : get().activeNote
      });
    } catch (err: any) {
      set({ error: err.message || "Failed to update note" });
    }
  },

  fetchContradictions: async () => {
    try {
      const contradictions = await apiListContradictions();
      set({ contradictions });
    } catch (err: any) {
      console.error("Failed to fetch contradictions:", err);
    }
  },

  resolveContradiction: async (id: string, resolutionNote?: string) => {
    try {
      const updated = await apiResolveContradiction(id, resolutionNote);
      set({
        contradictions: get().contradictions.filter((item) => item.noteId !== id),
        notes: get().notes.map((note) => note.id === id ? updated : note),
        activeNote: get().activeNote?.id === id ? updated : get().activeNote
      });
    } catch (err: any) {
      set({ error: err.message || "Failed to resolve contradiction" });
    }
  },

  setActiveNote: (note) => set({ activeNote: note }),

  // ─── Intelligence Actions ───

  fetchKnowledgeHealth: async () => {
    set({ healthLoading: true });
    try {
      const health = await getKnowledgeHealth();
      set({ knowledgeHealth: health, healthLoading: false });
    } catch (err: any) {
      console.error("Failed to fetch knowledge health:", err);
      set({ healthLoading: false });
    }
  },

  fetchRevisionPriorities: async () => {
    try {
      const priorities = await getRevisionPriorities(8);
      set({ revisionPriorities: priorities });
    } catch (err: any) {
      console.error("Failed to fetch revision priorities:", err);
    }
  },

  fetchConcepts: async () => {
    try {
      const concepts = await getConcepts();
      set({ concepts });
    } catch (err: any) {
      console.error("Failed to fetch concepts:", err);
    }
  },

  // ─── Search Actions ───

  searchNotes: async (query: string) => {
    if (!query.trim()) {
      set({ searchResults: [], searchLoading: false });
      return;
    }
    set({ searchLoading: true });
    try {
      const results = await searchNotesVector(query, { limit: 10 });
      set({ searchResults: results.map(r => r.note), searchLoading: false });
    } catch (err: any) {
      console.error("Search failed:", err);
      set({ searchLoading: false });
    }
  },

  clearSearch: () => set({ searchResults: [], searchLoading: false })
}));
