import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Filter,
  Layers3,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Users
} from "lucide-react";
import type { CompanyPrepRole, CompanyTypeCard } from "@studybuddy/shared";
import { COMPANY_PREP_ROLES, getCompanyTypes } from "../lib/api/company-prep";
import { cn } from "../lib/utils/cn";

const difficultyStyles = {
  easy: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  medium: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  hard: "border-rose-400/20 bg-rose-400/10 text-rose-200"
};

function matchTone(score: number) {
  if (score >= 80) return "text-emerald-300";
  if (score >= 60) return "text-cyan-300";
  if (score >= 45) return "text-amber-300";
  return "text-rose-300";
}

export function CompaniesPage() {
  const [role, setRole] = useState<CompanyPrepRole>("Software Engineer");
  const [search, setSearch] = useState("");
  const [companyTypes, setCompanyTypes] = useState<CompanyTypeCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getCompanyTypes(role)
      .then((items) => {
        if (!cancelled) setCompanyTypes(items);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load company type prep data.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [role]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return companyTypes;
    return companyTypes.filter((item) =>
      [
        item.name,
        item.summary,
        item.selectivity,
        item.difficulty,
        ...item.focusAreas,
        ...item.exampleCompanies
      ].join(" ").toLowerCase().includes(query)
    );
  }, [companyTypes, search]);

  const bestMatch = companyTypes.reduce<CompanyTypeCard | null>((best, item) =>
    !best || item.matchScore > best.matchScore ? item : best
  , null);

  return (
    <section className="space-y-8 pb-10">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-7">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-200">
              <Building2 size={13} />
              Company Type Prep
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              <Layers3 size={13} />
              Hiring procedures + patterns
            </span>
          </div>
          <h1 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight text-white md:text-4xl">
            Prepare by the kind of company you are targeting.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-400">
            Mass recruiters, product giants, fintech teams, startups, AI labs, cloud platforms, and consumer-scale companies all test different signals. Pick a company type, see the full hiring flow, and drill the questions that match it.
          </p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[#080B12] p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/15 text-brand">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">Best current match</p>
              <p className="mt-1 text-lg font-bold text-white">{bestMatch?.name ?? "Analyzing"}</p>
            </div>
          </div>
          <div className="mt-6 flex items-end justify-between gap-4">
            <div>
              <p className={cn("text-5xl font-black tracking-tight", bestMatch ? matchTone(bestMatch.matchScore) : "text-slate-500")}>
                {bestMatch ? `${bestMatch.matchScore}%` : "--"}
              </p>
              <p className="mt-1 text-xs text-slate-500">based on your skills and notes</p>
            </div>
            {bestMatch && (
              <Link
                to={`/companies/${bestMatch.id}?role=${encodeURIComponent(role)}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/10"
              >
                Open <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-[24px] border border-white/10 bg-white/[0.025] p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search company type, example company, or focus area"
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="h-4 w-4 shrink-0 text-slate-500" />
          {COMPANY_PREP_ROLES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRole(item)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition",
                role === item
                  ? "border-brand bg-brand/15 text-white"
                  : "border-white/10 bg-white/[0.02] text-slate-500 hover:text-white"
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-5 text-sm text-rose-100">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item, index) => (
            <Motion.article
              key={item.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="group rounded-[24px] border border-white/10 bg-[#080B12]/90 p-5 transition hover:-translate-y-1 hover:border-cyan-300/30"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/[0.04] text-cyan-200 ring-1 ring-white/10">
                    <Building2 size={22} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-white">{item.name}</h2>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{item.summary}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn("text-3xl font-black", matchTone(item.matchScore))}>{item.matchScore}%</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">match</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className={cn("rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider", difficultyStyles[item.difficulty])}>
                  {item.difficulty}
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {item.selectivity}
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {item.questionCount} questions
                </span>
                {item.targeting && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                    <CheckCircle2 size={12} /> Targeting
                  </span>
                )}
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                    <Target size={12} /> Focus areas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {item.focusAreas.slice(0, 4).map((area) => (
                      <span key={area} className="rounded-lg bg-white/[0.04] px-2.5 py-1 text-[11px] text-slate-300">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                    <Users size={12} /> Examples
                  </p>
                  <p className="line-clamp-1 text-xs text-slate-400">{item.exampleCompanies.join(", ")}</p>
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <ShieldCheck size={14} className="text-emerald-300" />
                    {item.weakAreas.length ? `${item.weakAreas[0]} needs work` : "No major gap detected"}
                  </div>
                  <Link
                    to={`/companies/${item.id}?role=${encodeURIComponent(role)}`}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-[#080B12] transition hover:bg-cyan-100"
                  >
                    Prep <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </Motion.article>
          ))}
        </div>
      )}
    </section>
  );
}
