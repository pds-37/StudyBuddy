import { motion as Motion } from "framer-motion";
import {
  Brain,
  Sparkles,
  Target,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Zap,
  Clock,
  MessageSquare,
  FileText,
  Link2,
  ChevronRight,
  Plus,
  Flame,
  Shield,
  Activity,
  BookOpen,
  Code,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  BarChart3,
  Upload,
  Loader2
} from "lucide-react";
import { cn } from "../../../lib/utils/cn";
import type { CareerNote, KnowledgeHealthMetrics, RevisionPriority } from "@studybuddy/shared";

// ─── KNOWLEDGE HEALTH METRICS BAR ───

export function KnowledgeMetrics({ metrics }: { metrics: KnowledgeHealthMetrics | null }) {
  if (!metrics) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-white/[0.02] rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
      <MetricCard
        label="Concepts"
        value={metrics.totalConcepts}
        sub={`${metrics.strongConcepts} strong`}
        color="text-brand"
        icon={<Brain size={14} />}
      />
      <MetricCard
        label="Retention"
        value={`${metrics.overallRetention}%`}
        sub={metrics.knowledgeMomentum}
        color={metrics.overallRetention > 60 ? "text-emerald-400" : metrics.overallRetention > 30 ? "text-amber-400" : "text-red-400"}
        icon={<Shield size={14} />}
      />
      <MetricCard
        label="Recall Health"
        value={`${metrics.recallHealth}%`}
        sub={`${metrics.dueCount} due`}
        color="text-cyan-400"
        icon={<Activity size={14} />}
      />
      <MetricCard
        label="Interview"
        value={`${metrics.interviewReadiness}%`}
        sub={`${metrics.criticalConcepts} critical`}
        color="text-purple-400"
        icon={<Target size={14} />}
      />
      <MetricCard
        label="Streak"
        value={`${metrics.streakDays}d`}
        sub={`${metrics.todayRevisionCount}/${metrics.todayRevisionTarget} today`}
        color="text-amber-400"
        icon={<Flame size={14} />}
      />
    </div>
  );
}

function MetricCard({ label, value, sub, color, icon }: {
  label: string; value: string | number; sub: string; color: string; icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 py-3 px-1">
      <div className="flex items-center gap-2">
        <span className={cn("opacity-60", color)}>{icon}</span>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
      </div>
      <p className={cn("text-2xl font-light tracking-tight", color)}>{value}</p>
      <p className="text-[10px] font-medium text-slate-400 capitalize">{sub}</p>
    </div>
  );
}

// ─── TODAY'S FOCUS STRIP ───

export function TodaysFocusStrip({ priorities, onStartRevision }: {
  priorities: RevisionPriority[];
  onStartRevision: (noteId: string) => void;
}) {
  if (priorities.length === 0) {
    return (
      <div className="flex items-center gap-4 px-6 py-4 border border-emerald-500/20 bg-emerald-500/5">
        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
        <p className="text-xs font-medium text-emerald-400">All caught up! No urgent revisions today.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Zap size={12} className="text-amber-400" />
          Today&apos;s Critical Revision
        </h3>
        <span className="text-[10px] font-medium text-slate-400">
          ~{priorities.reduce((s, p) => s + p.estimatedMinutes, 0)} min total
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
        {priorities.slice(0, 5).map((p, i) => (
          <Motion.button
            key={p.noteId}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onStartRevision(p.noteId)}
            className={cn(
              "shrink-0 group px-4 py-3 border transition-all hover:border-white/20 flex flex-col gap-2 min-w-[200px] max-w-[240px]",
              p.urgency === "critical" ? "border-red-500/30 bg-red-500/5" :
              p.urgency === "high" ? "border-amber-500/30 bg-amber-500/5" :
              "border-white/10 bg-white/[0.02]"
            )}
          >
            <div className="flex items-center justify-between">
              <UrgencyBadge urgency={p.urgency} />
              <span className="text-[9px] font-medium text-slate-400">~{p.estimatedMinutes}m</span>
            </div>
            <p className="text-xs font-medium text-slate-200 text-left line-clamp-1">{p.title}</p>
            <p className="text-[10px] text-slate-500 text-left line-clamp-1">{p.reason}</p>
            <div className="flex items-center gap-2 mt-1">
              <RevisionTypeBadge type={p.revisionType} />
              <StrengthDot strength={p.strength} />
            </div>
          </Motion.button>
        ))}
      </div>
    </div>
  );
}

