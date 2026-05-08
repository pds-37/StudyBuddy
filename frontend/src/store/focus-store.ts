import { create } from "zustand";

type FocusState = {
  isActive: boolean;
  isPaused: boolean;
  timeLeft: number; // in seconds
  duration: number; // in seconds
  startSprint: (minutes: number) => void;
  stopSprint: () => void;
  pauseSprint: () => void;
  resumeSprint: () => void;
  tick: () => void;
};

export const useFocusStore = create<FocusState>((set) => ({
  isActive: false,
  isPaused: false,
  timeLeft: 0,
  duration: 0,

  startSprint: (minutes: number) => {
    set({
      isActive: true,
      isPaused: false,
      duration: minutes * 60,
      timeLeft: minutes * 60,
    });
  },

  stopSprint: () => {
    set({
      isActive: false,
      isPaused: false,
      timeLeft: 0,
    });
  },

  pauseSprint: () => {
    set({ isPaused: true });
  },

  resumeSprint: () => {
    set({ isPaused: false });
  },

  tick: () => {
    set((state) => {
      if (!state.isActive || state.isPaused || state.timeLeft <= 0) return state;
      return { timeLeft: state.timeLeft - 1 };
    });
  },
}));
