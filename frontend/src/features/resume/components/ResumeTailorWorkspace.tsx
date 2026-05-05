import { useState, type FormEvent, type ReactNode } from "react";
import { isAxiosError } from "axios";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  FileText,
  Loader2,
  Sparkles,
  Wand2
} from "lucide-react";
import { tailorResume } from "../../../lib/api/resume";
import { logBehavior } from "../../../lib/api/behavior";
import { cn } from "../../../lib/utils/cn";
import type { ResumeTailorResult, ResumeTailorTone } from "@studybuddy/shared";
import * as pdfjsLib from "pdfjs-dist";

// Standard Vite way to load the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const toneOptions: Array<{ value: ResumeTailorTone; label: string; description: string }> = [
  { value: "impact", label: "Impact", description: "Outcome-first bullets" },
  { value: "technical", label: "Technical", description: "Tools and depth" },
  { value: "concise", label: "Concise", description: "Short and clean" }
];

const resumePlaceholder = `Select a PDF or TXT file to upload.`;

/** Converts API errors into a concise message for the resume form. */
function getErrorMessage(error: unknown) {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "Unable to tailor the resume right now.";
  }

  return error instanceof Error ? error.message : "Something went wrong.";
}

/** Renders the resume tailoring form and AI output sections. */
export function ResumeTailorWorkspace() {
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [currentResume, setCurrentResume] = useState("");
  const [tone, setTone] = useState<ResumeTailorTone>("impact");
  const [result, setResult] = useState<ResumeTailorResult | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = targetRole.trim().length >= 2 && currentResume.trim().length >= 80 && !isLoading && !isParsing;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tailored = await tailorResume({
        targetRole,
        jobDescription,
        currentResume,
        tone
      });
      setResult(tailored);
      await logBehavior("resume_tailored", { targetRole, tone });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const copyResult = async () => {
    if (!result) {
      return;
    }

    const text = [
      result.targetHeadline,
      "",
      result.tailoredSummary,
      "",
      "Bullet rewrites:",
      ...result.bulletRewrites.map((item) => `- ${item.after}`),
      "",
      "Keywords:",
      result.keywordAdditions.join(", ")
    ].join("\n");

    await navigator.clipboard.writeText(text);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setError(null);
    setCurrentResume("");

    try {
      if (file.type === "application/pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(" ");
          fullText += pageText + "\\n";
        }
        
        if (!fullText.trim()) {
          throw new Error("PDF extracted no text content.");
        }
        
        setCurrentResume(fullText);
      } else if (file.type === "text/plain") {
        const text = await file.text();
        setCurrentResume(text);
      } else {
        setError("Please upload a valid PDF or TXT file.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to parse the file. Please ensure it is a valid PDF or text file.");
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <form
        onSubmit={handleSubmit}
        className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cyan">Input</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">Role and resume context</h2>
          </div>
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-cyan/20 bg-cyan/10 text-cyan">
            <FileText className="h-5 w-5" />
          </div>
        </div>

        <label className="mt-6 block">
          <span className="text-sm font-medium text-slate-200">Target job role</span>
          <input
            value={targetRole}
            onChange={(event) => setTargetRole(event.target.value)}
            placeholder="Frontend Developer, Data Analyst, Product Manager..."
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan/35 focus:bg-black/35"
          />
        </label>

        <label className="mt-5 block">
          <span className="text-sm font-medium text-slate-200">Job description or requirements</span>
          <textarea
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            placeholder="Paste the role description, required skills, responsibilities, or job link notes..."
            rows={5}
            className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan/35 focus:bg-black/35"
          />
        </label>

        <label className="mt-5 block">
          <span className="text-sm font-medium text-slate-200">Resume Upload</span>
          <div className="relative mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-black/25 px-4 py-8 transition hover:border-cyan/35 hover:bg-black/35">
            <input 
              type="file" 
              accept=".pdf,.txt" 
              onChange={handleFileUpload}
              className="absolute inset-0 h-full w-full opacity-0 cursor-pointer" 
              title=""
            />
            {isParsing ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-cyan" />
                <span className="text-sm text-slate-400">Extracting text...</span>
              </div>
            ) : currentResume ? (
              <div className="flex flex-col items-center gap-2 text-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                <span className="text-sm text-slate-200">Resume Parsed Successfully</span>
                <span className="text-xs text-slate-500">({currentResume.length} characters extracted)</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <FileText className="h-6 w-6 text-slate-400" />
                <span className="text-sm text-slate-200">Click or drag PDF/TXT here</span>
                <span className="text-xs text-slate-500">Max size: 5MB</span>
              </div>
            )}
          </div>
        </label>

        <div className="mt-5">
          <p className="text-sm font-medium text-slate-200">Writing style</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {toneOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTone(option.value)}
                className={cn(
                  "rounded-2xl border p-3 text-left transition",
                  tone === option.value
                    ? "border-cyan/35 bg-cyan/10"
                    : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/[0.04]"
                )}
              >
                <span className="block text-sm font-semibold text-white">{option.label}</span>
                <span className="mt-1 block text-xs text-slate-500">{option.description}</span>
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <div className="mt-5 flex gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-100">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-300" />
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_44px_rgba(34,211,238,0.18)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          {isLoading ? "Tailoring resume..." : "Generate tailored edits"}
        </button>
      </form>

      <div className="rounded-[1.5rem] border border-white/[0.04] bg-ink p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cyan">Output</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">Tailored resume changes</h2>
          </div>
          <button
            type="button"
            onClick={() => void copyResult()}
            disabled={!result}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-300 transition hover:border-cyan/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Copy className="h-4 w-4" />
            Copy
          </button>
        </div>

        {result ? (
          <div className="mt-6 space-y-4">
            <ResultCard title="Fit summary" icon={<Sparkles className="h-4 w-4" />}>
              <p className="text-sm leading-7 text-slate-300">{result.roleFitSummary}</p>
            </ResultCard>

            <ResultCard title="Headline and summary" icon={<FileText className="h-4 w-4" />}>
              <p className="text-base font-semibold text-white">{result.targetHeadline}</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">{result.tailoredSummary}</p>
            </ResultCard>

            <ResultCard title="Bullet rewrites" icon={<Wand2 className="h-4 w-4" />}>
              <div className="space-y-3">
                {result.bulletRewrites.map((rewrite, index) => (
                  <div key={`${rewrite.after}-${index}`} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-600">Before</p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{rewrite.before}</p>
                    <p className="mt-4 text-xs uppercase tracking-[0.2em] text-cyan">After</p>
                    <p className="mt-2 text-sm leading-7 text-white">{rewrite.after}</p>
                    <p className="mt-3 text-xs leading-5 text-slate-500">{rewrite.reason}</p>
                  </div>
                ))}
              </div>
            </ResultCard>

            <div className="grid gap-4 lg:grid-cols-2">
              <Checklist title="Keywords to add" items={result.keywordAdditions} />
              <Checklist title="Missing proof points" items={result.missingProofPoints} />
              <Checklist title="ATS warnings" items={result.atsWarnings} warning />
              <Checklist title="Next actions" items={result.nextActions} />
            </div>
          </div>
        ) : (
          <div className="grid min-h-[560px] place-items-center">
            <div className="max-w-md text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-[1.4rem] border border-cyan/20 bg-cyan/10 text-cyan">
                <Wand2 className="h-7 w-7" />
              </div>
              <h3 className="mt-6 text-2xl font-bold tracking-tight text-white">Your tailored resume edits will appear here.</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                The AI will keep edits truthful, suggest stronger bullets, and show the keywords this role is likely scanning for.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

type ResultCardProps = {
  title: string;
  icon: ReactNode;
  children: ReactNode;
};

function ResultCard({ title, icon, children }: ResultCardProps) {
  return (
    <div className="rounded-[1rem] border border-white/[0.04] bg-black/20 p-4">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-cyan/10 text-cyan">{icon}</span>
        {title}
      </div>
      {children}
    </div>
  );
}

type ChecklistProps = {
  title: string;
  items: string[];
  warning?: boolean;
};

function Checklist({ title, items, warning = false }: ChecklistProps) {
  return (
    <div className="rounded-[1rem] border border-white/[0.04] bg-black/20 p-4">
      <p className="text-sm font-semibold text-white">{title}</p>
      <div className="mt-3 space-y-2">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div key={`${item}-${index}`} className="flex gap-2 text-sm leading-6 text-slate-300">
              {warning ? (
                <AlertCircle className="mt-1 h-4 w-4 flex-shrink-0 text-amber-300" />
              ) : (
                <CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0 text-cyan" />
              )}
              <span>{item}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">No items returned.</p>
        )}
      </div>
    </div>
  );
}