function UrgencyBadge({ urgency }: { urgency: string }) {
  const styles: Record<string, string> = {
    critical: "bg-red-500/20 text-red-400",
    high: "bg-amber-500/20 text-amber-400",
    medium: "bg-cyan-500/20 text-cyan-400",
    low: "bg-transparent0/20 text-slate-400"
  };
  return (
    <span className={cn("text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm", styles[urgency] || styles.low)}>
      {urgency}
    </span>
  );
}

function RevisionTypeBadge({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    recall: <Brain size={10} />,
    implementation: <Code size={10} />,
    explanation: <MessageSquare size={10} />,
    quiz: <HelpCircle size={10} />
  };
  return (
    <span className="flex items-center gap-1 text-[9px] font-medium text-slate-500">
      {icons[type] || <Brain size={10} />} {type}
    </span>
  );
}

function StrengthDot({ strength }: { strength: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className={cn(
        "w-1.5 h-1.5 rounded-full",
        strength > 0.7 ? "bg-emerald-500" : strength > 0.3 ? "bg-amber-500" : "bg-red-500"
      )} />
      <span className="text-[9px] text-slate-400">{Math.round(strength * 100)}%</span>
    </div>
  );
}

// ─── INTELLIGENT NOTE CARD ───

export function IntelligentNoteCard({ note, onAction }: { note: CareerNote; onAction: (action: string) => void }) {
  const metadata = note.metadata;

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="group p-5 cognitive-card flex flex-col h-full cursor-pointer"
      onClick={() => onAction('view')}
    >
      {/* Top row: concepts + strength indicator */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex flex-wrap gap-1.5">
          {(note.concepts || note.tags || []).slice(0, 3).map((concept: string, i: number) => (
            <span key={i} className="px-2 py-0.5 bg-white/[0.04] text-[9px] font-medium text-slate-400 border border-white/[0.06]">
              {concept}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <KnowledgeLayerBadge layer={note.knowledgeLayer} />
          <div className={cn(
            "w-2 h-2 rounded-full",
            note.strength > 0.7 ? "bg-emerald-500" :
            note.strength > 0.3 ? "bg-amber-500" : "bg-red-500"
          )} />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-white mb-1.5 line-clamp-1">{note.title}</h3>

      {/* Summary */}
      <p className="text-[11px] text-slate-500 line-clamp-2 mb-4 flex-1 leading-relaxed">
        {metadata?.summary || note.content.substring(0, 120)}...
      </p>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-3 mb-3 text-[9px] font-medium text-slate-400">
        <span className="flex items-center gap-1">
          <BookOpen size={10} /> {note.topic || "uncategorized"}
        </span>
        <span className="flex items-center gap-1">
          <BarChart3 size={10} /> {note.difficulty}
        </span>
        {note.interviewImportance > 50 && (
          <span className="flex items-center gap-1 text-purple-400">
            <Target size={10} /> interview
          </span>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-[9px] font-medium text-slate-400 mb-4">
        <span>{metadata?.flashcards?.length || 0} cards</span>
        <span>{note.reviewCount} reviews</span>
        <span>{note.relatedNoteIds?.length || 0} linked</span>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2 mt-auto">
        <button
          onClick={(e) => { e.stopPropagation(); onAction('recall'); }}
          className="py-2 bg-brand/10 text-brand text-[10px] font-semibold hover:bg-brand hover:text-white transition-colors flex items-center justify-center gap-1.5"
        >
          <Brain size={11} /> Recall
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onAction('detail'); }}
          className="py-2 bg-white/[0.04] text-slate-400 text-[10px] font-semibold hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center gap-1.5"
        >
          <Sparkles size={11} /> Insights
        </button>
      </div>
    </Motion.div>
  );
}

function KnowledgeLayerBadge({ layer }: { layer: string }) {
  const styles: Record<string, { color: string; label: string }> = {
    surface: { color: "text-slate-500", label: "S" },
    understanding: { color: "text-cyan-400", label: "U" },
    application: { color: "text-amber-400", label: "A" },
    mastery: { color: "text-emerald-400", label: "M" }
  };
  const s = styles[layer] || styles.surface;
  return (
    <span className={cn("text-[9px] font-bold", s.color)} title={`Knowledge: ${layer}`}>
      {s.label}
    </span>
  );
}

// ─── KNOWLEDGE INSIGHTS PANEL ───

export function KnowledgeInsightsPanel({ health, priorities, onIngestClick, onFileUpload, loading }: {
  health: KnowledgeHealthMetrics | null;
  priorities: RevisionPriority[];
  onIngestClick?: () => void;
  onFileUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading?: boolean;
}) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI Intelligence</h3>
        <div className={cn(
          "w-1.5 h-1.5 rounded-full",
          health?.knowledgeMomentum === "accelerating" ? "bg-emerald-500" :
          health?.knowledgeMomentum === "steady" ? "bg-cyan-500" :
          health?.knowledgeMomentum === "declining" ? "bg-amber-500" : "bg-red-500"
        )} />
      </div>

      {/* Momentum Indicator */}
      {health && (
        <div className="space-y-4">
          <MomentumWidget health={health} />
          <RetentionBreakdown health={health} />
        </div>
      )}

      {/* Revision Digest */}
      {priorities.length > 0 && (
        <div className="pt-6 mt-6 border-t border-white/5">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Recovery Digest</h3>
          <div className="space-y-3">
            {priorities.slice(0, 4).map((p) => (
              <div key={p.noteId} className="group py-2 flex items-center justify-between border-b border-white/5 last:border-0 cursor-pointer">
                <div className="flex items-center gap-2 min-w-0">
                  <UrgencyDot urgency={p.urgency} />
                  <span className="text-[11px] font-medium text-slate-500 group-hover:text-white transition-colors truncate">
                    {p.title}
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 shrink-0 ml-2">~{p.estimatedMinutes}m</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mastery CTA */}
      <div className="p-5 border border-brand/20 bg-brand/5 mt-6">
        <h4 className="text-[11px] font-medium text-slate-300 mb-1.5">Transform into mastery</h4>
        <p className="text-[10px] text-slate-500 leading-relaxed mb-4">
          Upload any lecture, PDF, or video and Veda will create a mastery plan with recall prompts.
        </p>
        <div className="flex flex-col gap-2">
          <button 
            onClick={onIngestClick}
            className="w-full py-2 bg-brand text-white text-[10px] font-semibold hover:bg-brand/90 transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus size={12} /> Ingest knowledge
          </button>
          <label className="w-full py-2 border border-brand/30 text-brand text-[10px] font-semibold hover:bg-brand/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center relative overflow-hidden">
            {loading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
            {loading ? "Uploading..." : "Upload Material"}
            <input
              type="file"
              className="hidden"
              accept=".pdf,.txt,.md"
              onChange={onFileUpload}
              disabled={loading}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

function MomentumWidget({ health }: { health: KnowledgeHealthMetrics }) {
  const momentumConfig: Record<string, { icon: React.ReactNode; color: string; message: string }> = {
    accelerating: {
      icon: <TrendingUp size={14} />,
      color: "text-emerald-400",
      message: "Knowledge momentum is accelerating. Keep the streak going!"
    },
    steady: {
      icon: <Activity size={14} />,
      color: "text-cyan-400",
      message: "Steady learning pace. Consistent effort builds mastery."
    },
    declining: {
      icon: <TrendingDown size={14} />,
      color: "text-amber-400",
      message: "Momentum is dropping. A quick revision session can reverse this."
    },
    stalled: {
      icon: <AlertCircle size={14} />,
      color: "text-red-400",
      message: "Knowledge is stalling. Start with one small concept today."
    }
  };

  const cfg = momentumConfig[health.knowledgeMomentum] || momentumConfig.stalled;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className={cfg.color}>{cfg.icon}</span>
        <span className={cn("text-xs font-semibold capitalize", cfg.color)}>{health.knowledgeMomentum}</span>
      </div>
      <p className="text-[10px] text-slate-500 leading-relaxed">{cfg.message}</p>
    </div>
  );
}

function RetentionBreakdown({ health }: { health: KnowledgeHealthMetrics }) {
  const total = health.totalConcepts || 1;

  const segments = [
    { label: "Strong", count: health.strongConcepts, color: "bg-emerald-500" },
    { label: "Stable", count: health.stableConcepts, color: "bg-cyan-500" },
    { label: "Weakening", count: health.weakeningConcepts, color: "bg-amber-500" },
    { label: "Critical", count: health.criticalConcepts, color: "bg-red-500" }
  ];

  return (
    <div className="space-y-3">
      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Concept Health</h4>

      {/* Bar */}
      <div className="flex h-1.5 rounded-full overflow-hidden bg-white/5">
        {segments.map(s => (
          s.count > 0 && (
            <div
              key={s.label}
              className={cn("h-full transition-all", s.color)}
              style={{ width: `${(s.count / total) * 100}%` }}
            />
          )
        ))}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2">
        {segments.map(s => (
          <div key={s.label} className="flex items-center gap-2">
            <div className={cn("w-1.5 h-1.5 rounded-full", s.color)} />
            <span className="text-[9px] font-medium text-slate-500">{s.label}: {s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function UrgencyDot({ urgency }: { urgency: string }) {
  const colors: Record<string, string> = {
    critical: "bg-red-500",
    high: "bg-amber-500",
    medium: "bg-cyan-500",
    low: "bg-transparent0"
  };
  return <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", colors[urgency] || colors.low)} />;
}

// ─── NOTE DETAIL PANEL ───

export function NoteDetailPanel({ note, onClose }: {
  note: CareerNote;
  onClose: () => void;
}) {
  const metadata = note.metadata;

  return (
    <Motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed top-0 right-0 bottom-0 w-full max-w-lg z-50 glass-panel border-l border-border overflow-y-auto"
    >
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <KnowledgeLayerBadge layer={note.knowledgeLayer} />
              <span className="text-[9px] font-bold text-slate-400 uppercase">{note.difficulty}</span>
              <StrengthDot strength={note.strength} />
            </div>
            <h2 className="text-lg font-semibold text-white mb-1">{note.title}</h2>
            <p className="text-xs text-slate-500">{note.topic || "Uncategorized"}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1">
            <XCircle size={18} />
          </button>
        </div>

        {/* Summary */}
        {metadata?.summary && (
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI Summary</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{metadata.summary}</p>
          </div>
        )}

        {/* Concepts */}
        {note.concepts.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Concepts</h3>
            <div className="flex flex-wrap gap-2">
              {note.concepts.map((c, i) => (
                <span key={i} className="px-2.5 py-1 bg-brand/10 text-brand text-[10px] font-medium border border-brand/20">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Interview Relevance */}
        {metadata?.interviewRelevance && (
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Interview Relevance</h3>
            <div className="flex items-center gap-3 mb-2">
              <span className={cn(
                "text-[9px] font-bold uppercase px-2 py-0.5",
                metadata.interviewRelevance.frequency === "high" ? "bg-purple-500/20 text-purple-400" :
                metadata.interviewRelevance.frequency === "medium" ? "bg-cyan-500/20 text-cyan-400" :
                "bg-transparent0/20 text-slate-400"
              )}>
                {metadata.interviewRelevance.frequency} frequency
              </span>
              <span className="text-[10px] text-slate-500">
                Importance: {metadata.interviewRelevance.importance}/100
              </span>
            </div>
            {metadata.interviewRelevance.usageContext && (
              <p className="text-[11px] text-slate-400 leading-relaxed">{metadata.interviewRelevance.usageContext}</p>
            )}
            {metadata.interviewRelevance.commonQuestions?.length > 0 && (
              <div className="space-y-1.5 mt-2">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Common Questions:</p>
                {metadata.interviewRelevance.commonQuestions.map((q: string, i: number) => (
                  <p key={i} className="text-[10px] text-slate-400 pl-3 border-l-2 border-purple-500/30">{q}</p>
                ))}
              </div>
            )}
            {metadata.interviewRelevance.realWorldUsage?.length > 0 && (
              <div className="space-y-1.5 mt-2">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Real-World Usage:</p>
                {metadata.interviewRelevance.realWorldUsage.map((u: string, i: number) => (
                  <p key={i} className="text-[10px] text-slate-400 pl-3 border-l-2 border-emerald-500/30">{u}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Execution Tasks */}
        {(metadata?.executionTasks?.length ?? 0) > 0 && (
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Practice Tasks</h3>
            <div className="space-y-2">
              {metadata!.executionTasks.map((task: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 border border-white/[0.06] hover:border-white/15 transition-colors cursor-pointer">
                  <Code size={14} className="text-cyan-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-slate-300 truncate">{task.title}</p>
                    <p className="text-[9px] text-slate-400 capitalize">{task.type} · {task.difficulty}</p>
                  </div>
                  <ArrowRight size={12} className="text-slate-400" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Flashcards */}
        {(metadata?.flashcards?.length ?? 0) > 0 && (
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Flashcards ({metadata!.flashcards.length})
            </h3>
            <div className="space-y-2">
              {metadata!.flashcards.map((card: any, i: number) => (
                <div key={i} className="p-3 border border-white/[0.06] space-y-1.5">
                  <p className="text-[10px] font-semibold text-slate-300">Q: {card.question}</p>
                  <p className="text-[10px] text-slate-500">A: {card.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full Content */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Full Note</h3>
          <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">{note.content}</p>
        </div>
      </div>
    </Motion.div>
  );
}
