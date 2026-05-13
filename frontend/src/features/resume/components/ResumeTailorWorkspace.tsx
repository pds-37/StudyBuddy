import { useState, useEffect, type FormEvent, type ReactNode } from "react";
import { isAxiosError } from "axios";
import {
  AlertCircle, CheckCircle2, Copy, FileText, Loader2, Sparkles, Wand2, 
  Target, Shield, Zap, ChevronRight, RotateCcw, Brain, Activity,
  Briefcase, Code, BarChart3, MessageSquare, AlertTriangle, Info,
  Check, X
} from "lucide-react";
import { tailorResume } from "../../../lib/api/resume";
import { logBehavior } from "../../../lib/api/behavior";
import { cn } from "../../../lib/utils/cn";
import type { ResumeTailorResult, ResumeTailorTone, ResumeMode, ResumeBulletRewrite } from "@studybuddy/shared";
import * as pdfjsLib from "pdfjs-dist";
import { motion as Motion, AnimatePresence } from "framer-motion";

// Standard Vite way to load the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const toneOptions: Array<{ value: ResumeTailorTone; label: string; description: string }> = [
  { value: "impact", label: "Impact", description: "Outcome-first" },
  { value: "technical", label: "Technical", description: "Engineering depth" },
  { value: "concise", label: "Concise", description: "Direct and clean" }
];

const modeOptions: Array<{ value: ResumeMode; label: string; icon: ReactNode }> = [
  { value: "startup", label: "Startup", icon: <Zap size={14} /> },
  { value: "faang", label: "FAANG", icon: <Shield size={14} /> },
  { value: "internship", label: "Internship", icon: <Target size={14} /> },
  { value: "technical", label: "Technical", icon: <Code size={14} /> },
  { value: "ats_optimized", label: "ATS Focus", icon: <Activity size={14} /> }
];

