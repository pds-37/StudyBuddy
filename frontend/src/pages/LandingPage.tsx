import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Command,
  FileText,
  MessageSquare,
  Route,
  Sparkles,
  Target,
  type LucideIcon
} from "lucide-react";
import { useAppStore } from "../store/app-store";

type Feature = {
  title: string;
  description: string;
  detail: string;
  icon: LucideIcon;
};

const features: Feature[] = [
  {
    title: "Skill gap",
    description: "Know the next few skills that matter.",
    detail: "Profile -> gap",
    icon: Target
  },
  {
    title: "Roadmap",
    description: "Turn your target role into weekly focus.",
    detail: "Gap -> plan",
    icon: Route
  },
  {
    title: "Memory",
    description: "Keep notes, jobs, and chats in one context.",
    detail: "Notes -> copilot",
    icon: FileText
  }
];

const planItems = [
  "Finish profile",
  "Review skill gaps",
  "Pick this week's milestone"
] as const;

const workspaceStats = [
  { value: "01", label: "career profile" },
  { value: "06", label: "work surfaces" },
  { value: "24/7", label: "copilot context" }
] as const;

const workflow = [
  { title: "Set direction", text: "Choose the role and add the skills you already have.", icon: Target },
  { title: "Build the plan", text: "StudyBuddy converts the gap into practical milestones.", icon: Route },
  { title: "Stay in flow", text: "Use notes, jobs, and copilot without losing context.", icon: MessageSquare }
] as const;

