import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Brain, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  MessageSquare, 
  Play, 
  Square, 
  Timer, 
  Zap,
  Target,
  Rocket,
  ArrowUpRight
} from "lucide-react";
import { getMentorToday, updateMentorTaskStatus } from "../lib/api/mentor";
import { logBehavior } from "../lib/api/behavior";
import { registerConfidence } from "../lib/api/memory";
import { useFocusStore } from "../store/focus-store";
import { useCopilotStore } from "../store/copilot-store";
import { cn } from "../lib/utils/cn";
import { AnimatePresence, motion } from "framer-motion";
import type { MentorTask } from "@studybuddy/shared";

export function StudyPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  
  const [task, setTask] = useState<MentorTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfidence, setShowConfidence] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isActive, timeLeft, duration, startSprint, stopSprint, tick } = useFocusStore();
  const { sendMessage, currentConversation, createNewConversation } = useCopilotStore();

  useEffect(() => {
    const loadTask = async () => {
      try {
        setLoading(true);
        const plan = await getMentorToday();
        const foundTask = plan.tasks.find(t => t.id === taskId);
        
        if (!foundTask) {
          setError("Task not found in today's plan.");
          return;
        }
        
        setTask(foundTask);
        
        // Log behavior: starting a study session
        await logBehavior("session_started", { taskId, type: foundTask.type });
        
        if (foundTask.status === "pending") {
          await updateMentorTaskStatus(taskId!, "in_progress");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load task");
      } finally {
        setLoading(false);
      }
    };

    void loadTask();
  }, [taskId]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => tick(), 1000);
    } else if (isActive && timeLeft === 0) {
      stopSprint();
      handleSprintComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, tick, stopSprint]);

  const handleSprintComplete = async () => {
    if (!currentConversation) await createNewConversation();
    await sendMessage(`I just finished a 45-minute focus session on "${task?.title}". Can you quiz me on what I should have learned or help me review the core concepts?`);
  };

  const handleCompleteClick = () => {
    setShowConfidence(true);
  };

  const submitConfidence = async (score: number) => {
    if (!task) return;
    try {
      setLoading(true);
      await updateMentorTaskStatus(task.id, "completed");
      await logBehavior("task_completed", { taskId: task.id, type: task.type, confidence: score });
      
      // The Confidence Engine: Update memory intervals based on self-assessment
      // If the task has a noteId in metadata (simulated), we'd use it. 
      // For now, we use the task ID as a topic proxy if no note exists.
      await registerConfidence(task.id, score);
      
      navigate("/dashboard");
    } catch (err) {
      setError("Failed to complete task");
      setShowConfidence(false);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-6 text-center">
        <p className="text-red-200">{error || "Task not found"}</p>
        <Link to="/dashboard" className="mt-4 inline-block text-sm text-cyan hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const progress = duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <header className="flex items-center justify-between">
        <Link to="/dashboard" className="group flex items-center gap-2 text-slate-400 hover:text-white transition">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Mission Control</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Execution Mode</span>
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          {/* Main Task Card */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 lg:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Target size={120} className="text-brand" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-brand/10 p-3 text-brand">
                  <Rocket size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-cyan">{task.type}</p>
                  <h1 className="mt-1 text-3xl font-bold text-white">{task.title}</h1>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-brand" />
                  <span>{task.estimatedMinutes} Minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <span className="capitalize">{task.priority} Priority</span>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Mission Objective</h3>
                <p className="text-lg leading-relaxed text-slate-300">
                  {task.description}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/[0.02] border border-white/5 p-5">
                <div>
                  <p className="text-xs font-semibold text-cyan uppercase tracking-tighter mb-2">Veda AI Context</p>
                  <p className="text-sm italic text-slate-400">"{task.reason}"</p>
                </div>
                {task.href && task.href !== location.pathname && (
                  <Link
                    to={task.href}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-white/10 hover:border-white/20"
                  >
                    Open in Tool
                    <ArrowUpRight size={14} />
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Focus Engine */}
          <div className="rounded-3xl border border-brand/20 bg-brand/[0.02] p-8 text-center relative overflow-hidden">
            <div 
              className="absolute bottom-0 left-0 h-1 bg-brand transition-all duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
            
            <h2 className="text-xl font-bold text-white">Focus Engine</h2>
            <p className="mt-2 text-sm text-slate-400">Deep work session for maximum retention</p>
            
            <div className="mt-10 mb-8">
              <span className="text-7xl font-mono font-bold tracking-tighter text-white">
                {formatTime(timeLeft)}
              </span>
            </div>

            <div className="flex justify-center gap-4">
              {!isActive ? (
                <button
                  onClick={() => startSprint(45)}
                  className="flex items-center gap-2 rounded-2xl bg-brand px-8 py-4 text-lg font-bold text-white shadow-[0_0_30px_rgba(124,92,255,0.3)] transition hover:scale-105 hover:bg-brand/90"
                >
                  <Play className="h-5 w-5 fill-current" />
                  Start 45m Sprint
                </button>
              ) : (
                <button
                  onClick={stopSprint}
                  className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-lg font-bold text-white transition hover:bg-white/10"
                >
                  <Square className="h-5 w-5 fill-current" />
                  Stop Session
                </button>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 flex flex-col h-[600px]">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-lg bg-cyan/10 p-2 text-cyan">
                <MessageSquare size={20} />
              </div>
              <h2 className="font-bold text-white">Task Assistant</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-4 text-sm text-slate-300 leading-relaxed">
                Hello! I'm here to help you with <strong>{task.title}</strong>. 
                <br /><br />
                Whether you need a concept explained, a code snippet reviewed, or a quick quiz to test your understanding, just ask!
              </div>
              
              {currentConversation?.messages.filter(m => m.role !== 'system').map((msg, i) => (
                <div key={i} className={cn(
                  "max-w-[90%] rounded-2xl px-4 py-3 text-sm",
                  msg.role === 'user' 
                    ? "ml-auto bg-brand/20 text-white border border-brand/20" 
                    : "bg-white/[0.02] text-slate-300 border border-white/5"
                )}>
                  {msg.content}
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/5">
              <button 
                onClick={() => navigate("/copilot")}
                className="w-full py-3 rounded-xl bg-white/[0.05] text-sm font-semibold text-slate-300 hover:bg-white/[0.1] transition"
              >
                Open Full Veda Chat
              </button>
            </div>
          </div>

          <button
            onClick={handleCompleteClick}
            className="w-full flex items-center justify-center gap-3 rounded-3xl bg-emerald-500 py-6 text-xl font-black text-slate-950 shadow-[0_0_40px_rgba(16,185,129,0.2)] transition hover:scale-[1.02] hover:bg-emerald-400"
          >
            <CheckCircle2 size={24} />
            MISSION COMPLETE
          </button>
        </aside>
      </div>

      {/* Confidence Engine Modal */}
      <AnimatePresence>
        {showConfidence && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfidence(false)}
              className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg rounded-[2.5rem] border border-white/10 bg-panel p-8 shadow-2xl"
            >
              <div className="text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center text-brand mb-6">
                  <Brain size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white">How confident do you feel?</h2>
                <p className="mt-2 text-slate-400 text-sm">Be honest—this tunes Veda's memory engine to optimize your next review session.</p>
              </div>

              <div className="mt-8 grid grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    onClick={() => void submitConfidence(score)}
                    className="group flex flex-col items-center gap-2"
                  >
                    <div className="w-full aspect-square rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-xl font-bold text-slate-400 transition-all group-hover:bg-brand group-hover:text-white group-hover:border-brand group-hover:scale-110">
                      {score}
                    </div>
                    <span className="text-[10px] uppercase tracking-tighter text-slate-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      {score === 1 ? 'Lost' : score === 3 ? 'Okay' : score === 5 ? 'Master' : ''}
                    </span>
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setShowConfidence(false)}
                className="mt-8 w-full py-3 text-sm font-medium text-slate-500 hover:text-white transition"
              >
                Skip Assessment
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
