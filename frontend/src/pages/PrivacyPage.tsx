import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Eye, Server, RefreshCw, CheckCircle2 } from "lucide-react";

export function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#000000] px-6 py-16 text-slate-100 selection:bg-brand/35 selection:text-white">
      {/* Background Glowing Effects */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-brand/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-accent/5 blur-[150px] pointer-events-none" />

      <section className="mx-auto max-w-4xl relative z-10">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-all group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>

        <div className="mt-12 max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-light">
            <Shield size={14} className="animate-pulse" />
            Security & Trust
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl font-display bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
            Privacy Policy
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-400">
            At StudyBuddy, we believe your cognitive data is sacred. Read how we protect your personal notes, roadmap progress, and career ambitions.
          </p>
          <p className="mt-2 text-xs font-mono text-slate-500">Last updated: May 27, 2026</p>
        </div>

        {/* Highlight Banner */}
        <div className="mt-12 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 backdrop-blur-xl shadow-premium">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 font-display">
            <Lock size={18} className="text-brand-light" />
            Our Core Privacy Philosophy
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            StudyBuddy operates on a **privacy-first** approach. We do not sell your personal notes, resume text, or study patterns. Any LLM inference done via Veda AI (using Groq, Google Gemini, or HuggingFace) is processed securely, and your notes remain strictly your intellectual property.
          </p>
        </div>

        {/* Content Sections */}
        <div className="mt-14 space-y-12">
          {/* Section 1 */}
          <section className="grid gap-6 md:grid-cols-3 border-t border-white/[0.06] pt-10">
            <div className="md:col-span-1">
              <h3 className="text-xl font-bold font-display text-white flex items-center gap-2">
                <Eye size={18} className="text-brand-light" />
                1. Data We Collect
              </h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Clear scope of what information enters our system.
              </p>
            </div>
            <div className="md:col-span-2 space-y-4 text-sm text-slate-300 leading-relaxed">
              <p>
                To provide your custom cognitive workspace, we collect information you explicitly share:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-brand mt-0.5 shrink-0" />
                  <span><strong>Account Info:</strong> Email address and profile information retrieved during Google Auth.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-brand mt-0.5 shrink-0" />
                  <span><strong>Personal Notes:</strong> Raw note content and sync tags used to build your active memory graph.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-brand mt-0.5 shrink-0" />
                  <span><strong>Study Analytics:</strong> Spaced repetition scores, streak durations, and roadmap completion signals.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-brand mt-0.5 shrink-0" />
                  <span><strong>Resume & Job Profiles:</strong> Uploaded resumes and job application tracking indicators for ATS analysis.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section className="grid gap-6 md:grid-cols-3 border-t border-white/[0.06] pt-10">
            <div className="md:col-span-1">
              <h3 className="text-xl font-bold font-display text-white flex items-center gap-2">
                <Server size={18} className="text-accent-light" />
                2. Data Processing & AI
              </h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                How Veda AI processes and computes your insights.
              </p>
            </div>
            <div className="md:col-span-2 space-y-4 text-sm text-slate-300 leading-relaxed">
              <p>
                StudyBuddy implements a sophisticated hybrid AI system:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-accent mt-0.5 shrink-0" />
                  <span><strong>Semantic Embeddings:</strong> Your notes are vectorized using local-first or secure HuggingFace embeddings.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-accent mt-0.5 shrink-0" />
                  <span><strong>Generative Roadmaps:</strong> Gemini API parses skill goals to render dynamic parallel roadmaps.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-accent mt-0.5 shrink-0" />
                  <span><strong>Zero-Retention Policy:</strong> We instruct our API models to avoid storing or utilizing your note payloads for training general models.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="grid gap-6 md:grid-cols-3 border-t border-white/[0.06] pt-10">
            <div className="md:col-span-1">
              <h3 className="text-xl font-bold font-display text-white flex items-center gap-2">
                <RefreshCw size={18} className="text-brand-light" />
                3. Synchronization
              </h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Offline-first C++ Agent operations.
              </p>
            </div>
            <div className="md:col-span-2 space-y-4 text-sm text-slate-300 leading-relaxed">
              <p>
                For power-users utilizing the **C++ Sync Agent**:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-brand mt-0.5 shrink-0" />
                  <span><strong>Secure Encryption:</strong> Local notes are synced to the cloud over standard HTTPS with valid JSON web tokens (JWT).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-brand mt-0.5 shrink-0" />
                  <span><strong>Full Control:</strong> You can completely clear synced cloud notes directly from your account settings interface.</span>
                </li>
              </ul>
            </div>
          </section>
        </div>

        {/* Footer info link */}
        <div className="mt-16 border-t border-white/[0.08] pt-8 text-center text-xs text-slate-500">
          <p>© 2026 StudyBuddy. All rights reserved. If you have questions, contact us at <a href="mailto:privacy@studybuddy.ai" className="text-brand-light hover:underline">privacy@studybuddy.ai</a>.</p>
        </div>
      </section>
    </main>
  );
}
