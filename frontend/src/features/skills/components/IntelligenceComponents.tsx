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
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 rounded-[2.5rem] glass border-white/5 bg-white/[0.02] relative overflow-hidden group hover:bg-white/[0.04] transition-all"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
           <span className={cn(
             "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 inline-block border",
             gap.status === "strong" ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" :
             gap.status === "partial" ? "bg-amber-400/10 text-amber-400 border-amber-400/20" :
             "bg-red-400/10 text-red-400 border-red-400/20"
           )}>
              {gap.status} Match
           </span>
           <h3 className="text-lg font-black text-white">{gap.skill}</h3>
           <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">{gap.category}</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
           <span className="text-lg font-black text-white">{gap.userScore}<span className="text-[10px] text-slate-500">%</span></span>
        </div>
      </div>

      <div className="space-y-4">
         <DimensionBar label="Confidence" value={dimensions.confidence} icon={Brain} color="bg-purple-500" />
         <DimensionBar label="Retention" value={dimensions.retention} icon={Zap} color="bg-cyan-500" />
         <DimensionBar label="Interview" value={dimensions.interviewReady} icon={Target} color="bg-emerald-500" />
         <DimensionBar label="Practical" value={dimensions.practical} icon={Code} color="bg-amber-500" />
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-bold text-slate-400">
         <span className="flex items-center gap-2">
            Momentum: 
            {dimensions.momentum === "improving" && <span className="flex items-center text-emerald-400"><TrendingUp size={14} className="mr-1"/> Improving</span>}
            {dimensions.momentum === "declining" && <span className="flex items-center text-red-400"><TrendingDown size={14} className="mr-1"/> Declining</span>}
            {dimensions.momentum === "stagnating" && <span className="flex items-center text-amber-400"><Minus size={14} className="mr-1"/> Stagnating</span>}
         </span>
      </div>
    </Motion.div>
  );
}

function DimensionBar({ label, value, icon: Icon, color }: any) {
  return (
    <div className="space-y-2">
       <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
          <span className="flex items-center gap-1.5"><Icon size={12} /> {label}</span>
          <span>{value}%</span>
       </div>
       <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div className={cn("h-full shadow-glow", color)} style={{ width: `${value}%` }} />
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
         <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/5" />
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
         <span className="text-3xl font-black text-white">{score}</span>
         <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">{label}</span>
      </div>
    </div>
  );
}
