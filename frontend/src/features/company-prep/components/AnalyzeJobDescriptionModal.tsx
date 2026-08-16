import { useState } from "react";
import { Loader2, Sparkles, X } from "lucide-react";
import { COMPANY_PREP_ROLES } from "../../../lib/api/company-prep";
import type { CompanyPrepRole, CompanyTypeDetail } from "@studybuddy/shared";

interface AnalyzeJobDescriptionModalProps {
  onClose: () => void;
  onAnalyze: (data: { companyName: string; jobDescription: string; role: CompanyPrepRole }) => Promise<CompanyTypeDetail>;
  onSuccess: (detail: CompanyTypeDetail) => void;
}

export function AnalyzeJobDescriptionModal({ onClose, onAnalyze, onSuccess }: AnalyzeJobDescriptionModalProps) {
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [role, setRole] = useState<CompanyPrepRole>(COMPANY_PREP_ROLES[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !jobDescription.trim()) {
      setError("Please provide both company name and job description.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const detail = await onAnalyze({ companyName, jobDescription, role });
      onSuccess(detail);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err.message || "Failed to analyze job description.");
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/10 bg-[#080B12] p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-slate-500 transition hover:text-white"
        >
          <X size={20} />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400/10">
            <Sparkles className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Target Job Description</h2>
            <p className="text-sm text-slate-400">Generate a custom interview prep plan directly from a JD</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Company Name</label>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Netflix, Stripe, Google"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-cyan-400/50 focus:bg-white/[0.05]"
              disabled={busy}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Target Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as CompanyPrepRole)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white outline-none focus:border-cyan-400/50"
              disabled={busy}
            >
              {COMPANY_PREP_ROLES.map((r) => (
                <option key={r} value={r} className="bg-[#080B12]">
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Job Description</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description text here..."
              rows={8}
              className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white placeholder-slate-600 outline-none focus:border-cyan-400/50 focus:bg-white/[0.05]"
              disabled={busy}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-cyan-400 px-6 py-4 text-sm font-bold text-black transition hover:bg-cyan-300 disabled:opacity-50"
            >
              {busy ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing JD & Generating Plan...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Analyze Job Description
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
