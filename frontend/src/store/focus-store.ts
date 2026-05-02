import { create } from "zustand";

type FocusState = {
  isActive: boolean;
  timeLeft: number; // in seconds
  duration: number; // in seconds
  startSprint: (minutes: number) => void;
  stopSprint: () => void;
  tick: () => void;
};

export const useFocusStore = create<FocusState>((set) => ({
  isActive: false,
  timeLeft: 0,
  duration: 0,

  startSprint: (minutes: number) => {
    set({
      isActive: true,
      duration: minutes * 60,
      timeLeft: minutes * 60,
    });
  },

  stopSprint: () => {
    set({
      isActive: false,
      timeLeft: 0,
    });
  },

  tick: () => {
    set((state) => {
      if (!state.isActive || state.timeLeft <= 0) return state;
      return { timeLeft: state.timeLeft - 1 };
    });
  },
}));
