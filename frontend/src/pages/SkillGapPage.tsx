import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { skillsApi } from "../features/skills/api";
import { type SkillGapItem } from "../features/skills/types";

/** Returns Tailwind classes for skill status pills. */
function getStatusClasses(status: SkillGapItem["status"]) {
  if (status === "strong") {
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
  }

  if (status === "partial") {
    return "border-amber-400/30 bg-amber-400/10 text-amber-200";
  }

  return "border-red-400/30 bg-red-400/10 text-red-200";
}

/** Returns a readable label for the embedding provider. */
function getProviderLabel(provider: "huggingface" | "local-fallback") {
  return provider === "huggingface" ? "HuggingFace embeddings" : "Local fallback matching";
}

/** Shows role readiness and missing skills as visual progress bars. */
export function SkillGapPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["skill-gap"],
    queryFn: skillsApi.getGapAnalysis
  });

  if (isLoading) {
    return <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-slate-300">Analyzing your skill gap...</div>;
  }

  if (error || !data) {
    return (
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.38em] text-cyan">Skill gap</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">Complete onboarding first.</h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400">
          Add your target role and current skills before running the analyzer.
        </p>
        <Link to="/onboarding" className="mt-6 inline-flex rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white">
          Go to onboarding
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-glow">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.38em] text-cyan">Skill gap analyzer</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">{data.targetRole}</h1>
            <p className="mt-3 text-sm text-slate-400">{getProviderLabel(data.provider)} used for semantic matching.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/25 px-8 py-6 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Readiness</p>
            <p className="mt-2 text-5xl font-semibold text-white">{data.overallScore}%</p>
          </div>
        </div>

        <div className="mt-8 h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand to-cyan transition-all"
            style={{ width: `${data.overallScore}%` }}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-white/10 bg-panel p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Required skills</h2>
              <p className="mt-1 text-sm text-slate-500">Sorted by urgency.</p>
            </div>
            <Link to="/onboarding" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 hover:text-white">
              Edit skills
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {data.gaps.map((gap) => (
              <article key={gap.skill} className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">{gap.skill}</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {gap.category}
                      {gap.matchedUserSkill ? ` - matched with ${gap.matchedUserSkill}` : ""}
                    </p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(gap.status)}`}>{gap.status}</span>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand to-blue-500"
                    style={{ width: `${gap.userScore}%` }}
                  />
                </div>

                <div className="mt-3 flex justify-between text-xs text-slate-500">
                  <span>User score {gap.userScore}%</span>
                  <span>Gap {gap.gapScore}%</span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-lg font-semibold text-white">Study next</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {(data.recommendations.nextSkills.length > 0 ? data.recommendations.nextSkills : data.gaps.slice(0, 3).map((gap) => gap.skill)).map(
                (skill) => (
                  <span key={skill} className="rounded-full border border-brand/30 bg-brand/15 px-3 py-2 text-sm text-slate-100">
                    {skill}
                  </span>
                )
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-lg font-semibold text-white">Your skills</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {data.currentSkills.map((skill) => (
                <span key={skill} className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-300">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
