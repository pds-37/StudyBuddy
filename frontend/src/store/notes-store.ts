import { create } from "zustand";
import { type CareerNote } from "@studybuddy/shared";
import { listNotes } from "../lib/api/notes";

interface NotesStore {
  notes: CareerNote[];
  loading: boolean;
  error: string | null;
  fetchNotes: () => Promise<void>;
}

export const useNotesStore = create<NotesStore>((set) => ({
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
  }
}));
