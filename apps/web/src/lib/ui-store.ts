import { create } from "zustand";
import { persist } from "zustand/middleware";

type UiStore = {
  composerOpen: boolean;
  composerSeed: {
    content?: string;
    subjectHint?: string;
  } | null;
  openComposer: (seed?: { content?: string; subjectHint?: string }) => void;
  closeComposer: () => void;
};

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      composerOpen: false,
      composerSeed: null,
      openComposer: (seed) => set({ composerOpen: true, composerSeed: seed ?? null }),
      closeComposer: () => set({ composerOpen: false, composerSeed: null })
    }),
    {
      name: "study-buddy-ui"
    }
  )
);
