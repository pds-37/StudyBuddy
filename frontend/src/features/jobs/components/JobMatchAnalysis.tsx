import React from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, AlertCircle, Rocket, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import { cn } from "../../../lib/utils/cn";

interface JobMatchAnalysisProps {
  isOpen: boolean;
  onClose: () => void;
  job: any;
  matchScore: number;
}

export function JobMatchAnalysis({ isOpen, onClose, job, matchScore }: JobMatchAnalysisProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <Motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />

        <Motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-obsidian border border-white/[0.06] rounded-[40px] shadow-2xl overflow-hidden"
        >
          {/* HEADER */}
          <div className="p-8 border-b border-white/[0.04] flex items-center justify-between bg-gradient-to-r from-brand/5 to-transparent">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-brand" />
                <span className="text-[10px] font-bold text-brand uppercase tracking-widest">Readiness Analysis</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{job.title}</h2>
              <p className="text-xs text-slate-500 font-medium">{job.company} • {job.location}</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {/* MATCH SCORE HERO */}
            <div className="flex items-center gap-8 p-8 rounded-3xl bg-slate-50 dark:bg-white/[0.02] border border-white/[0.04]">
              <div className="relative w-24 h-24 flex items-center justify-center">
                 <svg className="w-full h-full -rotate-90">
                   <circle cx="48" cy="48" r="44" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-white/5" />
                   <Motion.circle 
                     cx="48" cy="48" r="44" fill="none" stroke="currentColor" strokeWidth="8" 
                     strokeDasharray={276}
                     initial={{ strokeDashoffset: 276 }}
                     animate={{ strokeDashoffset: 276 - (276 * matchScore) / 100 }}
                     className="text-brand" 
                   />
                 </svg>
                 <span className="absolute text-xl font-bold">{matchScore}%</span>
              </div>
              <div>
                <h4 className="text-lg font-bold mb-1">Match Potential</h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {matchScore > 80 
                    ? "You are highly qualified for this role. Your roadmap completion and project depth align perfectly."
                    : matchScore > 50 
                    ? "You have the core skills, but a few critical gaps remain in your execution profile."
                    : "This role currently exceeds your technical readiness. Focus on the preparation path below."}
                </p>
              </div>
            </div>

            {/* STRENGTHS & WEAKNESSES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h5 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Strength Areas
                </h5>
                <div className="space-y-2">
                  {job.requiredSkills.slice(0, 3).map((skill: string) => (
                    <div key={skill} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {skill}
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h5 className="text-[10px] font-bold text-rose-400 uppercase tracking-widest flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Readiness Gaps
                </h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 font-medium opacity-60">
                    <Circle className="w-1.5 h-1.5" /> System Design Fundamentals
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 font-medium opacity-60">
                    <Circle className="w-1.5 h-1.5" /> Backend Integration Depth
                  </div>
                </div>
              </div>
            </div>

            {/* PREPARATION PATHWAY (GAP-TO-JOB) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Personalized Preparation Pathway</h5>
                <span className="text-[10px] font-bold text-brand uppercase tracking-widest">~3 Weeks Est.</span>
              </div>
              <div className="space-y-3">
                {[
                  "Build a production-grade Dashboard with real-time state",
                  "Master advanced React patterns (HOCs, Compound Components)",
                  "Complete 2 Mock Interviews focused on UI Engineering"
                ].map((step, i) => (
                  <div key={i} className="group p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between hover:bg-brand/5 hover:border-brand/20 transition-all">
                    <span className="text-sm font-medium">{step}</span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-brand transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="p-8 border-t border-white/[0.04] bg-slate-50 dark:bg-white/[0.01] flex gap-4">
            <button className="flex-1 py-4 rounded-2xl bg-brand text-slate-900 dark:text-white text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:shadow-brand/20 transition-all">
              <Rocket className="w-4 h-4" /> Apply Now
            </button>
            <button className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-900 dark:text-white text-[11px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
              Add to Prep Roadmap
            </button>
          </div>
        </Motion.div>
      </div>
    </AnimatePresence>
  );
}
