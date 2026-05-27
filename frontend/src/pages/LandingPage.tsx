import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  GraduationCap,
  Layers3,
  Play,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Zap
} from "lucide-react";
import { useAppStore } from "../store/app-store";
import { NebulaBackground } from "../components/common/NebulaBackground";

const stats = [
  { label: "Readiness lift", value: "+38%", tone: "text-emerald-300" },
  { label: "Weekly focus saved", value: "7.5h", tone: "text-cyan-300" },
  { label: "Proof points built", value: "124k", tone: "text-amber-200" }
];

const commandCenter = [
  { icon: Target, title: "DSA revision", meta: "High impact", status: "Today", color: "text-cyan-300" },
  { icon: FileText, title: "Resume proof", meta: "Backend project", status: "Next", color: "text-emerald-300" },
  { icon: BriefcaseBusiness, title: "Role shortlist", meta: "8 matched jobs", status: "Live", color: "text-amber-200" }
];

const modules = [
  {
    icon: BookOpenCheck,
    title: "Recall engine",
    text: "Notes become timed recall drills, weak-topic reviews, and interview prompts before they fade.",
    accent: "text-cyan-300",
    bg: "bg-cyan-400/10"
  },
  {
    icon: Layers3,
    title: "Execution roadmap",
    text: "Daily study, project, resume, and application work is ranked by what improves placement readiness.",
    accent: "text-indigo-300",
    bg: "bg-indigo-400/10"
  },
  {
    icon: Trophy,
    title: "Proof portfolio",
    text: "Completed work turns into project evidence and sharper resume bullets for the exact role.",
    accent: "text-amber-200",
    bg: "bg-amber-300/10"
  },
  {
    icon: ShieldCheck,
    title: "Interview signal",
    text: "Mock outcomes, missing concepts, and confidence signals keep the next prep session honest.",
    accent: "text-emerald-300",
    bg: "bg-emerald-400/10"
  }
];

const workflow = [
  "Choose a role and timeline",
  "Study from the ranked daily plan",
  "Convert progress into proof",
  "Apply with role-specific confidence"
];

const inclusions = [
  "Unlimited AI mentor sessions",
  "Memory-aware revision schedule",
  "Resume and project proof builder",
  "Company prep and job intelligence"
];

