import { motion as Motion } from "framer-motion";
import { 
  Zap, 
  Brain, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  TrendingUp,
  LayoutDashboard,
  Clock,
  Flame,
  Target,
  RefreshCw
} from "lucide-react";
import { cn } from "../../../lib/utils/cn";

export function InsightCard({ title, description, actionLabel, actionUrl }: any) {
  return (
    <Motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-3xl glass border-white/5 bg-white/[0.02] group hover:bg-white/[0.04] transition-all"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-2xl bg-brand/10 border border-brand/20 text-brand group-hover:scale-110 transition-transform">
          <TrendingUp size={20} />
        </div>
        <div>
          <h4 className="text-sm font-black text-slate-900 dark:text-slate-900 dark:text-white mb-1 uppercase tracking-wider">{title}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
          {actionLabel && (
             <button className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand hover:text-brand/80 transition-colors flex items-center gap-2">
                {actionLabel} <ArrowRight size={12} />
             </button>
          )}
        </div>
      </div>
    </Motion.div>
  );
}

export function MissionCard({ title, description, onClick }: any) {
  return (
    <Motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 rounded-[2.5rem] border border-cyan-400/20 bg-cyan-400/5 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 blur-[50px] -mr-16 -mt-16 rounded-full" />
      <div className="relative z-20">
        <div className="flex items-center gap-2 mb-4">
          <Target size={16} className="text-cyan-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Roadmap Mission</span>
        </div>
        <h4 className="text-xl font-black text-slate-900 dark:text-slate-900 dark:text-white mb-2">{title}</h4>
        <p className="text-sm text-slate-700 dark:text-slate-700 dark:text-slate-300 leading-relaxed mb-6">{description}</p>
        <button 
          onClick={onClick || (() => window.location.href = '/roadmap')}
          className="w-full py-3 rounded-2xl bg-cyan text-slate-950 text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-glow relative z-30"
        >
           Execute Mission
        </button>
      </div>
    </Motion.div>
  );
}

export function FocusSprintCard({ title, data, onClick }: any) {
  return (
    <Motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-[2.5rem] border border-purple-500/20 bg-purple-500/5 backdrop-blur-xl relative z-20"
    >
      <div className="flex items-center gap-3 mb-4">
         <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
            <Zap size={18} />
         </div>
         <h4 className="text-sm font-black text-slate-900 dark:text-slate-900 dark:text-white uppercase tracking-widest">Focus Sprint</h4>
      </div>
      <h3 className="text-lg font-black text-slate-900 dark:text-slate-900 dark:text-white mb-2">{title}</h3>
      <div className="flex items-center gap-4 mb-6">
         <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-500 dark:text-slate-400">
            <Clock size={14} /> {data?.duration || 45} mins
         </div>
         <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-500 dark:text-slate-400">
            <Target size={14} /> {data?.difficulty || "Medium"}
         </div>
      </div>
      <button 
        onClick={onClick || (() => window.location.href = '/focus')}
        className="w-full py-3 rounded-2xl bg-purple-500 text-slate-900 dark:text-slate-900 dark:text-white text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] relative z-30"
      >
         Start Focus Session
      </button>
    </Motion.div>
  );
}

export function RecallChallenge({ title, data, onClick }: any) {
  return (
    <Motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-6 rounded-[2.5rem] border border-amber-400/20 bg-amber-400/5 relative z-20"
    >
      <div className="flex items-center gap-2 mb-4 text-amber-400">
        <Brain size={18} />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Recall Challenge</span>
      </div>
      <p className="text-base font-bold text-slate-900 dark:text-slate-900 dark:text-white mb-6 leading-relaxed">
        {title}
      </p>
      <div className="grid gap-2">
        {data?.options?.map((option: string, i: number) => (
           <button 
            key={i} 
            onClick={() => onClick?.(option)}
            className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-amber-400/40 hover:bg-white/[0.06] transition-all text-sm font-medium text-slate-700 dark:text-slate-700 dark:text-slate-300 text-left group flex items-center justify-between relative z-30"
           >
              {option}
              <div className="w-5 h-5 rounded-full border border-slate-200 dark:border-slate-200 dark:border-white/10 group-hover:border-amber-400/40" />
           </button>
        ))}
      </div>
    </Motion.div>
  );
}

export function WarningCard({ title, description }: any) {
  return (
    <Motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-3xl bg-red-500/5 border border-red-500/20 flex gap-4 relative z-20"
    >
      <div className="shrink-0 p-3 rounded-2xl bg-red-500/10 text-red-400">
        <AlertCircle size={20} />
      </div>
      <div>
        <h4 className="text-sm font-black text-red-400 uppercase tracking-widest mb-1">{title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
      </div>
    </Motion.div>
  );
}

export function RecoveryPlanCard({ title, description, onClick }: any) {
  return (
    <Motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 rounded-[2.5rem] border border-emerald-400/20 bg-emerald-400/5 relative z-20"
    >
      <div className="flex items-center gap-2 mb-4 text-emerald-400">
        <RefreshCw size={18} />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Recovery Plan</span>
      </div>
      <h4 className="text-xl font-black text-slate-900 dark:text-slate-900 dark:text-white mb-2">{title}</h4>
      <p className="text-sm text-slate-700 dark:text-slate-700 dark:text-slate-300 leading-relaxed mb-6">{description}</p>
      <button 
        onClick={onClick || (() => window.location.href = '/dashboard')}
        className="w-full py-3 rounded-2xl bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all relative z-30"
      >
         Adopt Strategy
      </button>
    </Motion.div>
  );
}

