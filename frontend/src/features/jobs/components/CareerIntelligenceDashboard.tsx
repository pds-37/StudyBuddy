import React, { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import { Briefcase, Target, Zap, ShieldCheck, ArrowRight, BarChart3, Star, Clock, MapPin, ExternalLink } from "lucide-react";
import { cn } from "../../../lib/utils/cn";
import { getRecommendations, getReadiness, type CareerRecommendation, type ReadinessProfile } from "../../../lib/api/jobs";
import { JobMatchAnalysis } from "./JobMatchAnalysis";

export function CareerIntelligenceDashboard() {
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [readiness, setReadiness] = useState<ReadinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [recData, readData] = await Promise.all([
          getRecommendations(),
          getReadiness()
        ]);
        setRecommendations(recData);
        setReadiness(readData);
      } catch (error) {
        console.error("Failed to load career data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Analyzing Opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* ─── HEADER & READINESS OVERVIEW ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        <div className="space-y-6">
          <div className="p-8 rounded-[32px] border border-white/[0.06] bg-transparent bg-obsidian relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-full bg-gradient-to-l from-brand/5 to-transparent pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-brand" />
                <span className="text-[10px] font-bold text-brand uppercase tracking-[0.3em]">Career Intelligence</span>
              </div>
              <h1 className="text-3xl font-bold text-white text-white tracking-tight mb-4">Opportunity Scout</h1>
              <p className="text-sm text-slate-500 max-w-md leading-relaxed">
                Veda has analyzed your roadmap progress and execution depth. 
                Focus on these high-probability opportunities that match your current trajectory.
              </p>
            </div>
          </div>

          {/* READINESS GRIDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(readiness?.readiness || {}).map(([key, value]) => (
              <div key={key} className="p-6 rounded-3xl border border-white/[0.06] bg-transparent bg-obsidian/50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{key} Readiness</span>
                  <span className="text-xs font-bold text-brand">{value}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 bg-white/5 rounded-full overflow-hidden">
                  <Motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    className="h-full bg-brand shadow-[0_0_12px_rgba(244,63,94,0.4)]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SIDEBAR: CAREER STRATEGY */}
        <div className="p-8 rounded-[32px] border border-white/[0.06] bg-brand text-white text-white relative overflow-hidden">
           <Zap className="absolute -top-4 -right-4 w-32 h-32 text-white/10 rotate-12" />
           <div className="relative z-10">
             <h3 className="text-lg font-bold mb-4">Career Strategist</h3>
             <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
                   <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2">Next Milestone</p>
                   <p className="text-xs font-medium">Complete the "Advanced Systems" module to unlock 14 more high-tier internships.</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
                   <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2">Confidence Level</p>
                   <p className="text-xs font-medium">You are technically ready for Frontend roles, but interview confidence is still at 41%.</p>
                </div>
             </div>
             <button className="w-full py-4 mt-6 rounded-2xl bg-slate-900 bg-transparent text-white text-white text-[11px] font-bold uppercase tracking-widest shadow-xl">
                Start Mock Interview
             </button>
           </div>
        </div>
      </div>

      {/* ─── RECOMMENDED OPPORTUNITIES ─── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-slate-400" />
            <h2 className="text-xl font-bold text-white text-white tracking-tight">Curated Opportunities</h2>
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Based on Match Score</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {recommendations.map((rec, idx) => (
            <Motion.div
              key={rec.job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group p-6 rounded-[32px] border border-white/[0.06] bg-transparent bg-obsidian hover:border-brand/30 transition-all cursor-pointer relative"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-transparent bg-white/5 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                    <Star className="w-6 h-6 text-brand" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white text-white group-hover:text-brand transition-colors">{rec.job.title}</h4>
                    <p className="text-xs text-slate-500 font-medium">{rec.job.company}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-[10px] font-bold text-brand uppercase tracking-widest">
                    {rec.matchScore}% Match
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{rec.job.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{rec.job.type}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {rec.job.requiredSkills.slice(0, 3).map(skill => (
                  <span key={skill} className="px-2 py-1 rounded-lg bg-transparent bg-white/5 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-white/[0.04]">
                <div className="flex items-center gap-2">
                   <ShieldCheck className="w-4 h-4 text-emerald-400" />
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Readiness Verified</span>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedJob(rec);
                    setIsAnalysisOpen(true);
                  }}
                  className="flex items-center gap-2 text-[10px] font-bold text-brand uppercase tracking-[0.2em] group/btn"
                >
                  Analyze Fit <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </Motion.div>
          ))}
        </div>
      </div>

      <JobMatchAnalysis 
        isOpen={isAnalysisOpen}
        onClose={() => setIsAnalysisOpen(false)}
        job={selectedJob?.job || {}}
        matchScore={selectedJob?.matchScore || 0}
      />
    </div>
  );
}
