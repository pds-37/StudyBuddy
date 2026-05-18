import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  ClipboardList,
  Layers3,
  Loader2,
  Play,
  Route,
  Search,
  ShieldAlert,
  Target,
  TimerReset
} from "lucide-react";
import type {
  CompanyPrepDifficulty,
  CompanyPrepQuestionStatus,
  CompanyPrepRole,
  CompanyTypeDetail,
  PrepQuestion
} from "@studybuddy/shared";
import {
  COMPANY_PREP_ROLES,
  getCompanyTypeDetail,
  savePrepQuestionToNotes,
  startCompanyPrep,
  updatePrepQuestionStatus
} from "../lib/api/company-prep";
import { ApproachGuideModal } from "../features/company-prep/components/ApproachGuideModal";
import { cn } from "../lib/utils/cn";

type StatusFilter = CompanyPrepQuestionStatus | "unseen" | "all";

const difficultyRank = { easy: 1, medium: 2, hard: 3 };
const statusLabel: Record<StatusFilter, string> = {
  all: "All",
  unseen: "Unseen",
  attempted: "Attempted",
  solved: "Solved",
  bookmarked: "Bookmarked"
};

function getFrequency(question: PrepQuestion, companyTypeId: string) {
  return question.companyTypes.find((item) => item.companyTypeId === companyTypeId)?.frequency ?? 0;
}

function statusIcon(status?: CompanyPrepQuestionStatus) {
  if (status === "solved") return <CheckCircle2 size={15} className="text-emerald-300" />;
  if (status === "attempted") return <CircleDot size={15} className="text-amber-300" />;
  if (status === "bookmarked") return <Bookmark size={15} className="text-cyan-300" />;
  return <CircleDot size={15} className="text-slate-600" />;
}

function matchTone(score: number) {
  if (score >= 80) return "text-emerald-300";
  if (score >= 60) return "text-cyan-300";
  if (score >= 45) return "text-amber-300";
  return "text-rose-300";
}

