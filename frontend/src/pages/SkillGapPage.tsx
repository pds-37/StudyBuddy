import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
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
  Activity
} from "lucide-react";
import { skillsApi } from "../features/skills/api";
import { NebulaBackground } from "../components/common/NebulaBackground";
import { SkillMatrixCard, ReadinessRing } from "../features/skills/components/IntelligenceComponents";
import { type SkillGapAnalysis } from "../features/skills/types";

export function SkillGapPage() {
  const { data, isLoading, error } = useQuery<SkillGapAnalysis>({
    queryKey: ["skill-gap"],
    queryFn: skillsApi.getGapAnalysis as any
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
         <div className="w-24 h-24 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand mb-8">
            <Target size={40} />
         </div>
         <h1 className="text-4xl font-black text-white mb-4">Set Your Trajectory</h1>
         <p className="text-slate-400 font-medium max-w-md mx-auto mb-8">
           Complete onboarding to define your target role. Veda will track your readiness and build an adaptive learning path.
         </p>
         <Link to="/onboarding" className="px-8 py-4 rounded-2xl bg-brand text-white font-black text-xs uppercase tracking-widest shadow-glow hover:scale-105 transition-transform">
            Configure Career Profile
         </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      <NebulaBackground opacity={0.15} showGrid={false} />

      {/* ─── TOP SECTION: CAREER READINESS ─── */}
      <header className="shrink-0 px-8 py-8 border-b border-white/[0.06] bg-obsidian/40 backdrop-blur-3xl z-20">
         <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-12">
            <div className="flex-1">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-[10px] font-black text-brand uppercase tracking-widest mb-4">
                  <Activity size={12} /> AI Career Intelligence
               </div>
               <h1 className="text-4xl font-black text-white tracking-tight mb-2">{data.targetRole}</h1>
               <p className="text-slate-400 font-medium">{data.careerTrajectory || "Analyzing trajectory..."}</p>
            </div>
            
            <div className="flex items-center gap-8 bg-white/[0.02] border border-white/5 p-6 rounded-[2.5rem]">
               <ReadinessRing score={data.overallScore || 0} label="Readiness" />
               <div className="w-px h-16 bg-white/10" />
               <div className="space-y-4 min-w-[200px]">
                  <MiniMetric label="Learning Foundation" value={data.readiness?.learningFoundation || "Medium"} />
                  <MiniMetric label="Problem Solving" value={data.readiness?.problemSolving || "Medium"} />
                  <MiniMetric label="Interview Confidence" value={data.readiness?.interviewConfidence || "Low"} />
               </div>
            </div>
         </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* ─── LEFT/CENTER PANEL: SKILL MATRIX & GAPS ─── */}
        <main className="flex-1 flex flex-col min-w-0 bg-ink/10 relative overflow-y-auto custom-scrollbar p-8">
           <div className="max-w-[1000px] mx-auto space-y-12">
              
              {/* Role Matching */}
              <section>
                 <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                    <Briefcase size={14} /> Role Matching Analysis
                 </h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(data.roleMatches || []).map((match, i) => (
                      <div key={i} className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                         <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-white">{match.role}</span>
                            <span className="text-brand font-black">{match.matchPercentage}%</span>
                         </div>
                         <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                            Est. Ready in {match.estimatedTimelineMonths} Months
                         </div>
                         <div className="flex gap-2">
                            {match.blockers.slice(0,2).map(b => (
                               <span key={b} className="px-2 py-1 rounded-lg bg-red-400/10 text-red-400 text-[9px] font-bold uppercase">{b}</span>
                            ))}
                         </div>
                      </div>
                    ))}
                 </div>
              </section>

              {/* Skill Matrix */}
              <section>
                 <div className="flex items-center justify-between mb-6">
                    <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                       <Brain size={14} /> AI Skill Intelligence Matrix
                    </h2>
                 </div>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {(data.gaps || []).map((gap, i) => (
                      <SkillMatrixCard key={gap.skill} gap={gap} />
                    ))}
                 </div>
              </section>

           </div>
        </main>

        {/* ─── RIGHT PANEL: MENTOR INSIGHTS ─── */}
        <aside className="w-96 shrink-0 border-l border-white/[0.06] bg-ink/20 backdrop-blur-3xl overflow-y-auto custom-scrollbar z-10 hidden xl:block">
           <div className="p-8 space-y-10">
              
              {/* Blockers */}
              <section>
                 <h3 className="text-[10px] font-black text-red-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                    <ShieldAlert size={14} /> Critical Blockers
                 </h3>
                 <div className="space-y-4">
                    {(data.blockers || []).map((blocker, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-red-400/5 border border-red-400/10 text-xs font-medium text-red-200 leading-relaxed">
                         {blocker}
                      </div>
                    ))}
                 </div>
              </section>

              {/* Predictive Insights */}
              <section>
                 <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                    <TrendingUp size={14} /> Predictive Insights
                 </h3>
                 <div className="space-y-4">
                    {(data.predictiveInsights || []).map((insight, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-cyan-400/5 border border-cyan-400/10 text-xs font-medium text-cyan-200 leading-relaxed">
                         {insight}
                      </div>
                    ))}
                 </div>
              </section>

              {/* Recovery Plan */}
              {data.recommendations?.recoveryPlan && (
                <section className="p-6 rounded-[2.5rem] bg-brand/10 border border-brand/20 relative overflow-hidden group">
                   <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                   <h3 className="text-xs font-black text-white uppercase tracking-widest mb-3 flex items-center gap-2 relative z-10">
                      <Zap size={14} className="text-brand" /> Recovery Plan
                   </h3>
                   <p className="text-[11px] text-slate-300 leading-relaxed mb-6 relative z-10">
                      {data.recommendations.recoveryPlan}
                   </p>
                   <button className="w-full py-3 rounded-2xl bg-brand text-white text-[10px] font-black uppercase tracking-widest shadow-glow relative z-10 flex items-center justify-center gap-2 hover:scale-105 transition-transform">
                      Adopt Strategy <ArrowRight size={14} />
                   </button>
                </section>
              )}

           </div>
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
       <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-black uppercase", colorMap[value] || "text-slate-400 bg-white/5")}>
          {value}
       </span>
    </div>
  );
}
