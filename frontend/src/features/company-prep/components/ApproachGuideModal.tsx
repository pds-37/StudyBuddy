import { AnimatePresence, motion as Motion } from "framer-motion";
import { Bookmark, CheckCircle2, CircleDot, Clock, Database, Lightbulb, Save, X } from "lucide-react";
import type { CompanyPrepQuestionStatus, PrepQuestion } from "@studybuddy/shared";
import { cn } from "../../../lib/utils/cn";

type ApproachGuideModalProps = {
  question: PrepQuestion | null;
  companyTypeName?: string;
  onClose: () => void;
  onStatusChange: (questionId: string, status: CompanyPrepQuestionStatus) => Promise<void>;
  onSaveNote: (questionId: string) => Promise<void>;
  busy?: boolean;
};

const statusItems: Array<{ status: CompanyPrepQuestionStatus; label: string; icon: typeof CircleDot }> = [
  { status: "attempted", label: "Attempted", icon: CircleDot },
  { status: "solved", label: "Solved", icon: CheckCircle2 },
  { status: "bookmarked", label: "Bookmark", icon: Bookmark }
];

export function ApproachGuideModal({
  question,
  companyTypeName,
  onClose,
  onStatusChange,
  onSaveNote,
  busy = false
}: ApproachGuideModalProps) {
  return (
    <AnimatePresence>
      {question && (
        <Motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Motion.article
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[28px] border border-white/10 bg-[#080B12] shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-[#080B12]/95 p-6 backdrop-blur">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-300">
                  {companyTypeName ?? "Company Type"} Approach Guide
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">{question.title}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    {question.difficulty}
                  </span>
                  {question.topics.map((topic) => (
                    <span key={topic} className="rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1 text-[10px] font-bold text-cyan-200">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 text-slate-400 transition hover:bg-white/10 hover:text-white"
                aria-label="Close approach guide"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <section className="grid gap-4 md:grid-cols-[1fr_280px]">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-300" />
                    <h3 className="text-sm font-bold text-white">Pattern Signal</h3>
                  </div>
                  <p className="text-lg font-semibold text-white">{question.approach.pattern}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{question.approach.signal}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-300" />
                    <h3 className="text-sm font-bold text-white">Complexity</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500">Time</span>
                      <span className="font-semibold text-slate-200">{question.approach.timeComplexity}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500">Space</span>
                      <span className="font-semibold text-slate-200">{question.approach.spaceComplexity}</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Database className="h-4 w-4 text-cyan-300" />
                  <h3 className="text-sm font-bold text-white">Mental Model</h3>
                </div>
                <ol className="space-y-3">
                  {question.approach.steps.map((step, index) => (
                    <li key={step} className="flex gap-3 text-sm leading-6 text-slate-300">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-[11px] font-black text-cyan-200">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </section>

              <section className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-200">Common Mistake</p>
                <p className="mt-2 text-sm leading-6 text-amber-50/90">{question.approach.commonMistake}</p>
              </section>

              <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  {statusItems.map((item) => {
                    const Icon = item.icon;
                    const active = question.userStatus === item.status;
                    return (
                      <button
                        key={item.status}
                        type="button"
                        disabled={busy}
                        onClick={() => onStatusChange(question.id, item.status)}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition",
                          active
                            ? "border-brand bg-brand/15 text-white"
                            : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-white"
                        )}
                      >
                        <Icon size={14} />
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onSaveNote(question.id)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-black uppercase tracking-widest text-[#080B12] transition hover:bg-cyan-100 disabled:opacity-50"
                >
                  <Save size={14} />
                  Save to notes
                </button>
              </div>
            </div>
          </Motion.article>
        </Motion.div>
      )}
    </AnimatePresence>
  );
}
