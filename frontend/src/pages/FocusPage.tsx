import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Timer, 
  Play, 
  Pause, 
  Square, 
  Brain, 
  Zap, 
  Sparkles,
  ArrowLeft,
  Activity,
  Target,
  Trophy,
  Rocket
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFocusStore } from "../store/focus-store";
import { useCopilotStore } from "../store/copilot-store";
import { useAppStore } from "../store/app-store";
import { NebulaBackground } from "../components/common/NebulaBackground";
import { cn } from "../lib/utils/cn";

export function FocusPage() {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const { 
    isActive, 
    isPaused, 
    timeLeft, 
    duration, 
    startSprint, 
    stopSprint, 
    pauseSprint, 
    resumeSprint, 
    tick 
  } = useFocusStore();
  
  const { sendMessage, createNewConversation, currentConversation } = useCopilotStore();
  const [sessionComplete, setSessionComplete] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive && !isPaused && timeLeft > 0) {
      interval = setInterval(() => tick(), 1000);
    } else if (isActive && timeLeft === 0) {
      handleComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, isPaused, timeLeft, tick]);

  const handleComplete = async () => {
    stopSprint();
    setSessionComplete(true);
    if (!currentConversation) await createNewConversation();
    await sendMessage("I just finished an immersive focus sprint. Can you help me review what I've achieved or suggest the next high-impact task?");
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0;

  return (
    <div className="relative min-h-full flex flex-col items-center justify-center py-10 overflow-hidden">
      <NebulaBackground opacity={0.15} />

      <div className="relative z-10 w-full max-w-4xl px-6">
        {/* Navigation */}
        <header className="absolute top-0 left-6 right-6 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-xs font-bold uppercase tracking-widest">Exit Session</span>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <Activity className="w-3.5 h-3.5 text-cyan animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Biometric Focus: Active</span>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {!sessionComplete ? (
            <motion.div 
              key="timer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center text-center space-y-12"
            >
              {/* Status Header */}
              <div className="space-y-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-brand/10 border border-brand/20 text-brand text-xs font-black uppercase tracking-[0.3em]"
                >
                  <Brain className="w-4 h-4" /> Neural Flow State
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter max-w-2xl mx-auto">
                  {isActive ? "Deep Work Protocol" : "Initialize Focus Engine"}
                </h1>
                <p className="text-slate-500 font-medium max-w-lg mx-auto">
                  Zero distractions. Pure execution. Veda is monitoring your learning velocity.
                </p>
              </div>

              {/* Main Timer Visualization */}
              <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
                {/* Progress Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle 
                    cx="50%" 
                    cy="50%" 
                    r="48%" 
                    fill="transparent" 
                    stroke="currentColor" 
                    strokeWidth="4" 
                    className="text-white/5" 
                  />
                  <motion.circle 
                    cx="50%" 
                    cy="50%" 
                    r="48%" 
                    fill="transparent" 
                    stroke="var(--brand)" 
                    strokeWidth="8" 
                    strokeLinecap="round"
                    strokeDasharray="100 100"
                    animate={{ strokeDashoffset: 100 - progress }}
                    className="transition-all duration-1000 ease-linear shadow-[0_0_30px_rgba(124,92,255,0.5)]" 
                  />
                </svg>

                {/* Inner Glow */}
                <div className={cn(
                  "absolute inset-8 rounded-full bg-brand/5 blur-3xl transition-opacity duration-1000",
                  isActive && !isPaused ? "opacity-100" : "opacity-0"
                )} />

                {/* Time Display */}
                <div className="relative z-10 flex flex-col items-center">
                  <span className="text-7xl md:text-8xl font-mono font-black text-white tracking-tighter">
                    {formatTime(timeLeft)}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 mt-2">
                    {isPaused ? "Paused" : "Remaining"}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-6">
                {!isActive ? (
                  <div className="flex flex-col items-center gap-6">
                    <div className="flex gap-4">
                      {[25, 45, 60, 90].map(mins => (
                        <button
                          key={mins}
                          onClick={() => startSprint(mins)}
                          className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-brand hover:text-black hover:border-brand transition-all text-sm font-black tracking-widest"
                        >
                          {mins}m
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => startSprint(45)}
                      className="group relative px-12 py-5 rounded-[2rem] bg-brand text-black font-black text-lg uppercase tracking-widest shadow-glow hover:scale-105 transition-all overflow-hidden"
                    >
                      <div className="relative z-10 flex items-center gap-3">
                        <Play className="w-6 h-6 fill-current" />
                        Enter Flow
                      </div>
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-8">
                    <button
                      onClick={isPaused ? resumeSprint : pauseSprint}
                      className={cn(
                        "w-20 h-20 rounded-full flex items-center justify-center transition-all hover:scale-110",
                        isPaused ? "bg-emerald-500 text-black shadow-glow" : "bg-white/5 border border-white/10 text-white"
                      )}
                    >
                      {isPaused ? <Play className="w-8 h-8 fill-current" /> : <Pause className="w-8 h-8 fill-current" />}
                    </button>
                    
                    <button
                      onClick={stopSprint}
                      className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white transition-all hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-500 hover:scale-110"
                    >
                      <Square className="w-6 h-6 fill-current" />
                    </button>
                  </div>
                )}
              </div>

              {/* Ambient Insights */}
              {isActive && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-12">
                   <FocusCard icon={Target} label="Current Goal" value="Mission Execution" />
                   <FocusCard icon={Zap} label="Neural Energy" value="High Stability" />
                   <FocusCard icon={Sparkles} label="Veda Insight" value="Focus is peaking" />
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center space-y-10 py-20"
            >
               <div className="w-32 h-32 rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-6 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                  <Trophy size={64} />
               </div>
               <div className="space-y-4">
                  <h2 className="text-5xl font-black text-white tracking-tighter">Mission Accomplished</h2>
                  <p className="text-slate-500 text-lg max-w-lg mx-auto font-medium">
                    Excellent discipline, {user?.name || 'Explorer'}. Your retention has been optimized. Veda is ready to review your progress.
                  </p>
               </div>
               
               <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => navigate('/copilot')}
                    className="px-10 py-5 rounded-[2rem] bg-brand text-black font-black uppercase tracking-widest shadow-glow hover:scale-105 transition-all flex items-center gap-3"
                  >
                    Review with Veda <Sparkles className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => navigate('/roadmap')}
                    className="px-10 py-5 rounded-[2rem] bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    Return to Roadmap
                  </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function FocusCard({ icon: Icon, label, value }: any) {
  return (
    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.06] text-left">
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-4 h-4 text-brand" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
      </div>
      <p className="text-sm font-bold text-white">{value}</p>
    </div>
  );
}
