import { motion as Motion } from "framer-motion";
import { 
  Brain, 
  Sparkles, 
  Target, 
  TrendingUp, 
  AlertCircle, 
  Zap, 
  Clock, 
  MessageSquare,
  FileText,
  Link2,
  ChevronRight,
  Plus
} from "lucide-react";
import { cn } from "../../../lib/utils/cn";
import type { CareerNote } from "@studybuddy/shared";

export function KnowledgeMetrics({ metrics }: any) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard label="Concepts Mastered" value={metrics?.concepts || 0} icon={Brain} color="text-purple-400" />
      <MetricCard label="Recall Health" value={`${metrics?.recallHealth || 0}%`} icon={Zap} color="text-amber-400" />
      <MetricCard label="Retention Score" value={metrics?.retention || "Good"} icon={TrendingUp} color="text-cyan-400" />
      <MetricCard label="Roadmap Sync" value={`+${metrics?.roadmapContribution || 0}%`} icon={Target} color="text-emerald-400" />
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color }: any) {
  return (
    <Motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-[2.5rem] glass border-white/5 bg-white/[0.02] relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-3xl -mr-12 -mt-12 rounded-full" />
      <div className="relative z-10">
        <div className={cn("p-2 rounded-xl bg-white/[0.04] w-fit mb-4", color)}>
          <Icon size={20} />
        </div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{label}</p>
        <p className="text-2xl font-black text-white">{value}</p>
      </div>
    </Motion.div>
  );
}

export function IntelligentNoteCard({ note, onAction }: { note: CareerNote; onAction: (action: string) => void }) {
  const metadata = note.metadata;
  
  return (
    <Motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group p-6 rounded-[2.5rem] glass border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all relative overflow-hidden"
    >
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
             <span className="px-2 py-0.5 rounded-full bg-brand/10 border border-brand/20 text-[9px] font-black text-brand uppercase tracking-widest">
               {note.topic || "Uncategorized"}
             </span>
             {note.strength > 0.7 && (
                <span className="flex items-center gap-1 text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                   <Sparkles size={10} /> Mastered
                </span>
             )}
          </div>
          <h3 className="text-lg font-black text-white truncate group-hover:text-brand transition-colors">{note.title}</h3>
        </div>
        <div className="flex flex-col items-end gap-1">
           <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Retention</div>
           <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-brand shadow-glow" style={{ width: `${(note.strength || 0) * 100}%` }} />
           </div>
        </div>
      </div>

      <p className="text-sm text-slate-400 line-clamp-2 mb-6 leading-relaxed font-medium">
        {metadata?.summary || note.content.substring(0, 120)}...
      </p>

      <div className="flex flex-wrap gap-2 mb-8">
        {(metadata?.concepts || note.tags || []).slice(0, 3).map((concept, i) => (
          <span key={i} className="px-3 py-1 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-bold text-slate-400">
            {concept}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
         <button 
           onClick={() => onAction('recall')}
           className="p-3 rounded-2xl bg-brand/10 border border-brand/20 text-brand text-[10px] font-black uppercase tracking-widest hover:bg-brand hover:text-white transition-all flex items-center justify-center gap-2"
         >
            <Brain size={14} /> Practice Recall
         </button>
         <button 
           onClick={() => onAction('mastery')}
           className="p-3 rounded-2xl bg-white/[0.05] border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-obsidian transition-all flex items-center justify-center gap-2"
         >
            <Zap size={14} /> AI Mastery
         </button>
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
         <div className="flex items-center gap-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><Clock size={12} /> {metadata?.flashcards?.length || 0} Flashcards</span>
            <span className="flex items-center gap-1.5"><Target size={12} /> {metadata?.roadmapLink?.contributionScore || 0}% Roadmap</span>
         </div>
         <button className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors">
            <ChevronRight size={16} />
         </button>
      </div>
    </Motion.div>
  );
}

export function KnowledgeInsightsPanel({ insights }: any) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">AI Knowledge Insights</h3>
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>

      <div className="space-y-6">
        <InsightRow 
          label="Forgetting Curve" 
          message="Your Graph retention is dropping. Review scheduled for tomorrow." 
          color="text-amber-400" 
          icon={AlertCircle}
        />
        <InsightRow 
          label="Concept Mastery" 
          message="React Hook concepts are now 85% mastered. Ready for Next.js modules." 
          color="text-emerald-400" 
          icon={Sparkles}
        />
        <InsightRow 
          label="Interview Readiness" 
          message="Dynamic Programming is a high-frequency interview topic you struggle with." 
          color="text-red-400" 
          icon={Target}
        />
      </div>

      <div className="p-6 rounded-[2.5rem] bg-brand/10 border border-brand/20">
         <h4 className="text-xs font-black text-white uppercase tracking-widest mb-3 flex items-center gap-2">
            <Zap size={14} className="text-brand" /> Turn Into Mastery
         </h4>
         <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
            Upload any lecture, PDF, or video link and Veda will transform it into a mastery plan.
         </p>
         <button className="w-full py-3 rounded-2xl bg-brand text-white text-[10px] font-black uppercase tracking-widest shadow-glow">
            Start Processing
         </button>
      </div>
    </div>
  );
}

function InsightRow({ label, message, color, icon: Icon }: any) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon size={14} className={color} />
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-[11px] text-slate-300 font-medium leading-relaxed">{message}</p>
    </div>
  );
}
