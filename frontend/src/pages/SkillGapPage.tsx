import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { 
  Target, 
  Brain, 
  TrendingUp, 
  ShieldAlert, 
  Briefcase, 
  Clock, 
  ArrowRight,
  Zap,
  Activity,
  Loader2
} from "lucide-react";
import { skillsApi } from "../features/skills/api";
import { NebulaBackground } from "../components/common/NebulaBackground";
import { SkillMatrixCard, ReadinessRing } from "../features/skills/components/IntelligenceComponents";
import { type SkillGapAnalysis } from "../features/skills/types";
import { cn } from "../lib/utils/cn";
import { adoptMentorStrategy } from "../lib/api/mentor";
import { logBehavior } from "../lib/api/behavior";
import { getApiErrorMessage } from "../lib/api/error";


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
      <div className="flex flex-col items-center justify-center h-full">
         <div className="w-16 h-16 rounded-full border-4 border-brand/20 border-t-brand animate-spin mb-4" />
         <p className="text-xs font-black text-slate-500 uppercase tracking-widest animate-pulse">Running AI Career Intelligence...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-full relative z-10 px-8 text-center">
         <NebulaBackground opacity={0.3} />
         <div className="w-24 h-24 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand mb-8 shadow-[0_0_50px_rgba(124,92,255,0.2)]">
            <Target size={40} />
         </div>
         <h1 className="text-4xl font-black text-slate-900 dark:text-slate-900 dark:text-white mb-4 tracking-tight">Set Your Trajectory</h1>
         <p className="text-slate-500 dark:text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto mb-8 leading-relaxed">
            Complete onboarding to define your target role. Veda will track your readiness and build an adaptive learning path tailored to your goals.
         </p>
         <Link to="/onboarding" className="px-10 py-5 rounded-2xl bg-brand text-slate-900 dark:text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest shadow-[0_20px_40px_rgba(124,92,255,0.3)] hover:scale-105 transition-all">
            Configure Career Profile
         </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full relative pb-20">
      <NebulaBackground opacity={0.1} showGrid={false} />

      {/* ─── HERO HEADER: CAREER STATUS ─── */}
      <Motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 mb-10"
      >
        <div className="rounded-[3rem] p-10 bg-gradient-to-br from-white/[0.05] to-transparent border border-white/[0.08] relative overflow-hidden group">
           {/* Decorative Elements */}
           <div className="absolute top-0 right-0 w-96 h-96 -mr-48 -mt-48 pointer-events-none rounded-full" style={{ background: 'radial-gradient(circle, rgba(124,92,255,0.15) 0%, transparent 70%)' }} />
           <div className="absolute bottom-0 left-0 w-64 h-64 -ml-32 -mb-32 pointer-events-none rounded-full" style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)' }} />
           
           <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="flex-1 text-center lg:text-left">
                 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/10 border border-brand/20 text-[10px] font-black text-brand uppercase tracking-[0.2em] mb-6">
                    <Activity size={14} className="animate-pulse" /> AI Career Intelligence
                 </div>
                 <h1 className="text-5xl lg:text-6xl font-black text-slate-900 dark:text-slate-900 dark:text-white tracking-tighter mb-4 leading-none">
                   {data.targetRole}
                 </h1>
                 <p className="text-slate-500 dark:text-slate-500 dark:text-slate-400 text-lg font-medium max-w-2xl">
                    {data.careerTrajectory || "Veda is currently analyzing your behavior and learning patterns to predict your career trajectory."}
                 </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-8 bg-black/40 border border-white/5 p-8 rounded-[2.5rem]">
                 <ReadinessRing score={data.overallScore || 0} label="Readiness" />
                 <div className="hidden sm:block w-px h-24 bg-slate-100 dark:bg-slate-100 dark:bg-white/10" />
                 <div className="grid grid-cols-1 gap-5 min-w-[220px]">
                    <MiniMetric label="Learning Foundation" value={data.readiness?.learningFoundation || "Medium"} />
                    <MiniMetric label="Problem Solving" value={data.readiness?.problemSolving || "Medium"} />
                    <MiniMetric label="Interview Confidence" value={data.readiness?.interviewConfidence || "Low"} />
                 </div>
              </div>
           </div>
        </div>
      </Motion.header>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-10 relative z-10">
        {/* ─── MAIN CONTENT ─── */}
        <div className="space-y-12">
           
           {/* Market Alignment Section */}
           <section className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                 <div className="p-2 rounded-xl bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">
                    <Briefcase size={18} />
                 </div>
                 <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-slate-900 dark:text-white tracking-tight">Market Alignment Analysis</h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">How you stack up against real-world roles</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {(data.roleMatches || []).map((match, i) => (
                   <Motion.div 
                     key={i} 
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ delay: i * 0.1 }}
                     className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-brand/30 transition-all group"
                   >
                      <div className="flex items-center justify-between mb-4">
                         <span className="text-xl font-black text-slate-900 dark:text-slate-900 dark:text-white group-hover:text-brand transition-colors">{match.role}</span>
                         <div className="px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-xs font-black text-brand">
                            {match.matchPercentage}%
                         </div>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] mb-6">
                         <Clock size={12} className="text-cyan-400" /> Est. Ready in {match.estimatedTimelineMonths} Months
                      </div>
                      <div className="space-y-3">
                         <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Critical Gaps</p>
                         <div className="flex flex-wrap gap-2">
                            {match.blockers.map(b => (
                               <span key={b} className="px-3 py-1.5 rounded-xl bg-red-400/5 text-red-400 text-[10px] font-bold border border-red-400/10">{b}</span>
                            ))}
                         </div>
                      </div>
                   </Motion.div>
                 ))}
              </div>
           </section>

           {/* Technical Mastery Matrix */}
           <section className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                 <div className="p-2 rounded-xl bg-purple-400/10 text-purple-400 border border-purple-400/20">
                    <Brain size={18} />
                 </div>
                 <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-slate-900 dark:text-white tracking-tight">Technical Mastery Matrix</h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Multi-dimensional skill intelligence</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {(data.gaps || []).map((gap, i) => (
                   <SkillMatrixCard key={gap.skill} gap={gap} />
                 ))}
              </div>
           </section>

        </div>

        {/* ─── SIDEBAR: AI MENTOR PANELS ─── */}
        <aside className="space-y-8">
           
           {/* Recovery Plan - High Priority */}
           {data.recommendations?.recoveryPlan && (
             <section className="p-8 rounded-[3rem] bg-gradient-to-br from-brand/20 to-brand/5 border border-brand/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 pointer-events-none rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)' }} />
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2 relative z-10">
                   <Zap size={18} className="text-brand fill-brand" /> Recovery Strategy
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-700 dark:text-slate-300 leading-relaxed mb-8 relative z-10 font-medium">
                   {data.recommendations.recoveryPlan}
                </p>
                <button
                  type="button"
                  onClick={() => adoptStrategy.mutate(data)}
                  disabled={adoptStrategy.isPending}
                  className="w-full py-4 rounded-2xl bg-brand text-slate-900 dark:text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest shadow-[0_15px_30px_rgba(124,92,255,0.4)] relative z-10 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:cursor-wait disabled:opacity-70"
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

           {/* Blockers Panel */}
           <section className="p-8 rounded-[3rem] bg-white/[0.02] border border-white/[0.06]">
              <h3 className="text-[10px] font-black text-red-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                 <ShieldAlert size={16} /> Critical Blockers
              </h3>
              <div className="space-y-4">
                 {(data.blockers || []).map((blocker, i) => (
                   <div key={i} className="group p-5 rounded-2xl bg-red-400/[0.03] border border-red-400/10 hover:bg-red-400/[0.06] transition-all">
                      <p className="text-[11px] font-medium text-red-200 leading-relaxed">
                         {blocker}
                      </p>
                   </div>
                 ))}
              </div>
           </section>

           {/* Predictive Insights Panel */}
           <section className="p-8 rounded-[3rem] bg-white/[0.02] border border-white/[0.06]">
              <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                 <TrendingUp size={16} /> Predictive Insights
              </h3>
              <div className="space-y-4">
                 {(data.predictiveInsights || []).map((insight, i) => (
                   <div key={i} className="p-5 rounded-2xl bg-cyan-400/[0.03] border border-cyan-400/10 hover:bg-cyan-400/[0.06] transition-all">
                      <p className="text-[11px] font-medium text-cyan-100 leading-relaxed">
                         {insight}
                      </p>
                   </div>
                 ))}
              </div>
           </section>

        </aside>
      </div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string, value: string }) {
  const colorMap: Record<string, string> = {
    "Strong": "text-emerald-400 bg-emerald-400/10",
    "Medium": "text-amber-400 bg-amber-400/10",
    "Weak": "text-red-400 bg-red-400/10",
  };
  
  return (
    <div className="flex items-center justify-between gap-4">
       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
       <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-black uppercase", colorMap[value] || "text-slate-500 dark:text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-50 dark:bg-white/5")}>
          {value}
       </span>
    </div>
  );
}
