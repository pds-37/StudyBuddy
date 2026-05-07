import { create } from "zustand";
import { type CareerNote } from "@studybuddy/shared";
import { listNotes, createNote as apiCreateNote } from "../lib/api/notes";

interface NotesStore {
  notes: CareerNote[];
  loading: boolean;
  error: string | null;
  fetchNotes: () => Promise<void>;
  createNote: (data: any) => Promise<void>;
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: [],
  loading: false,
  error: null,
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
    set({ loading: true, error: null });
    try {
      const newNote = await apiCreateNote(data);
      set({ 
        notes: [newNote, ...get().notes],
        loading: false 
      });
    } catch (err: any) {
      set({ error: err.message || "Failed to create note", loading: false });
    }
  }
}));

