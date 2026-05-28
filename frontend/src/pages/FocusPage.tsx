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
    <div className="relative h-full w-full flex flex-col items-center justify-between py-4 md:py-6 overflow-hidden">
      <NebulaBackground opacity={0.15} />

      <div className="relative z-10 w-full max-w-4xl px-6 flex flex-col h-full justify-between min-h-0">
        {/* Navigation */}
        <header className="w-full flex items-center justify-between pb-4 shrink-0">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Exit Session</span>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <Activity className="w-3 h-3 text-cyan animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Biometric Focus: Active</span>
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
              className="flex-1 flex flex-col items-center justify-center text-center space-y-5 md:space-y-7 min-h-0 [@media(max-height:768px)]:space-y-4"
            >
              {/* Status Header */}
              <div className="space-y-1.5 md:space-y-2 shrink-0">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-brand/10 border border-brand/20 text-brand text-[9px] font-black uppercase tracking-[0.3em] [@media(max-height:768px)]:py-0.5"
                >
                  <Brain className="w-3.5 h-3.5" /> Neural Flow State
                </motion.div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-white tracking-tighter max-w-2xl mx-auto [@media(max-height:768px)]:text-xl">
                  {isActive ? "Deep Work Protocol" : "Initialize Focus Engine"}
                </h1>
                <p className="text-[10px] md:text-xs text-slate-500 font-medium max-w-lg mx-auto leading-normal">
                  Zero distractions. Pure execution. Veda is monitoring your learning velocity.
                </p>
              </div>

              {/* Main Timer Visualization */}
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 lg:w-52 lg:h-52 flex items-center justify-center shrink-0 [@media(max-height:768px)]:w-36 [@media(max-height:768px)]:h-36">
                {/* Progress Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle 
                    cx="50%" 
                    cy="50%" 
                    r="48%" 
                    fill="transparent" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    className="text-white/5" 
                  />
                  <motion.circle 
                    cx="50%" 
                    cy="50%" 
                    r="48%" 
                    fill="transparent" 
                    stroke="var(--brand)" 
                    strokeWidth="6" 
                    strokeLinecap="round"
                    strokeDasharray="100 100"
                    animate={{ strokeDashoffset: 100 - progress }}
                    className="transition-all duration-1000 ease-linear shadow-[0_0_20px_rgba(124,92,255,0.4)]" 
                  />
                </svg>

                {/* Inner Glow */}
                <div className={cn(
                  "absolute inset-6 rounded-full bg-brand/5 blur-2xl transition-opacity duration-1000",
                  isActive && !isPaused ? "opacity-100" : "opacity-0"
                )} />

                {/* Time Display */}
                <div className="relative z-10 flex flex-col items-center">
                  <span className="text-4xl sm:text-5xl md:text-6xl font-mono font-black text-white tracking-tighter [@media(max-height:768px)]:text-4xl">
                    {formatTime(timeLeft)}
                  </span>
                  <span className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-500 mt-0.5">
                    {isPaused ? "Paused" : "Remaining"}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4 shrink-0">
                {!isActive ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex gap-2.5 sm:gap-3">
                      {[25, 45, 60, 90].map(mins => (
                        <button
                          key={mins}
                          onClick={() => startSprint(mins)}
                          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-brand hover:text-black hover:border-brand transition-all text-xs font-black tracking-widest [@media(max-height:768px)]:px-3 [@media(max-height:768px)]:py-1.5"
                        >
                          {mins}m
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => startSprint(45)}
                      className="group relative px-10 py-3.5 rounded-[2rem] bg-brand text-black font-black text-sm uppercase tracking-widest shadow-glow hover:scale-105 transition-all overflow-hidden [@media(max-height:768px)]:px-8 [@media(max-height:768px)]:py-2.5"
                    >
                      <div className="relative z-10 flex items-center gap-2">
                        <Play className="w-5 h-5 fill-current" />
                        Enter Flow
                      </div>
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-6">
                    <button
                      onClick={isPaused ? resumeSprint : pauseSprint}
                      className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-110 [@media(max-height:768px)]:w-12 [@media(max-height:768px)]:h-12",
                        isPaused ? "bg-emerald-500 text-black shadow-glow" : "bg-white/5 border border-white/10 text-white"
                      )}
                    >
                      {isPaused ? <Play className="w-6 h-6 fill-current [@media(max-height:768px)]:w-5 [@media(max-height:768px)]:h-5" /> : <Pause className="w-6 h-6 fill-current [@media(max-height:768px)]:w-5 [@media(max-height:768px)]:h-5" />}
                    </button>
                    
                    <button
                      onClick={stopSprint}
                      className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white transition-all hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-500 hover:scale-110 [@media(max-height:768px)]:w-12 [@media(max-height:768px)]:h-12"
                    >
                      <Square className="w-5 h-5 fill-current [@media(max-height:768px)]:w-4 [@media(max-height:768px)]:h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Ambient Insights */}
              {isActive && (
                <div className="grid grid-cols-3 gap-3 w-full mt-4 shrink-0 [@media(max-height:768px)]:mt-2 [@media(max-height:768px)]:gap-2">
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
              className="flex-1 flex flex-col items-center justify-center text-center space-y-6 py-6 md:py-10 min-h-0"
            >
               <div className="w-20 h-20 md:w-28 md:h-28 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-2 shadow-[0_0_30px_rgba(16,185,129,0.15)] shrink-0 [@media(max-height:768px)]:w-16 [@media(max-height:768px)]:h-16">
                  <Trophy size={40} className="[@media(max-height:768px)]:w-8 [@media(max-height:768px)]:h-8" />
               </div>
               <div className="space-y-2 md:space-y-3 shrink-0">
                  <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter [@media(max-height:768px)]:text-2xl">Mission Accomplished</h2>
                  <p className="text-slate-500 text-xs md:text-sm max-w-md mx-auto font-medium">
                     Excellent discipline, {user?.name || 'Explorer'}. Your retention has been optimized. Veda is ready to review your progress.
                  </p>
               </div>
               
               <div className="flex flex-col sm:flex-row gap-3 pt-2 shrink-0">
                  <button 
                    onClick={() => navigate('/copilot')}
                    className="px-8 py-3.5 rounded-[2rem] bg-brand text-black font-black uppercase tracking-widest text-xs shadow-glow hover:scale-105 transition-all flex items-center justify-center gap-2"
                  >
                    Review with Veda <Sparkles className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => navigate('/roadmap')}
                    className="px-8 py-3.5 rounded-[2rem] bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
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
    <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-left [@media(max-height:768px)]:p-2">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-3.5 h-3.5 text-brand" />
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{label}</span>
      </div>
      <p className="text-[11px] font-bold text-white truncate">{value}</p>
    </div>
  );
}
