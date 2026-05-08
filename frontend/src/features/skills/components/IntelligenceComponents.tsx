import { motion as Motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Brain,
  Target,
  Zap,
  Code,
  AlertCircle
} from "lucide-react";
import { cn } from "../../../lib/utils/cn";
import { type SkillGapItem, type SkillDimension } from "../types";

export function SkillMatrixCard({ gap }: { gap: SkillGapItem }) {
  const { dimensions } = gap;
  
  return (
    <Motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 rounded-[3rem] glass border-white/[0.08] bg-white/[0.01] relative overflow-hidden group hover:bg-white/[0.03] transition-all duration-500 shadow-2xl"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-3xl -mr-16 -mt-16 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-start justify-between mb-8 relative z-10">
        <div>
           <div className={cn(
             "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] mb-4 inline-block border",
             gap.status === "strong" ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" :
             gap.status === "partial" ? "bg-amber-400/10 text-amber-400 border-amber-400/20" :
             "bg-red-400/10 text-red-400 border-red-400/20"
           )}>
              {gap.status} Match
           </div>
           <h3 className="text-2xl font-black text-slate-900 dark:text-slate-900 dark:text-white tracking-tight group-hover:text-brand transition-colors">{gap.skill}</h3>
           <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-[0.2em]">{gap.category}</p>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shadow-inner">
           <span className="text-xl font-black text-slate-900 dark:text-slate-900 dark:text-white">{gap.userScore}<span className="text-[10px] text-brand ml-0.5">%</span></span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 relative z-10">
         <DimensionBar label="Confidence" value={dimensions.confidence} icon={Brain} color="bg-purple-500" />
         <DimensionBar label="Retention" value={dimensions.retention} icon={Zap} color="bg-cyan-500" />
         <DimensionBar label="Interview" value={dimensions.interviewReady} icon={Target} color="bg-emerald-500" />
         <DimensionBar label="Practical" value={dimensions.practical} icon={Code} color="bg-amber-500" />
      </div>

      <div className="mt-10 pt-6 border-t border-white/[0.05] flex items-center justify-between relative z-10">
         <span className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
            AI Momentum: 
            {dimensions.momentum === "improving" && <span className="flex items-center text-emerald-400 px-2 py-1 rounded-md bg-emerald-400/5 border border-emerald-400/10"><TrendingUp size={14} className="mr-2"/> Improving</span>}
            {dimensions.momentum === "declining" && <span className="flex items-center text-red-400 px-2 py-1 rounded-md bg-red-400/5 border border-red-400/10"><TrendingDown size={14} className="mr-2"/> Declining</span>}
            {dimensions.momentum === "stagnating" && <span className="flex items-center text-amber-400 px-2 py-1 rounded-md bg-amber-400/5 border border-amber-400/10"><Minus size={14} className="mr-2"/> Stagnating</span>}
         </span>
      </div>
    </Motion.div>
  );
}

function DimensionBar({ label, value, icon: Icon, color }: any) {
  return (
    <div className="space-y-3">
       <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
          <span className="flex items-center gap-2"><Icon size={12} className="text-slate-500 dark:text-slate-500 dark:text-slate-400" /> {label}</span>
          <span className="text-slate-900 dark:text-slate-900 dark:text-white">{value}%</span>
       </div>
       <div className="h-1.5 rounded-full bg-white/[0.03] overflow-hidden p-[1px] border border-white/[0.05]">
          <Motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={cn("h-full rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)]", color)} 
          />
       </div>
    </div>
  );
}

export function ReadinessRing({ score, label }: { score: number, label: string }) {
  const dashArray = 283;
  const dashOffset = dashArray - (dashArray * score) / 100;
  
  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
         <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-900 dark:text-slate-900 dark:text-white/5" />
         <Motion.circle 
           cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" 
           strokeLinecap="round"
           className="text-brand drop-shadow-[0_0_10px_rgba(124,92,255,0.5)]"
           strokeDasharray={dashArray}
           initial={{ strokeDashoffset: dashArray }}
           animate={{ strokeDashoffset: dashOffset }}
           transition={{ duration: 1.5, ease: "easeOut" }}
         />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
         <span className="text-3xl font-black text-slate-900 dark:text-slate-900 dark:text-white">{score}</span>
         <span className="text-[8px] font-black text-slate-500 dark:text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">{label}</span>
      </div>
    </div>
  );
}