export function ResumeTailorWorkspace({ initialResult }: { initialResult?: any }) {
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [currentResume, setCurrentResume] = useState("");
  const [tone, setTone] = useState<ResumeTailorTone>("impact");
  const [mode, setMode] = useState<ResumeMode>("technical");
  const [result, setResult] = useState<ResumeTailorResult | null>(initialResult || null);
  const [isLoading, setLoading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Collaborative edit state
  const [acceptedBullets, setAcceptedBullets] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (initialResult) setResult(initialResult);
  }, [initialResult]);

  const canSubmit = targetRole.trim().length >= 2 && currentResume.trim().length >= 50 && !isLoading && !isParsing;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);
    setAcceptedBullets(new Set());

    try {
      const { result: tailored } = await tailorResume({
        targetRole,
        jobDescription,
        currentResume,
        tone,
        mode
      });
      setResult(tailored);
      await logBehavior("resume_tailored", { targetRole, tone, mode });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Tailoring failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsParsing(true);
    setError(null);
    try {
      if (file.type === "application/pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map((item: any) => item.str).join(" ") + "\n";
        }
        setCurrentResume(fullText);
      } else {
        const text = await file.text();
        setCurrentResume(text);
      }
    } catch (err) {
      setError("Failed to parse file.");
    } finally {
      setIsParsing(false);
    }
  };

  const toggleBullet = (index: number) => {
    const next = new Set(acceptedBullets);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setAcceptedBullets(next);
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[400px_1fr] h-full items-start">
      {/* Input Sidebar */}
      <aside className="space-y-6">
        <div className="p-6 rounded-2xl border border-white/[0.04] bg-white/[0.02] space-y-6">
          <div>
            <p className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-1">Intelligence Input</p>
            <h2 className="text-sm font-semibold text-white">Target Parameters</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target Role</label>
              <input 
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Job Description (Optional)</label>
              <textarea 
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                placeholder="Paste JD for higher accuracy..."
                rows={4}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-cyan-500/50 transition-all resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Source Resume</label>
              <div className="relative border-2 border-dashed border-white/5 rounded-xl p-4 hover:bg-white/[0.02] transition-colors cursor-pointer text-center">
                <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept=".pdf,.txt" />
                {isParsing ? (
                  <Loader2 size={16} className="animate-spin text-cyan-400 mx-auto" />
                ) : currentResume ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-400">
                    <CheckCircle2 size={14} />
                    <span className="text-[10px] font-bold uppercase">Ready ({currentResume.length} chars)</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-slate-500">
                    <FileText size={16} />
                    <span className="text-[10px] font-bold uppercase">Upload PDF / TXT</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Repositioning Mode</label>
              <div className="grid grid-cols-2 gap-2">
                {modeOptions.map(m => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMode(m.value)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg border text-[10px] font-bold transition-all",
                      mode === m.value ? "border-brand/40 bg-brand/5 text-brand" : "border-white/5 text-slate-500 hover:text-slate-300"
                    )}
                  >
                    {m.icon}
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Output Tone</label>
              <div className="flex gap-2">
                {toneOptions.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTone(t.value)}
                    className={cn(
                      "flex-1 py-2 rounded-lg border text-[10px] font-bold transition-all",
                      tone === t.value ? "border-cyan-500/40 bg-cyan-500/5 text-cyan-400" : "border-white/5 text-slate-500 hover:text-slate-300"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-[10px] text-red-400 font-medium">{error}</p>}

            <button
              disabled={!canSubmit}
              className="w-full py-3 rounded-xl bg-brand text-[11px] font-black uppercase tracking-widest text-black hover:bg-brand/90 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {isLoading ? "Positioning..." : "Execute Analysis"}
            </button>
          </form>
        </div>
      </aside>

      {/* Output Area */}
      <div className="min-h-[600px] rounded-3xl border border-white/[0.04] bg-white/[0.01] overflow-hidden flex flex-col">
        {!result ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-brand/5 border border-brand/10 flex items-center justify-center text-brand animate-pulse">
              <Wand2 size={32} />
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="text-xl font-bold text-white tracking-tight">Ready for career positioning.</h3>
              <p className="text-sm text-slate-500">StudyBuddy uses Veda Intelligence to strategically frame your experience for specific roles without inventing fake data.</p>
            </div>
            <div className="flex gap-8 text-slate-600">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase"><Shield size={14} /> Truthful AI</div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase"><Target size={14} /> ATS Optimized</div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase"><Brain size={14} /> Strategic</div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Intelligence Header */}
            <div className="p-8 border-b border-white/[0.04] bg-white/[0.01] grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Role Fit Analysis</p>
                <p className="text-sm text-slate-300 leading-relaxed italic">"{result.roleFitSummary}"</p>
              </div>
              <div className="space-y-4">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">ATS Readiness</p>
                <div className="flex items-end gap-4">
                  <span className={cn(
                    "text-5xl font-light tracking-tighter",
                    result.atsIntelligence.score > 80 ? "text-emerald-400" : result.atsIntelligence.score > 50 ? "text-amber-400" : "text-red-400"
                  )}>{result.atsIntelligence.score}%</span>
                  <div className="pb-1 space-y-1">
                    <p className="text-[10px] text-slate-400 font-medium">Keywords: {result.keywordAdditions.length} found</p>
                    <p className={cn("text-[9px] font-bold uppercase", 
                      result.atsIntelligence.formattingSafety.status === "safe" ? "text-emerald-500" : "text-red-400")}>
                      {result.atsIntelligence.formattingSafety.status} Formatting
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Target Narrative</p>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-brand">{result.targetHeadline}</p>
                  <p className="text-[10px] text-slate-500 line-clamp-3">{result.tailoredSummary}</p>
                </div>
              </div>
            </div>

            {/* Main Tabs/Grid */}
            <div className="p-8 space-y-12">
              {/* Collaborative Bullet Editor */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                    <MessageSquare size={14} className="text-cyan-400" />
                    Strategic Bullet Repositioning
                  </h3>
                  <span className="text-[9px] text-slate-500 italic">Toggle to accept/reject edits</span>
                </div>
                
                <div className="space-y-4">
                  {result.bulletRewrites.map((rewrite, i) => (
                    <div key={i} className="group relative rounded-2xl border border-white/[0.04] bg-white/[0.02] overflow-hidden transition-all hover:border-white/[0.08]">
                      <div className="grid md:grid-cols-2 gap-0 border-b border-white/[0.04]">
                        <div className="p-4 bg-red-500/[0.02]">
                          <p className="text-[8px] font-black uppercase text-red-500/50 mb-2">Original Context</p>
                          <p className="text-[11px] text-slate-500 leading-relaxed">{rewrite.before}</p>
                        </div>
                        <div className={cn("p-4 transition-colors", acceptedBullets.has(i) ? "bg-emerald-500/5" : "bg-cyan-500/[0.02]")}>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[8px] font-black uppercase text-cyan-400 mb-0">AI Positioned Bullet</p>
                            <div className="flex gap-2">
                              <div className="flex items-center gap-1">
                                <span className="text-[8px] text-slate-600 font-bold">IMPACT</span>
                                <div className="w-10 h-1 bg-white/5 overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${rewrite.impactScore}%` }} /></div>
                              </div>
                            </div>
                          </div>
                          <p className={cn("text-[11px] leading-relaxed transition-all", acceptedBullets.has(i) ? "text-emerald-300 font-medium" : "text-slate-200")}>
                            {rewrite.after}
                          </p>
                        </div>
                      </div>
                      <div className="px-4 py-2 flex items-center justify-between bg-black/20">
                        <p className="text-[9px] text-slate-600 flex items-center gap-1">
                          <Info size={10} />
                          {rewrite.reason}
                        </p>
                        <button 
                          onClick={() => toggleBullet(i)}
                          className={cn(
                            "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all flex items-center gap-1.5",
                            acceptedBullets.has(i) ? "bg-emerald-500 text-black" : "bg-white/5 text-slate-400 hover:text-white"
                          )}
                        >
                          {acceptedBullets.has(i) ? <Check size={10} /> : <RotateCcw size={10} />}
                          {acceptedBullets.has(i) ? "Accepted" : "Apply Edit"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Project & Interview Intelligence */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Project Framing */}
                <section className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                    <Code size={14} className="text-purple-400" />
                    Engineering Storytelling
                  </h3>
                  <div className="space-y-4">
                    {result.projectAnalysis.map((proj, i) => (
                      <div key={i} className="p-5 rounded-2xl border border-white/[0.04] bg-white/[0.02] space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[11px] font-bold text-slate-200">{proj.projectName}</h4>
                          <span className="text-[8px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-bold uppercase">Architecture</span>
                        </div>
                        <div className="space-y-3">
                          <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                            <p className="text-[9px] font-black uppercase text-slate-600 mb-2">Strategic Narrative</p>
                            <p className="text-[11px] text-slate-400 leading-relaxed italic">"{proj.strategicFraming}"</p>
                          </div>
                          <div className="p-3 rounded-lg bg-brand/5 border border-brand/10">
                            <p className="text-[9px] font-black uppercase text-brand mb-2">Storytelling Rewrite</p>
                            <p className="text-[11px] text-slate-200 leading-relaxed">{proj.engineeringStorytelling}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {proj.impactMetricsSuggested.map((m, j) => (
                            <span key={j} className="px-2 py-1 rounded-md bg-white/5 text-[9px] text-slate-500 border border-white/5">
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Interview Alignment */}
                <section className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                    <Activity size={14} className="text-emerald-400" />
                    Interview Alignment
                  </h3>
                  <div className="space-y-4">
                    <div className="p-5 rounded-2xl border border-white/[0.04] bg-white/[0.02] space-y-4">
                      <p className="text-[9px] font-black uppercase text-slate-600">Likely Questions</p>
                      <div className="space-y-2">
                        {result.interviewAlignment.likelyQuestions.map((q, i) => (
                          <div key={i} className="flex gap-3 text-[11px] text-slate-300 group">
                            <span className="text-emerald-500/50">?</span>
                            <p>{q}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-5 rounded-2xl border border-red-500/10 bg-red-500/[0.02] space-y-4">
                      <p className="text-[9px] font-black uppercase text-red-400/50 flex items-center gap-2">
                        <AlertTriangle size={10} />
                        Weak Discussion Areas
                      </p>
                      <div className="space-y-2">
                        {result.interviewAlignment.weakDiscussionAreas.map((w, i) => (
                          <div key={i} className="flex gap-3 text-[11px] text-slate-400">
                            <span className="text-red-500/30">•</span>
                            <p>{w}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Keyword & ATS Health */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="p-6 rounded-2xl border border-white/[0.04] bg-white/[0.02] space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                    <BarChart3 size={14} className="text-cyan-400" />
                    Missing Proof Points
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.missingProofPoints.map((p, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/5 text-[10px] text-slate-400 flex items-center gap-2">
                        <Info size={10} className="text-cyan-500" />
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-6 rounded-2xl border border-white/[0.04] bg-white/[0.02] space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                    <Zap size={14} className="text-amber-400" />
                    ATS Keywords to Add
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.keywordAdditions.map((k, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[10px] text-amber-200/70 font-medium">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
