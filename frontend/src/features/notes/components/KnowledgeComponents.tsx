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
      <MetricCard label="Concepts Mastered" value={metrics?.concepts || 0} color="text-brand" />
      <MetricCard label="Recall Health" value={`${metrics?.recallHealth || 0}%`} color="text-emerald-500" />
      <MetricCard label="Retention Score" value={metrics?.retention || "Strong"} color="text-cyan-500" />
      <MetricCard label="Roadmap Sync" value={`+${metrics?.roadmapContribution || 0}%`} color="text-amber-500" />
    </div>
  );
}

function MetricCard({ label, value, color }: any) {
  return (
    <div className="flex flex-col gap-3 pt-4">
      <p className="text-[10px] font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest">{label}</p>
      <p className={cn("text-3xl font-light", color)}>{value}</p>
    </div>
  );
}

export function IntelligentNoteCard({ note, onAction }: { note: CareerNote; onAction: (action: string) => void }) {
  const metadata = note.metadata;
  
  return (
    <Motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="group p-6 border border-white/10 bg-transparent hover:border-white/20 transition-all flex flex-col h-full rounded-none"
    >
      <div className="flex items-center justify-between mb-4">
         <div className="flex flex-wrap gap-2">
            {(metadata?.concepts || note.tags || []).slice(0, 2).map((concept: string, i: number) => (
               <span key={i} className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-medium text-slate-300">
                  {concept}
               </span>
            ))}
         </div>
         <div className={cn("w-1.5 h-1.5 rounded-full", note.strength > 0.7 ? "bg-emerald-500" : note.strength > 0.3 ? "bg-amber-500" : "bg-red-500")} />
      </div>

      <h3 className="text-base font-medium text-white mb-2">{note.title}</h3>
      <p className="text-[11px] text-slate-400 line-clamp-2 mb-6 flex-1 font-medium leading-relaxed">
         {metadata?.summary || note.content.substring(0, 120)}...
      </p>

      <div className="flex flex-wrap gap-4 mb-4">
         <span className="text-[10px] font-medium text-slate-500 lowercase">{note.topic || "uncategorized"}</span>
         <span className="text-[10px] font-medium text-slate-500 lowercase">frontend</span>
      </div>

      <div className="flex items-center gap-4 text-[10px] font-medium text-slate-500 mb-6">
         <span>{metadata?.flashcards?.length || 0} flashcards</span>
         <span>{metadata?.roadmapLink?.contributionScore || 0} roadmap</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-auto">
         <button onClick={() => onAction('recall')} className="py-2.5 bg-brand/10 text-brand text-[10px] font-semibold hover:bg-brand hover:text-white transition-colors flex items-center justify-center gap-2">
            Practice recall ↗
         </button>
         <button onClick={() => onAction('mastery')} className="py-2.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-semibold hover:bg-emerald-500 hover:text-white transition-colors flex items-center justify-center gap-2">
            AI mastery ↗
         </button>
      </div>
    </Motion.div>
  );
}

export function KnowledgeInsightsPanel({ insights }: any) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI Knowledge Insights</h3>
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      </div>

      <div className="space-y-8">
        <InsightRow 
          label="Forgetting curve" 
          message="Graph retention is dropping. Review scheduled for tomorrow." 
        />
        <InsightRow 
          label="Concept mastery" 
          message="React Hooks are now 85% mastered. Ready for Next.js modules." 
        />
        <InsightRow 
          label="Interview readiness" 
          message="Dynamic Programming is a high-frequency topic you still struggle with." 
        />
      </div>

      <div className="p-6 border border-brand/20 bg-brand/5 mt-10">
         <h4 className="text-[11px] font-medium text-slate-300 mb-2">Turn into mastery</h4>
         <p className="text-[10px] text-slate-400 leading-relaxed mb-6">
            Upload any lecture, PDF, or video link and Veda will transform it into a mastery plan.
         </p>
         <button className="w-full py-2.5 bg-brand text-white text-[10px] font-semibold hover:bg-brand/90 transition-colors flex items-center justify-center">
            Start processing →
         </button>
      </div>
    </div>
  );
}

function InsightRow({ label, message }: any) {
  return (
    <div className="space-y-1 mb-6">
      <h4 className="text-xs font-semibold text-white">{label}</h4>
      <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{message}</p>
    </div>
  );
}