function ProductPreview() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A]/80 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500/80" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <span className="h-3 w-3 rounded-full bg-green-500/80" />
        </div>
        <div className="hidden rounded-md border border-white/5 bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 sm:block">
          StudyBuddy OS
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[0.9fr_1.2fr]">
        <aside className="border-b border-white/10 bg-white/[0.02] p-5 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-indigo-300/20 bg-indigo-400/10 text-indigo-200">
              <Zap size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Veda AI</p>
              <p className="text-xs text-slate-500">Placement intelligence online</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {commandCenter.map((item) => (
              <div key={item.title} className="rounded-lg border border-white/10 bg-black/25 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/[0.04] ${item.color}`}>
                      <item.icon size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.meta}</p>
                    </div>
                  </div>
                  <span className="rounded-md border border-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div className="p-5 sm:p-6">
          <div className="rounded-lg border border-indigo-300/20 bg-indigo-400/[0.07] p-5">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-200">Today</p>
                <h3 className="mt-3 max-w-sm text-2xl font-bold leading-tight text-white">
                  Finish graph revision, then ship one resume proof update.
                </h3>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-right">
                <p className="text-3xl font-black text-white">82%</p>
                <p className="text-xs text-slate-500">Role readiness</p>
              </div>
            </div>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
              <Motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-indigo-300 to-emerald-300"
                initial={{ width: "24%" }}
                animate={{ width: "82%" }}
                transition={{ duration: 1.1, delay: 0.3, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <p className={`text-2xl font-black ${stat.tone}`}>{stat.value}</p>
                <p className="mt-1 text-xs text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Live prep loop</p>
              <Clock3 size={16} className="text-slate-500" />
            </div>
            <div className="space-y-2">
              {["Revise DP patterns", "Tailor backend resume bullets", "Practice system design story"].map((task, index) => (
                <div key={task} className="flex items-center gap-3 rounded-md bg-white/[0.03] px-3 py-2">
                  <CheckCircle2 size={15} className={index === 0 ? "text-emerald-300" : "text-slate-600"} />
                  <span className="text-sm text-slate-300">{task}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const startPath = isAuthenticated ? "/dashboard" : "/auth";

  return (
    <div className="min-h-screen overflow-hidden bg-[#030303] text-slate-100 font-sans">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDQwIEwgNDAgNDAgNDAgMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)] opacity-50" />
      <div className="fixed inset-0 z-0 pointer-events-none">
        <NebulaBackground opacity={0.12} />
      </div>

      <main className="relative z-10">
        <section id="home" className="mx-auto grid min-h-[calc(100vh-64px)] w-full max-w-7xl items-center gap-12 px-4 pb-14 pt-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:pt-10">
          <Motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="mb-7 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold uppercase tracking-[0.22em] text-indigo-100">
              <Sparkles size={14} className="text-cyan-300" />
              Premium placement OS
            </div>
            <h1 className="text-5xl font-semibold leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
              StudyBuddy turns ambition into a daily placement plan.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300">
              A Swastha Parivar-style premium experience for technical students: calm, intelligent, evidence-led, and built around the work that actually moves readiness.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to={startPath}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3.5 text-sm font-black text-black transition hover:bg-cyan-100"
              >
                Start your plan
                <ArrowRight size={17} />
              </Link>
              <Link
                to="/demo"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/12 bg-white/[0.04] px-6 py-3.5 text-sm font-bold text-white transition hover:border-cyan-300/40 hover:bg-white/[0.08]"
              >
                <Play size={16} className="fill-current" />
                View recruiter demo
              </Link>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
                  <p className={`text-xl font-black ${stat.tone}`}>{stat.value}</p>
                  <p className="mt-1 text-[11px] leading-4 text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </Motion.div>

          <Motion.div
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            className="relative"
          >
            <ProductPreview />
          </Motion.div>
        </section>

        <section className="border-y border-white/10 bg-white/[0.025]">
          <div className="mx-auto grid max-w-7xl gap-5 px-4 py-7 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
            {["Personalized daily plan", "Recall and notes intelligence", "Resume proof loop", "Company-ready prep"].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm font-semibold text-slate-300">
                <BadgeCheck size={17} className="text-emerald-300" />
                {item}
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">Premium system</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              One command center for study, skill, career, and confidence.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {modules.map((module) => (
              <Motion.article
                key={module.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45 }}
                className="rounded-lg border border-white/10 bg-[#07090d]/85 p-5 transition hover:-translate-y-1 hover:border-white/20"
              >
                <div className={`mb-7 flex h-11 w-11 items-center justify-center rounded-lg ${module.bg} ${module.accent}`}>
                  <module.icon size={21} />
                </div>
                <h3 className="text-xl font-bold text-white">{module.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{module.text}</p>
              </Motion.article>
            ))}
          </div>
        </section>

        <section id="how-to-use" className="bg-[#05070b]">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[0.8fr_1fr] lg:px-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-300">Workflow</p>
              <h2 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
                The plan stays connected from first topic to final offer.
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-400">
                StudyBuddy keeps the premium feel focused on useful decisions: what to study, what to build, what to prove, and where to apply next.
              </p>
            </div>

            <div className="grid gap-3">
              {workflow.map((item, index) => (
                <Motion.div
                  key={item}
                  initial={{ opacity: 0, x: 18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-lg border border-white/10 bg-white/[0.035] p-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-sm font-black text-black">
                    {index + 1}
                  </div>
                  <p className="font-semibold text-white">{item}</p>
                  <ChevronRight size={18} className="text-slate-600" />
                </Motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid overflow-hidden rounded-lg border border-white/10 bg-[#07090d] lg:grid-cols-[1fr_0.8fr]">
            <div className="p-7 sm:p-10 lg:p-12">
              <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">
                <GraduationCap size={15} />
                Student premium
              </div>
              <h2 className="max-w-2xl text-4xl font-black tracking-tight text-white sm:text-5xl">
                Start free. Upgrade when the preparation gets serious.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-400">
                The landing page now sells the app as a complete career-prep workspace, not a collection of disconnected tools.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to={startPath} className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3.5 text-sm font-black text-black transition hover:bg-emerald-100">
                  Get started
                  <ArrowRight size={17} />
                </Link>
                <Link to="/pricing" className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/[0.06]">
                  Compare plans
                  <ChevronRight size={17} />
                </Link>
              </div>
            </div>

            <div className="border-t border-white/10 bg-white/[0.025] p-7 sm:p-10 lg:border-l lg:border-t-0">
              <p className="text-sm font-bold text-white">Included in Pro Student</p>
              <div className="mt-6 space-y-4">
                {inclusions.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle2 size={17} className="text-emerald-300" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-black px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <img src="/brand/studybuddy-logo.png" alt="StudyBuddy" className="h-9 w-auto object-contain" />
            <span className="text-sm font-semibold text-slate-500">AI mentor for placement-ready learners.</span>
          </div>
          <p className="text-xs text-slate-600">2026 StudyBuddy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