export function CompanyTypeDetailPage() {
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const companyTypeId = params.companyTypeId ?? "";
  const roleParam = searchParams.get("role") as CompanyPrepRole | null;
  const [role, setRole] = useState<CompanyPrepRole>(
    roleParam && COMPANY_PREP_ROLES.includes(roleParam) ? roleParam : "Software Engineer"
  );
  const [detail, setDetail] = useState<CompanyTypeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("all");
  const [difficulty, setDifficulty] = useState<CompanyPrepDifficulty | "all">("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<"frequency" | "difficulty" | "title">("frequency");
  const [selectedQuestion, setSelectedQuestion] = useState<PrepQuestion | null>(null);
  const [busy, setBusy] = useState(false);
  const [targetDate, setTargetDate] = useState("");

  useEffect(() => {
    setSearchParams({ role });
  }, [role, setSearchParams]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getCompanyTypeDetail(companyTypeId, role)
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load company type detail.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [companyTypeId, role]);

  const topics = useMemo(() => {
    if (!detail) return [];
    return Array.from(new Set(detail.questions.flatMap((question) => question.topics))).sort();
  }, [detail]);

  const filteredQuestions = useMemo(() => {
    if (!detail) return [];
    const search = query.trim().toLowerCase();

    return detail.questions
      .filter((question) => {
        if (search && ![question.title, question.approach.pattern, ...question.topics].join(" ").toLowerCase().includes(search)) return false;
        if (topic !== "all" && !question.topics.includes(topic)) return false;
        if (difficulty !== "all" && question.difficulty !== difficulty) return false;
        if (status !== "all") {
          if (status === "unseen" && question.userStatus) return false;
          if (status !== "unseen" && question.userStatus !== status) return false;
        }
        return true;
      })
      .sort((left, right) => {
        if (sort === "title") return left.title.localeCompare(right.title);
        if (sort === "difficulty") return difficultyRank[left.difficulty] - difficultyRank[right.difficulty];
        return getFrequency(right, detail.id) - getFrequency(left, detail.id);
      });
  }, [detail, query, topic, difficulty, status, sort]);

  const nextPlanQuestions = useMemo(() => {
    if (!detail?.prepPlan) return [];
    const questionMap = new Map(detail.questions.map((question) => [question.id, question]));
    return detail.prepPlan.nextQuestionIds
      .map((questionId) => questionMap.get(questionId))
      .filter((question): question is PrepQuestion => Boolean(question));
  }, [detail]);

  const replaceQuestion = (updated: PrepQuestion) => {
    setDetail((current) => current
      ? { ...current, questions: current.questions.map((question) => question.id === updated.id ? { ...question, ...updated } : question) }
      : current
    );
    setSelectedQuestion((current) => current?.id === updated.id ? { ...current, ...updated } : current);
  };

  const handleStartPrep = async () => {
    if (!detail) return;
    setBusy(true);
    try {
      const prepPlan = await startCompanyPrep(detail.id, {
        role,
        targetDate: targetDate ? new Date(`${targetDate}T00:00:00`).toISOString() : undefined
      });
      setDetail({ ...detail, targeting: true, prepPlan });
    } finally {
      setBusy(false);
    }
  };

  const handleStatusChange = async (questionId: string, nextStatus: CompanyPrepQuestionStatus) => {
    setBusy(true);
    try {
      const updated = await updatePrepQuestionStatus(questionId, nextStatus);
      replaceQuestion(updated);
    } finally {
      setBusy(false);
    }
  };

  const handleSaveNote = async (questionId: string) => {
    setBusy(true);
    try {
      const result = await savePrepQuestionToNotes(questionId);
      const current = (detail?.questions ?? []).find((question) => question.id === questionId);
      if (current) {
        replaceQuestion({ ...current, userStatus: current.userStatus ?? "bookmarked", savedNoteId: result.noteId });
      }
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[520px] items-center justify-center">
        <Loader2 className="h-9 w-9 animate-spin text-brand" />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <section className="space-y-5">
        <Link to="/companies" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white">
          <ArrowLeft size={16} /> Back to company types
        </Link>
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-5 text-sm text-rose-100">
          {error ?? "Company type not found."}
        </div>
      </section>
    );
  }

  const solvedCount = detail.questions.filter((question) => question.userStatus === "solved").length;
  const attemptedCount = detail.questions.filter((question) => question.userStatus === "attempted").length;

  return (
    <section className="space-y-8 pb-10">
      <Link to="/companies" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-white">
        <ArrowLeft size={16} /> Company types
      </Link>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-200">
              {detail.selectivity}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              {detail.hiringFrequency.replace("-", " ")} frequency
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              updated {detail.lastUpdated}
            </span>
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-white md:text-4xl">{detail.name}</h1>
          <p className="mt-4 max-w-4xl text-sm leading-6 text-slate-400">{detail.summary}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {detail.exampleCompanies.map((company) => (
              <span key={company} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-slate-300">
                {company}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[#080B12] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">Match score</p>
              <p className={cn("mt-2 text-5xl font-black tracking-tight", matchTone(detail.matchScore))}>{detail.matchScore}%</p>
            </div>
            <Target className="h-8 w-8 text-brand" />
          </div>

          <div className="mt-5">
            <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">Role lens</label>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as CompanyPrepRole)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold text-white outline-none"
            >
              {COMPANY_PREP_ROLES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">Interview date</label>
            <input
              type="date"
              value={targetDate}
              onChange={(event) => setTargetDate(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold text-white outline-none"
            />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <MiniStat label="Questions" value={detail.questionCount} icon={<BookOpen size={15} />} />
            <MiniStat label="Solved" value={solvedCount} icon={<CheckCircle2 size={15} />} />
            <MiniStat label="Attempted" value={attemptedCount} icon={<CircleDot size={15} />} />
            <MiniStat label="Patterns" value={detail.topPatterns.length} icon={<Layers3 size={15} />} />
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={handleStartPrep}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-[#080B12] transition hover:bg-cyan-100 disabled:opacity-50"
          >
            <Play size={15} />
            {detail.targeting ? "Regenerate prep list" : "Start prep"}
          </button>
        </div>
      </div>

      {detail.prepPlan && (
        <section className="rounded-[28px] border border-brand/20 bg-brand/10 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand">Personalized Prep List</p>
              <h2 className="mt-1 text-2xl font-bold text-white">Next questions to attack</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                Generated from the top high-frequency questions, with weak topics pulled forward and solved questions removed from the immediate queue.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {detail.prepPlan.weakAreas.slice(0, 5).map((area) => (
                  <span key={area} className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[10px] font-bold text-amber-100">
                    Gap: {area}
                  </span>
                ))}
                {detail.prepPlan.strongAreas.slice(0, 4).map((area) => (
                  <span key={area} className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[10px] font-bold text-emerald-100">
                    Strong: {area}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-right">
              <p className="text-3xl font-black text-white">{detail.prepPlan.questionIds.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">planned questions</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {nextPlanQuestions.slice(0, 12).map((question, index) => (
              <button
                key={question.id}
                type="button"
                onClick={() => setSelectedQuestion(question)}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-3 text-left transition hover:bg-white/10"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-black text-white">
                  {index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-white">{question.title}</span>
                  <span className="block truncate text-[11px] text-slate-400">{question.approach.pattern}</span>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[28px] border border-white/10 bg-[#080B12]/80 p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-300">Hiring Procedure</p>
              <h2 className="mt-1 text-xl font-bold text-white">Round-by-round flow</h2>
            </div>
            <Route className="h-6 w-6 text-cyan-300" />
          </div>
          <div className="space-y-4">
            {detail.procedure.map((stage) => (
              <article key={stage.order} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-xs font-black text-cyan-200">
                    {stage.order}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="font-bold text-white">{stage.name}</h3>
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <TimerReset size={12} /> {stage.duration}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{stage.format}</p>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <SignalBlock title="Signals" items={stage.evaluationSignals} />
                      <SignalBlock title="Prep tips" items={stage.preparationTips} />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-[28px] border border-white/10 bg-[#080B12]/80 p-6">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-300" />
              <h2 className="text-xl font-bold text-white">Question mix</h2>
            </div>
            <div className="space-y-3">
              {detail.questionMix.map((item) => (
                <div key={item.topic}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{item.topic}</span>
                    <span className="text-slate-500">{item.weight}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-300" style={{ width: `${item.weight}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#080B12]/80 p-6">
            <div className="mb-4 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-300" />
              <h2 className="text-xl font-bold text-white">Top patterns</h2>
            </div>
            <div className="space-y-2">
              {detail.topPatterns.map((item) => (
                <div key={item.pattern} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <span className="text-sm font-semibold text-slate-300">{item.pattern}</span>
                  <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[10px] font-bold text-slate-400">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-[28px] border border-white/10 bg-[#080B12]/80 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-300">Question Bank</p>
            <h2 className="mt-1 text-2xl font-bold text-white">Frequency-sorted practice list</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={topic} onChange={(event) => setTopic(event.target.value)} className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold text-white outline-none">
              <option value="all">All topics</option>
              {topics.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as CompanyPrepDifficulty | "all")} className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold text-white outline-none">
              <option value="all">All difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <select value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)} className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold text-white outline-none">
              {(Object.keys(statusLabel) as StatusFilter[]).map((item) => <option key={item} value={item}>{statusLabel[item]}</option>)}
            </select>
            <select value={sort} onChange={(event) => setSort(event.target.value as "frequency" | "difficulty" | "title")} className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold text-white outline-none">
              <option value="frequency">Frequency</option>
              <option value="difficulty">Difficulty</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search question, topic, or approach pattern"
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
          />
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
          {filteredQuestions.map((question) => (
            <button
              key={question.id}
              type="button"
              onClick={() => setSelectedQuestion(question)}
              className="grid w-full gap-3 border-b border-white/10 bg-white/[0.015] p-4 text-left transition last:border-b-0 hover:bg-white/[0.04] lg:grid-cols-[1fr_160px_130px_170px_36px] lg:items-center"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {statusIcon(question.userStatus)}
                  <h3 className="truncate text-sm font-bold text-white">{question.title}</h3>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {question.topics.slice(0, 4).map((item) => (
                    <span key={item} className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[10px] text-slate-400">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Pattern</p>
                <p className="mt-1 truncate text-xs font-semibold text-slate-300">{question.approach.pattern}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Difficulty</p>
                <p className="mt-1 text-xs font-semibold capitalize text-slate-300">{question.difficulty}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Frequency</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.05]">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${getFrequency(question, detail.id)}%` }} />
                </div>
              </div>
              <ChevronRight className="hidden h-4 w-4 text-slate-600 lg:block" />
            </button>
          ))}
          {filteredQuestions.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-500">No questions match these filters.</div>
          )}
        </div>
      </section>

      <ApproachGuideModal
        question={selectedQuestion}
        companyTypeName={detail.name}
        onClose={() => setSelectedQuestion(null)}
        onStatusChange={handleStatusChange}
        onSaveNote={handleSaveNote}
        busy={busy}
      />
    </section>
  );
}

function MiniStat({ label, value, icon }: { label: string; value: string | number; icon: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <div className="mb-2 text-slate-500">{icon}</div>
      <p className="text-xl font-black text-white">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">{label}</p>
    </div>
  );
}

function SignalBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
        <ClipboardList size={12} /> {title}
      </p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="text-xs leading-5 text-slate-400">{item}</li>
        ))}
      </ul>
    </div>
  );
}
