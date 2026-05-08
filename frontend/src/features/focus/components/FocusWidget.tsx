import { useEffect } from "react";
import { Play, Square, Timer } from "lucide-react";
import { useFocusStore } from "../../../store/focus-store";
import { useCopilotStore } from "../../../store/copilot-store";
import { cn } from "../../../lib/utils/cn";

export function FocusWidget() {
  const { isActive, timeLeft, duration, startSprint, stopSprint, tick } = useFocusStore();
  const { sendMessage, createNewConversation, currentConversation } = useCopilotStore();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => tick(), 1000);
    } else if (isActive && timeLeft === 0) {
      // Sprint complete
      stopSprint();
      handleSprintComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, tick, stopSprint]);

  const handleSprintComplete = async () => {
    if (!currentConversation) {
      await createNewConversation();
    }
    // Simulate AI checking in
    const message = "I just finished a focus sprint! Ask me what I learned or if I need any concepts explained.";
    await sendMessage(message);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0;

  if (!isActive) {
    return (
      <button
        onClick={() => startSprint(45)}
        className="group flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-700 dark:text-slate-300 transition hover:bg-white/[0.06]"
      >
        <Timer className="h-3.5 w-3.5 text-brand transition-transform group-hover:scale-110" />
        <span className="hidden sm:inline">Start Sprint</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-brand/30 bg-brand/10 px-3 py-1.5 shadow-[0_0_20px_rgba(124,92,255,0.15)] relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-brand/20 transition-all duration-1000 ease-linear"
        style={{ width: `${progress}%` }}
      />
      
      <div className="relative z-10 flex items-center gap-2">
        <Timer className="h-3.5 w-3.5 text-brand animate-pulse" />
        <span className="text-xs font-mono font-semibold tracking-wider text-slate-900 dark:text-slate-900 dark:text-white">
          {formatTime(timeLeft)}
        </span>
      </div>

      <button
        onClick={stopSprint}
        className="relative z-10 ml-2 rounded-md hover:bg-slate-100 dark:bg-slate-100 dark:bg-white/10 p-0.5 text-slate-700 dark:text-slate-700 dark:text-slate-300 transition"
        title="Stop Sprint"
      >
        <Square className="h-3 w-3 fill-current" />
      </button>
    </div>
  );
}
