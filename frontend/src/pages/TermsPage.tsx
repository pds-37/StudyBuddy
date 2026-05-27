import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Scale, AlertOctagon, Terminal, HelpCircle, CheckCircle2 } from "lucide-react";

export function TermsPage() {
  return (
    <main className="min-h-screen bg-[#000000] px-6 py-16 text-slate-100 selection:bg-brand/35 selection:text-white">
      {/* Background Glowing Effects */}
      <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-accent/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 h-[500px] w-[500px] rounded-full bg-brand/5 blur-[150px] pointer-events-none" />

      <section className="mx-auto max-w-4xl relative z-10">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-all group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>

        <div className="mt-12 max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-accent-light">
            <Scale size={14} className="animate-pulse" />
            Terms of Service
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl font-display bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
            Terms of Service
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-400">
            Welcome to the AI Cognitive Career Operating System. By accessing StudyBuddy, you agree to these fair usage and service guidelines.
          </p>
          <p className="mt-2 text-xs font-mono text-slate-500">Last updated: May 27, 2026</p>
        </div>

        {/* Core Warning Box */}
        <div className="mt-12 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 backdrop-blur-xl shadow-premium">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 font-display">
            <AlertOctagon size={18} className="text-amber-500" />
            Fair Use Commitment
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            StudyBuddy provides high-performance AI roadmap, notes retrieval, and interview intelligence. You agree not to abuse or exploit our APIs through automated scraping, denial of service attacks, or malicious load distribution.
          </p>
        </div>

        {/* Terms Sections */}
        <div className="mt-14 space-y-12">
          {/* Section 1 */}
          <section className="grid gap-6 md:grid-cols-3 border-t border-white/[0.06] pt-10">
            <div className="md:col-span-1">
              <h3 className="text-xl font-bold font-display text-white flex items-center gap-2">
                <BookOpen size={18} className="text-brand-light" />
                1. User Account & Sync
              </h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Rules governing cloud accounts and sync clients.
              </p>
            </div>
            <div className="md:col-span-2 space-y-4 text-sm text-slate-300 leading-relaxed">
              <p>
                To utilize the monorepo sync features, you must maintain a valid, authenticated user profile.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-brand mt-0.5 shrink-0" />
                  <span><strong>Eligibility:</strong> You must be at least 13 years of age to construct a profile.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-brand mt-0.5 shrink-0" />
                  <span><strong>CLI Agent Responsibilities:</strong> The C++17 sync agent compiles on your system. You are responsible for preserving your local backups and API credentials.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section className="grid gap-6 md:grid-cols-3 border-t border-white/[0.06] pt-10">
            <div className="md:col-span-1">
              <h3 className="text-xl font-bold font-display text-white flex items-center gap-2">
                <Terminal size={18} className="text-accent-light" />
                2. Veda AI Fair Usage
              </h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Tokens, API quota limits, and AI safety.
              </p>
            </div>
            <div className="md:col-span-2 space-y-4 text-sm text-slate-300 leading-relaxed">
              <p>
                To ensure extremely low latency for all self-learners, StudyBuddy enforces soft rate-limiting:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-accent mt-0.5 shrink-0" />
                  <span><strong>AI Mentorship:</strong> LLM interactions are mapped by subscription tiers. Free tiers receive sufficient quotas for normal learning schedules.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-accent mt-0.5 shrink-0" />
                  <span><strong>Content Restrictions:</strong> Generated code, notes, and roadmaps must not violate global safety standards.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="grid gap-6 md:grid-cols-3 border-t border-white/[0.06] pt-10">
            <div className="md:col-span-1">
              <h3 className="text-xl font-bold font-display text-white flex items-center gap-2">
                <HelpCircle size={18} className="text-brand-light" />
                3. Intellectual Property
              </h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Ownership of notes, code, and curriculum.
              </p>
            </div>
            <div className="md:col-span-2 space-y-4 text-sm text-slate-300 leading-relaxed">
              <p>
                Ownership and reuse standards:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-brand mt-0.5 shrink-0" />
                  <span><strong>Your Notes:</strong> Everything uploaded, typed, or mapped using StudyBuddy belongs 100% to you. We claim no intellectual property rights.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-brand mt-0.5 shrink-0" />
                  <span><strong>Roadmaps and Platform Code:</strong> StudyBuddy logo assets, CSS layout parameters, and proprietary Veda heuristics belong to StudyBuddy AI.</span>
                </li>
              </ul>
            </div>
          </section>
        </div>

        {/* Footer info link */}
        <div className="mt-16 border-t border-white/[0.08] pt-8 text-center text-xs text-slate-500">
          <p>© 2026 StudyBuddy. All rights reserved. For queries regarding these terms, mail us at <a href="mailto:support@studybuddy.ai" className="text-brand-light hover:underline">support@studybuddy.ai</a>.</p>
        </div>
      </section>
    </main>
  );
}
