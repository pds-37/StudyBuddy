import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  Brain,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  Clock,
  Loader2,
  ShieldAlert,
  Target,
  TrendingUp,
  Zap
} from "lucide-react";
import { skillsApi } from "../features/skills/api";
import { NebulaBackground } from "../components/common/NebulaBackground";
import { ReadinessRing, SkillMatrixCard } from "../features/skills/components/IntelligenceComponents";
import { type SkillGapAnalysis } from "../features/skills/types";
import { adoptMentorStrategy } from "../lib/api/mentor";
import { logBehavior } from "../lib/api/behavior";
import { getApiErrorMessage } from "../lib/api/error";
import { cn } from "../lib/utils/cn";

export function SkillGapPage() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery<SkillGapAnalysis>({
    queryKey: ["skill-gap"],
    queryFn: skillsApi.getGapAnalysis as any
  });

  const adoptStrategy = useMutation({
    mutationFn: async (analysis: SkillGapAnalysis) => {
      const plan = await adoptMentorStrategy({
        targetRole: analysis.targetRole,
        recoveryPlan: analysis.recommendations.recoveryPlan ?? "Prioritize the biggest skill gaps and convert them into today's mentor tasks.",
        nextSkills: analysis.recommendations.nextSkills ?? [],
        gaps: (analysis.gaps ?? []).map((gap) => ({
          skill: gap.skill,
          gapScore: gap.gapScore,
          userScore: gap.userScore
        }))
      });

      await logBehavior("strategy_adopted", {
        targetRole: analysis.targetRole,
        focus: plan.focus,
        nextSkills: analysis.recommendations.nextSkills ?? []
      }).catch(() => undefined);

      return plan;
    },
    onSuccess: () => {
      navigate("/dashboard");
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <div className="mb-4 h-12 w-12 rounded-full border-4 border-brand/20 border-t-brand animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-500 animate-pulse">Running AI Career Intelligence...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-8 text-center">
        <NebulaBackground opacity={0.2} />
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-lg border border-brand/20 bg-brand/10 text-brand">
          <Target size={34} />
        </div>
        <h1 className="mb-4 text-4xl font-black tracking-tight text-white">Set Your Trajectory</h1>
        <p className="mx-auto mb-8 max-w-md font-medium leading-relaxed text-slate-400">
          Complete onboarding to define your target role. Veda will track your readiness and build an adaptive learning path tailored to your goals.
        </p>
        <Link to="/onboarding" className="rounded-lg bg-brand px-8 py-4 text-xs font-black uppercase tracking-widest text-white transition hover:bg-brand/90">
          Configure Career Profile
        </Link>
      </div>
    );
  }

  const weakGapCount = data.gaps?.filter((gap) => gap.status === "weak").length ?? 0;
  const closestRole = data.roleMatches?.[0];

  return (
    <div className="relative min-h-full pb-12">
      <NebulaBackground opacity={0.06} showGrid={false} />

      <Motion.header initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="relative z-20">
        <div className="overflow-hidden rounded-lg border border-white/[0.08] bg-[#0b0f16]">
          <div className="flex flex-col gap-6 border-b border-white/[0.06] p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-brand/20 bg-brand/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-brand">
                <Activity size={13} className="animate-pulse" /> Skill Gap Intelligence
              </div>
              <h1 className="text-3xl font-black leading-none tracking-tight text-white lg:text-5xl">{data.targetRole}</h1>
              <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-slate-400 lg:text-base">
                {data.careerTrajectory || "Veda is analyzing your learning pattern and converting skill gaps into the next execution plan."}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-6 rounded-lg border border-white/[0.08] bg-white/[0.03] p-5">
              <ReadinessRing score={data.overallScore || 0} label="Readiness" />
              <div className="hidden h-20 w-px bg-white/[0.08] sm:block" />
              <div className="grid min-w-[210px] grid-cols-1 gap-4">
                <MiniMetric label="Learning Foundation" value={data.readiness?.learningFoundation || "Medium"} />
                <MiniMetric label="Problem Solving" value={data.readiness?.problemSolving || "Medium"} />
                <MiniMetric label="Interview Confidence" value={data.readiness?.interviewConfidence || "Weak"} />
              </div>
            </div>
          </div>

          <div className="grid gap-px bg-white/[0.06] sm:grid-cols-3">
            <SummaryTile label="Critical gaps" value={String(weakGapCount)} helper="need recovery" />
            <SummaryTile label="Next skill" value={data.recommendations?.nextSkills?.[0] ?? "Not set"} helper="Veda priority" />
            <SummaryTile label="Closest role" value={closestRole?.role ?? data.targetRole} helper={`${closestRole?.matchPercentage ?? data.overallScore ?? 0}% aligned`} />
          </div>
        </div>
      </Motion.header>

      <div className="sticky top-0 z-30 -mx-2 mt-5 overflow-x-auto px-2 py-2 backdrop-blur-xl">
        <div className="flex w-max gap-2 rounded-lg border border-white/[0.08] bg-[#080b10]/90 p-1">
          <JumpLink href="#market" label="Market" />
          <JumpLink href="#matrix" label="Skills" />
          <JumpLink href="#blockers" label="Blockers" />
          <JumpLink href="#insights" label="Insights" />
        </div>
      </div>

      <div className="relative z-10 mt-6 grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-8">
          <section id="market" className="scroll-mt-24 space-y-4">
            <SectionHeading
              icon={<Briefcase size={18} />}
              title="Market Alignment"
              subtitle="How your current profile compares with real roles"
              tone="cyan"
            />

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {(data.roleMatches || []).map((match, index) => (
                <Motion.div
                  key={match.role}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.08 }}
                  className="group rounded-lg border border-white/[0.08] bg-[#0c1017] p-5 transition-colors hover:border-white/[0.14]"
                >
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <span className="min-w-0 truncate text-lg font-semibold text-white transition-colors group-hover:text-brand">{match.role}</span>
                    <div className="rounded-md border border-brand/20 bg-brand/10 px-3 py-1 text-xs font-black text-brand">{match.matchPercentage}%</div>
                  </div>
                  <div className="mb-5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">
                    <Clock size={12} className="text-cyan-400" /> Est. Ready in {match.estimatedTimelineMonths} Months
                  </div>
                  <div className="space-y-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Critical Gaps</p>
                    <div className="flex flex-wrap gap-2">
                      {match.blockers.map((blocker) => (
                        <span key={blocker} className="rounded-md border border-red-400/10 bg-red-400/5 px-2.5 py-1.5 text-[10px] font-bold text-red-300">
                          {blocker}
                        </span>
                      ))}
                    </div>
                  </div>
                </Motion.div>
              ))}
            </div>
          </section>

          <section id="matrix" className="scroll-mt-24 space-y-4">
            <SectionHeading
              icon={<Brain size={18} />}
              title="Technical Mastery"
              subtitle="Confidence, retention, interview readiness, and practical strength"
              tone="brand"
            />

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {(data.gaps || []).map((gap) => (
                <SkillMatrixCard key={gap.skill} gap={gap} />
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          {data.recommendations?.recoveryPlan && (
            <section className="rounded-lg border border-brand/30 bg-brand/10 p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-white">
                <Zap size={18} className="fill-brand text-brand" /> Recovery Strategy
              </h3>
              <p className="mb-5 text-sm font-medium leading-6 text-slate-300">{data.recommendations.recoveryPlan}</p>
              <div className="mb-4 space-y-2">
                {(data.recommendations.nextSkills ?? []).slice(0, 3).map((skill) => (
                  <div key={skill} className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <CheckCircle2 size={14} className="text-brand" />
                    {skill}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => adoptStrategy.mutate(data)}
                disabled={adoptStrategy.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-[0_12px_28px_rgba(202,138,247,0.25)] transition hover:bg-brand/90 disabled:cursor-wait disabled:opacity-70"
              >
                {adoptStrategy.isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Adopting Strategy
                  </>
                ) : (
                  <>
                    Adopt Strategy <ArrowRight size={14} />
                  </>
                )}
              </button>
              {adoptStrategy.isError && (
                <p className="mt-3 text-[11px] font-semibold text-red-300">
                  {getApiErrorMessage(adoptStrategy.error, "Veda could not adopt this strategy yet. Please try again.")}
                </p>
              )}
            </section>
          )}

          <section id="blockers" className="scroll-mt-24 rounded-lg border border-white/[0.08] bg-[#0c1017] p-5">
            <h3 className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-red-400">
              <ShieldAlert size={16} /> Critical Blockers
            </h3>
            <div className="max-h-[220px] space-y-2 overflow-y-auto pr-1 custom-scrollbar">
              {(data.blockers || []).length === 0 ? (
                <p className="text-xs text-slate-500">No major blockers detected.</p>
              ) : (
                data.blockers.map((blocker) => (
                  <div key={blocker} className="rounded-lg border border-red-400/10 bg-red-400/[0.03] p-3 transition-colors hover:bg-red-400/[0.06]">
                    <p className="text-xs font-medium leading-5 text-red-200">{blocker}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section id="insights" className="scroll-mt-24 rounded-lg border border-white/[0.08] bg-[#0c1017] p-5">
            <h3 className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">
              <TrendingUp size={16} /> Predictive Insights
            </h3>
            <div className="max-h-[260px] space-y-2 overflow-y-auto pr-1 custom-scrollbar">
              {(data.predictiveInsights || []).length === 0 ? (
                <p className="text-xs text-slate-500">Veda needs more learning data for predictions.</p>
              ) : (
                data.predictiveInsights.map((insight) => (
                  <div key={insight} className="rounded-lg border border-cyan-400/10 bg-cyan-400/[0.03] p-3 transition-colors hover:bg-cyan-400/[0.06]">
                    <p className="text-xs font-medium leading-5 text-cyan-100">{insight}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function SummaryTile({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="bg-[#0b0f16] p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-2 truncate text-lg font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{helper}</p>
    </div>
  );
}

function JumpLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-bold text-slate-400 transition hover:bg-white/[0.06] hover:text-white">
      {label}
      <ChevronDown size={12} />
    </a>
  );
}

function SectionHeading({ icon, title, subtitle, tone }: { icon: ReactNode; title: string; subtitle: string; tone: "cyan" | "brand" }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn("rounded-lg border p-2", tone === "cyan" ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-400" : "border-brand/20 bg-brand/10 text-brand")}>
        {icon}
      </div>
      <div>
        <h2 className="text-lg font-black tracking-tight text-white">{title}</h2>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  const colorMap: Record<string, string> = {
    Strong: "text-emerald-400 bg-emerald-400/10",
    Medium: "text-amber-400 bg-amber-400/10",
    Weak: "text-red-400 bg-red-400/10"
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{label}</span>
      <span className={cn("rounded-md px-2 py-0.5 text-[9px] font-black uppercase", colorMap[value] || "bg-white/5 text-slate-400")}>{value}</span>
    </div>
  );
}