/** Renders a minimal dark landing page with a premium workspace preview. */
export function LandingPage() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const primaryAction = isAuthenticated
    ? { label: "Open dashboard", to: "/dashboard" }
    : { label: "Start free", to: "/auth" };

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#030507] text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] opacity-55" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_72%_18%,rgba(56,189,248,0.18),transparent_25rem),radial-gradient(circle_at_16%_20%,rgba(37,99,235,0.12),transparent_24rem),linear-gradient(180deg,rgba(3,5,7,0)_0%,#030507_82%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 bg-gradient-to-b from-white/[0.06] to-transparent" />

      <section className="mx-auto grid min-h-[calc(100vh-84px)] max-w-7xl gap-12 px-6 pb-16 pt-20 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:pb-24 lg:pt-24">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-3 rounded-full border border-sky-300/20 bg-white/[0.06] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.32em] text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-300 shadow-[0_0_20px_rgba(125,211,252,0.9)]" />
            AI study workspace
          </div>

          <h1 className="mt-8 max-w-4xl font-display text-5xl font-black leading-[0.95] tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl">
            Plan your next move with less noise.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-slate-400 sm:text-lg">
            StudyBuddy keeps skill gaps, roadmaps, jobs, notes, and AI guidance inside one calm career workspace.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              to={primaryAction.to}
              className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-sky-300 to-blue-500 px-6 py-3.5 text-sm font-bold text-white shadow-[0_18px_60px_rgba(56,189,248,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_70px_rgba(59,130,246,0.36)]"
            >
              {primaryAction.label}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#workflow"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-5 py-3.5 text-sm text-slate-300 transition hover:border-white/20 hover:text-white"
            >
              See workflow
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-4 py-2 text-xs text-slate-400">
              <Command className="h-3.5 w-3.5 text-sky-300" />
              Cmd/Ctrl + K ready
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-4 py-2 text-xs text-slate-400">
              <Sparkles className="h-3.5 w-3.5 text-sky-300" />
              Personalized by profile
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-8 rounded-[3rem] bg-sky-400/[0.08] blur-3xl" />
          <div className="absolute -right-8 top-10 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="relative overflow-hidden rounded-[2.25rem] border border-white/15 bg-white/[0.065] shadow-[0_36px_140px_rgba(0,0,0,0.52),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.12),transparent_18rem),linear-gradient(135deg,rgba(56,189,248,0.08),transparent_42%)]" />
            <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff6159]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#ffc34d]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#49d17d]" />
              </div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-slate-500">Career OS</p>
            </div>

            <div className="relative grid gap-5 p-5 md:grid-cols-[1.05fr_0.95fr] md:p-6">
              <div className="rounded-[1.6rem] border border-white/15 bg-black/20 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-slate-500">Current focus</p>
                    <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">Frontend role prep</h2>
                  </div>
                  <div className="grid h-11 w-11 place-items-center rounded-2xl border border-sky-300/15 bg-sky-400/10 text-sky-300">
                    <Target className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-8">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Roadmap readiness</span>
                    <span className="text-slate-300">78%</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
                    <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-sky-300 to-blue-500 shadow-[0_0_26px_rgba(56,189,248,0.42)]" />
                  </div>
                </div>

                <div className="mt-7 space-y-3">
                  {planItems.map((item, index) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-white/[0.045] font-mono text-[10px] text-slate-400">
                        0{index + 1}
                      </span>
                      <span className="text-sm text-slate-300">{item}</span>
                      <CheckCircle2 className="ml-auto h-4 w-4 text-sky-300" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-5">
                <div className="rounded-[1.6rem] border border-white/15 bg-black/20 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-slate-500">Signals</p>
                  <div className="mt-5 grid grid-cols-3 gap-3">
                    {workspaceStats.map((item) => (
                      <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.055] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                        <p className="font-display text-2xl font-black tracking-tight text-white">{item.value}</p>
                        <p className="mt-2 text-[10px] leading-4 text-slate-500">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.6rem] border border-sky-300/20 bg-sky-400/[0.07] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl border border-sky-300/15 bg-sky-300/10 text-sky-300">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Copilot hint</p>
                      <p className="mt-1 text-xs text-slate-500">Use your notes before applying.</p>
                    </div>
                  </div>
                  <p className="mt-5 text-sm leading-7 text-slate-400">
                    "You are close. Add one project proof point, then apply to the saved roles."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl scroll-mt-28 px-6 py-10">
        <div className="grid gap-3 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="group rounded-[1.75rem] border border-white/15 bg-white/[0.055] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-sky-300/25 hover:bg-white/[0.075]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl border border-sky-300/15 bg-sky-400/10 text-sky-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-600">{feature.detail}</span>
                </div>
                <h2 className="mt-8 text-xl font-semibold tracking-tight text-white">{feature.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="workflow" className="mx-auto grid max-w-7xl scroll-mt-28 gap-10 px-6 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-sky-300">Simple loop</p>
          <h2 className="mt-5 max-w-md font-display text-4xl font-black leading-tight tracking-[-0.04em] text-white md:text-5xl">
            One calm path from learning to applying.
          </h2>
        </div>

        <div className="space-y-3">
          {workflow.map((item, index) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="grid gap-5 rounded-[1.5rem] border border-white/15 bg-white/[0.05] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl sm:grid-cols-[56px_1fr_auto] sm:items-center">
                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-sky-300/15 bg-sky-400/10 text-sky-300">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-semibold tracking-tight text-white">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">{item.text}</p>
                </div>
                <span className="font-mono text-xs text-slate-600">0{index + 1}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section id="start" className="mx-auto max-w-7xl scroll-mt-28 px-6 pb-24 pt-6">
        <div className="overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.06] p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-slate-500">Ready when you are</p>
              <h2 className="mt-4 max-w-2xl text-3xl font-black tracking-[-0.04em] text-white md:text-5xl">
                Start with one profile. Let the workspace organize the rest.
              </h2>
            </div>

            <Link
              to={primaryAction.to}
              className="inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-sky-300 to-blue-500 px-6 py-3.5 text-sm font-bold text-white shadow-[0_18px_60px_rgba(56,189,248,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_70px_rgba(59,130,246,0.34)]"
            >
              {primaryAction.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <footer className="mt-10 flex flex-col gap-4 border-t border-white/8 pt-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>StudyBuddy. Focused career prep.</p>
          <div className="flex flex-wrap items-center gap-4">
            <a href="#features" className="transition hover:text-white">
              Product
            </a>
            <a href="#workflow" className="transition hover:text-white">
              Workflow
            </a>
            <Link to={isAuthenticated ? "/dashboard" : "/auth"} className="transition hover:text-white">
              {isAuthenticated ? "Dashboard" : "Sign in"}
            </Link>
          </div>
        </footer>
      </section>
    </div>
  );
}
