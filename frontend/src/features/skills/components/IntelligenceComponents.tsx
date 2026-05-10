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
  const statusLabel = gap.status === "strong" ? "Strong" : gap.status === "partial" ? "Partial" : "Weak";
  
  return (
    <Motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-lg border border-white/[0.08] bg-[#0c1017] p-5 transition-colors hover:border-white/[0.14] hover:bg-white/[0.035]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
           <div className={cn(
             "mb-3 inline-flex rounded-md border px-2 py-1 text-[9px] font-black uppercase tracking-[0.18em]",
             gap.status === "strong" ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" :
             gap.status === "partial" ? "bg-amber-400/10 text-amber-400 border-amber-400/20" :
             "bg-red-400/10 text-red-400 border-red-400/20"
           )}>
              {statusLabel} Match
           </div>
           <h3 className="truncate text-lg font-semibold tracking-tight text-white">{gap.skill}</h3>
           <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{gap.category}</p>
        </div>
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04]">
           <span className="text-lg font-black text-white">{gap.userScore}<span className="ml-0.5 text-[10px] text-brand">%</span></span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
         <DimensionBar label="Confidence" value={dimensions.confidence} icon={Brain} color="bg-purple-500" />
         <DimensionBar label="Retention" value={dimensions.retention} icon={Zap} color="bg-cyan-500" />
         <DimensionBar label="Interview" value={dimensions.interviewReady} icon={Target} color="bg-emerald-500" />
         <DimensionBar label="Practical" value={dimensions.practical} icon={Code} color="bg-amber-500" />
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
         <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
            Momentum
            {dimensions.momentum === "improving" && <span className="flex items-center rounded-md border border-emerald-400/10 bg-emerald-400/5 px-2 py-1 text-emerald-400"><TrendingUp size={12} className="mr-1.5"/> Improving</span>}
            {dimensions.momentum === "declining" && <span className="flex items-center rounded-md border border-red-400/10 bg-red-400/5 px-2 py-1 text-red-400"><TrendingDown size={12} className="mr-1.5"/> Declining</span>}
            {dimensions.momentum === "stagnating" && <span className="flex items-center rounded-md border border-amber-400/10 bg-amber-400/5 px-2 py-1 text-amber-400"><Minus size={12} className="mr-1.5"/> Stagnating</span>}
         </span>
      </div>
    </Motion.div>
  );
}

function DimensionBar({ label, value, icon: Icon, color }: any) {
  return (
    <div className="space-y-2">
       <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
          <span className="flex items-center gap-2"><Icon size={12} className="text-slate-500" /> {label}</span>
          <span className="text-white">{value}%</span>
       </div>
       <div className="h-1.5 overflow-hidden rounded-full border border-white/[0.05] bg-white/[0.04] p-[1px]">
          <Motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={cn("h-full rounded-full", color)} 
          />
       </div>
    </div>
  );
}

export function ReadinessRing({ score, label }: { score: number, label: string }) {
  const dashArray = 283;
  const dashOffset = dashArray - (dashArray * score) / 100;
  
  return (
    <div className="relative flex h-28 w-28 items-center justify-center">
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
