import { useState, useEffect, type FormEvent } from "react";
import {
  CheckCircle2, FileText, Loader2, Sparkles, Wand2, 
  Target, Shield, Brain, Download
} from "lucide-react";
import { tailorResume, uploadTailor } from "../../../lib/api/resume";
import { logBehavior } from "../../../lib/api/behavior";
import { cn } from "../../../lib/utils/cn";
import type { ResumeTailorResult } from "@studybuddy/shared";
import * as pdfjsLib from "pdfjs-dist";

// Standard Vite way to load the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export function ResumeTailorWorkspace({ initialResult }: { initialResult?: any }) {
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [currentResume, setCurrentResume] = useState("");
  const [result, setResult] = useState<ResumeTailorResult | null>(initialResult || null);
  const [isLoading, setLoading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdFile, setJdFile] = useState<File | null>(null);

  useEffect(() => {
    if (initialResult) setResult(initialResult);
  }, [initialResult]);

  const canSubmit = targetRole.trim().length >= 2 && (currentResume.trim().length >= 50 || resumeFile) && !isLoading && !isParsing;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    try {
      if (resumeFile && jdFile) {
        // Use the new fully automated backend pipeline
        const { result: tailored } = await uploadTailor(resumeFile, jdFile, targetRole);
        setResult(tailored);
      } else {
        // Fallback to text-based API
        const { result: tailored } = await tailorResume({
          targetRole,
          jobDescription,
          currentResume,
          tone: "impact",
          mode: "technical"
        });
        setResult(tailored);
      }
      await logBehavior("resume_tailored", { targetRole, tone: "impact", mode: "technical" });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Tailoring failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setResumeFile(file);
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
      setError("Failed to parse file. The backend will parse it directly.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleJdFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setJdFile(file);
    // Auto-parse if txt, otherwise backend handles it
    if (file.type === "text/plain") {
        const text = await file.text();
        setJobDescription(text);
    } else {
        setJobDescription(`[Attached File: ${file.name}]`);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    
    let content = "";

    if (result.fullyWrittenResume) {
      const r = result.fullyWrittenResume;
      content += `${r.personalInfo?.name || "Candidate Name"}\n`;
      if (r.personalInfo?.contactInfo) content += `${r.personalInfo.contactInfo}\n`;
      content += `\n${r.headline}\n`;
      content += `\nSUMMARY\n${r.summary}\n`;
      
      content += `\nSKILLS\n${r.skills.join(", ")}\n`;
      
      if (r.experience?.length) {
        content += `\nEXPERIENCE\n`;
        r.experience.forEach((exp: any) => {
          content += `\n${exp.title} | ${exp.company} | ${exp.duration} ${exp.location ? `| ${exp.location}` : ''}\n`;
          exp.bullets.forEach((b: string) => content += `- ${b}\n`);
        });
      }

      if (r.projects?.length) {
        content += `\nPROJECTS\n`;
        r.projects.forEach((proj: any) => {
          content += `\n${proj.name} ${proj.duration ? `| ${proj.duration}` : ''}\n${proj.description}\n`;
          proj.bullets.forEach((b: string) => content += `- ${b}\n`);
        });
      }

      if (r.education?.length) {
        content += `\nEDUCATION\n`;
        r.education.forEach((edu: any) => {
          content += `\n${edu.degree} - ${edu.institution} (${edu.year})\n`;
          if (edu.details) content += `${edu.details}\n`;
        });
      }
    } else {
      // Fallback to legacy gap analysis download
      content = `
Target Role: ${result.targetHeadline}
Summary:
${result.tailoredSummary}

Experience Updates:
${result.bulletRewrites.map(b => `- ${b.after}`).join('\n')}

Project Updates:
${result.projectAnalysis.map(p => `${p.projectName}:\n- ${p.engineeringStorytelling}`).join('\n\n')}

Missing Proof Points to Add:
${result.missingProofPoints.map(p => `- ${p}`).join('\n')}

ATS Keywords:
${result.keywordAdditions.join(', ')}
      `.trim();
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tailored_Resume_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[360px_1fr] h-full items-start">
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
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Job Description</label>
              <div className="relative border-2 border-dashed border-white/5 rounded-xl p-4 hover:bg-white/[0.02] transition-colors cursor-pointer text-center">
                <input type="file" onChange={handleJdFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept=".pdf,.txt" />
                {jdFile ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-400">
                    <CheckCircle2 size={14} />
                    <span className="text-[10px] font-bold uppercase">{jdFile.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-slate-500">
                    <FileText size={16} />
                    <span className="text-[10px] font-bold uppercase">Upload PDF / TXT JD</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Source Resume</label>
              <div className="relative border-2 border-dashed border-white/5 rounded-xl p-4 hover:bg-white/[0.02] transition-colors cursor-pointer text-center">
                <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept=".pdf,.txt" />
                {isParsing ? (
                  <Loader2 size={16} className="animate-spin text-cyan-400 mx-auto" />
                ) : resumeFile ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-400">
                    <CheckCircle2 size={14} />
                    <span className="text-[10px] font-bold uppercase">{resumeFile.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-slate-500">
                    <FileText size={16} />
                    <span className="text-[10px] font-bold uppercase">Upload PDF / TXT Resume</span>
                  </div>
                )}
              </div>
            </div>

            {error && <p className="text-[10px] text-red-400 font-medium">{error}</p>}

            <button
              disabled={!canSubmit}
              className="w-full py-3 rounded-xl bg-brand text-[11px] font-black uppercase tracking-widest text-white hover:bg-brand-light transition-all disabled:opacity-30 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
            >
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {isLoading ? "Positioning..." : "Execute Analysis"}
            </button>
          </form>
        </div>
      </aside>

      {/* Output Area */}
      <div className="min-h-[500px] rounded-3xl border border-white/[0.04] bg-white/[0.01] overflow-hidden flex flex-col relative">
        {!result ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-brand/5 border border-brand/10 flex items-center justify-center text-brand animate-pulse">
              <Wand2 size={32} />
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="text-xl font-bold text-white tracking-tight">Ready for career positioning.</h3>
              <p className="text-sm text-slate-500">StudyBuddy uses Veda Intelligence to strategically frame your experience for specific roles without inventing fake data.</p>
            </div>
            <div className="flex gap-8 text-slate-400">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase"><Shield size={14} /> Truthful AI</div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase"><Target size={14} /> ATS Optimized</div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase"><Brain size={14} /> Strategic</div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Tailored Intelligence Report</h3>
                <p className="text-xs text-slate-400 mt-1">Strategic repositioning for {targetRole}</p>
              </div>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand/10 text-brand-light text-xs font-bold uppercase tracking-widest hover:bg-brand/20 transition-all border border-brand/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
              >
                <Download size={14} /> Download Document
              </button>
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-2xl border border-emerald-500/10 bg-emerald-500/5 space-y-3">
                <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest flex items-center gap-2">
                  <CheckCircle2 size={14} /> Resume Analysis Complete
                </p>
                <p className="text-sm text-emerald-100/70 leading-relaxed">
                  Your resume has been successfully aligned against the target job description. We've compiled the repositioned bullets, updated summary, and missing ATS keywords into a single exportable document.
                </p>
                <p className="text-sm text-emerald-100/70 leading-relaxed italic">
                  "{result.roleFitSummary}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl border border-white/[0.04] bg-white/[0.02]">
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">ATS Readiness Score</p>
                  <p className={cn(
                    "text-4xl font-light tracking-tighter",
                    result.atsIntelligence.score > 80 ? "text-emerald-400" : result.atsIntelligence.score > 50 ? "text-amber-400" : "text-red-400"
                  )}>{result.atsIntelligence.score}%</p>
                </div>
                <div className="p-6 rounded-2xl border border-white/[0.04] bg-white/[0.02]">
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Keywords Added</p>
                  <p className="text-4xl font-light tracking-tighter text-cyan-400">
                    {result.keywordAdditions.length}
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-white/[0.04] bg-white/[0.02] flex flex-col items-center justify-center text-center py-12 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                  <FileText size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-200">View Full Document</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Click the download button above to retrieve your full tailored resume content, repositioned bullets, and strategic gap analysis.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
