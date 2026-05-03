import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  BrainCircuit,
  Briefcase,
  CheckCircle2,
  CircleHelp,
  FileText,
  Github,
  GraduationCap,
  Linkedin,
  MessageCircle,
  Route,
  Sparkles,
  Target,
  TerminalSquare
} from "lucide-react";
import { useAppStore } from "../store/app-store";

const features = [
  {
    icon: Bell,
    title: "Daily mentor plan",
    text: "Skill gaps, recall, project work, and interview prep stay organized by priority."
  },
  {
    icon: BrainCircuit,
    title: "Context-aware AI",
    text: "Veda uses your notes, resume, roadmap, and goals to give advice that fits your path."
  },
  {
    icon: Route,
    title: "Roadmap continuity",
    text: "Notes become milestones, milestones become projects, and projects become proof."
  }
];

const workflow = [
  {
    title: "Sync your notes",
    text: "Use the local agent to bring Markdown notes and study material into your StudyBuddy workspace."
  },
  {
    title: "Choose a target role",
    text: "StudyBuddy compares your current evidence against the role you want and finds the gaps."
  },
  {
    title: "Follow the daily plan",
    text: "Work through recall, roadmap, project, and resume tasks without deciding from scratch."
  }
];

const trustItems = [
  "Built for tech careers",
  "Local-first note syncing",
  "AI mentor with memory",
  "Clear readiness signals"
];

export function LandingPage() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const startPath = isAuthenticated ? "/dashboard" : "/auth";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(21,140,131,0.14),transparent_25%),radial-gradient(circle_at_top_right,rgba(243,166,65,0.12),transparent_27%),linear-gradient(180deg,#f8fbfb_0%,#edf5f6_100%)] text-[#53656d]">
      <section id="workspace" className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-10 sm:px-6 lg:min-h-[calc(100vh-5rem)] lg:grid-cols-[1.05fr_0.95fr] lg:py-14">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#ddf6f2] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#0e6f69]">
            <Sparkles size={16} />
            Career prep, guided together
          </span>

          <h1 className="mt-6 max-w-3xl text-5xl font-bold leading-[1.03] tracking-normal text-[#102229] md:text-6xl">
            Build a career plan from the notes you already have.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#53656d]">
            StudyBuddy brings notes, recall, resumes, roadmaps, and AI guidance into one connected system that helps you stay organized and ready for your next role.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to={startPath}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#158c83] px-6 py-3.5 text-sm font-bold text-white shadow-[0_16px_36px_rgba(21,140,131,0.22)] transition hover:bg-[#0e6f69]"
            >
              Get started
              <ArrowRight size={18} />
            </Link>
            <a
              href="#tools"
              className="inline-flex items-center justify-center rounded-xl border border-[#d8e3e4] bg-white/70 px-6 py-3.5 text-sm font-bold text-[#102229] shadow-[0_10px_24px_rgba(32,53,61,0.08)] transition hover:bg-white"
            >
              Explore features
            </a>
          </div>

          <div className="mt-9 grid gap-4 sm:grid-cols-3">
            <Stat value="24/7" label="AI mentor support" />
            <Stat value="1 app" label="for notes, recall, and roadmaps" />
            <Stat value="Role-first" label="career context across every task" />
          </div>
        </div>

        <HeroVisual />
      </section>

      <section className="mx-auto flex max-w-7xl flex-wrap justify-center gap-4 px-5 pb-10 sm:px-6" aria-label="Trust bar">
        {trustItems.map((item) => (
          <span
            key={item}
            className="inline-flex min-h-14 items-center rounded-full border border-[#d8e3e4] bg-white/78 px-6 text-sm font-semibold text-[#53656d] shadow-[0_8px_20px_rgba(32,53,61,0.08)] backdrop-blur"
          >
            <span className="mr-3 h-2 w-2 rounded-full bg-[linear-gradient(135deg,#158c83,#f3a641)] shadow-[0_0_0_4px_rgba(21,140,131,0.12)]" />
            {item}
          </span>
        ))}
      </section>

      <section id="tools" className="mx-auto max-w-7xl px-5 py-14 sm:px-6">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-full border border-[#d8e3e4] bg-white/70 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#0e6f69]">
            Why it works
          </span>
          <h2 className="mt-5 text-4xl font-bold leading-tight text-[#102229]">Built for real career prep, not scattered advice.</h2>
          <p className="mt-4 text-base leading-7 text-[#53656d]">
            Every surface is designed to reduce friction, improve continuity, and make your next learning move easier to trust.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-3xl border border-[#e7eff0] bg-white p-6 shadow-[0_12px_28px_rgba(32,53,61,0.09)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(32,53,61,0.13)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ddf6f2] text-[#0e6f69]">
                <feature.icon size={21} />
              </div>
              <h3 className="mt-5 text-xl font-bold text-[#102229]">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#53656d]">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="workflow" className="mx-auto max-w-7xl px-5 py-14 sm:px-6">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-full border border-[#d8e3e4] bg-white/70 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#0e6f69]">
            How to use
          </span>
          <h2 className="mt-5 text-4xl font-bold leading-tight text-[#102229]">A simple study flow you can follow every day.</h2>
          <p className="mt-4 text-base leading-7 text-[#53656d]">
            StudyBuddy works best when your notes stay synced, your target role is clear, and the daily mentor plan drives execution.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {workflow.map((step, index) => (
            <article key={step.title} className="rounded-3xl border border-[#e7eff0] bg-white p-6 shadow-[0_12px_28px_rgba(32,53,61,0.09)]">
              <span className="inline-flex rounded-full bg-[#ddf6f2] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#0e6f69]">
                Step {index + 1}
              </span>
              <h3 className="mt-5 text-xl font-bold text-[#102229]">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#53656d]">{step.text}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-3xl border border-[#d8e3e4] bg-white/78 p-5 text-sm leading-6 text-[#53656d] shadow-[0_8px_20px_rgba(32,53,61,0.08)]">
          <CircleHelp className="mt-0.5 shrink-0 text-[#0e6f69]" size={18} />
          <span>
            Keep notes in Markdown locally, then let the CLI sync them. Veda becomes more useful as your study history grows.
          </span>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6">
        <div className="flex flex-col gap-6 rounded-3xl bg-[linear-gradient(160deg,#16837c,#0f5c60)] p-8 text-white shadow-[0_24px_56px_rgba(25,43,49,0.18)] md:flex-row md:items-center md:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-white/20 bg-white/12 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-white">
              Built for learners
            </span>
            <h2 className="mt-5 max-w-2xl text-3xl font-bold leading-tight">Ready to turn learning chaos into one clear career system?</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/80">
              Start with notes, add your target role, and let StudyBuddy guide the next project, recall session, and resume update.
            </p>
          </div>
          <Link
            to={startPath}
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-[#0f5c60] transition hover:bg-[#f6fffd]"
          >
            Launch StudyBuddy
          </Link>
        </div>
      </section>

      <footer className="mx-auto grid max-w-7xl gap-6 px-5 pb-10 sm:px-6 md:grid-cols-[1.2fr_1fr_0.8fr]">
        <div>
          <strong className="block text-lg text-[#102229]">StudyBuddy</strong>
          <p className="mt-3 max-w-sm text-sm leading-6 text-[#53656d]">
            Notes, roadmaps, recall, and AI career guidance in one connected workspace.
          </p>
        </div>
        <nav className="flex flex-col gap-2 text-sm text-[#53656d]" aria-label="Footer navigation">
          <a href="#workspace" className="hover:text-[#0e6f69]">Home</a>
          <a href="#tools" className="hover:text-[#0e6f69]">Features</a>
          <Link to="/auth" className="hover:text-[#0e6f69]">Login</Link>
        </nav>
        <div className="flex flex-col gap-2 text-sm text-[#53656d]">
          <a href="#" className="inline-flex items-center gap-2 hover:text-[#0e6f69]">
            <Github size={16} /> GitHub
          </a>
          <a href="https://www.linkedin.com/in/priyanshu-tiwari-pds37" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-[#0e6f69]">
            <Linkedin size={16} /> LinkedIn
          </a>
          <a href="#" className="inline-flex items-center gap-2 hover:text-[#0e6f69]">
            <MessageCircle size={16} /> Discord
          </a>
        </div>
      </footer>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-[#e7eff0] bg-white p-5 shadow-[0_8px_20px_rgba(32,53,61,0.08)]">
      <strong className="block text-2xl font-bold text-[#102229]">{value}</strong>
      <span className="mt-2 block text-sm leading-5 text-[#53656d]">{label}</span>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative min-h-[32rem] overflow-hidden rounded-3xl border border-[#e7eff0] bg-[radial-gradient(circle_at_top_right,rgba(21,140,131,0.24),transparent_42%),linear-gradient(180deg,rgba(21,140,131,0.12),#ffffff)] shadow-[0_24px_56px_rgba(25,43,49,0.18)]">
      <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d8e3e4]" />
      <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#d8e3e4]" />

      <div className="absolute left-[10%] top-[14%] w-72 rounded-2xl border border-[#e7eff0] bg-white/80 p-5 shadow-[0_16px_32px_rgba(32,53,61,0.12)] backdrop-blur">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#0e6f69]">
          <TerminalSquare size={16} />
          Local agent
        </div>
        <strong className="mt-3 block text-xl leading-tight text-[#102229]">8 notes synced today</strong>
        <span className="mt-2 block text-sm text-[#53656d]">Ready for recall and roadmap planning</span>
      </div>

      <div className="absolute right-[10%] top-[22%] inline-flex items-center gap-2 rounded-2xl border border-[#e7eff0] bg-white/80 p-5 text-sm font-semibold text-[#102229] shadow-[0_16px_32px_rgba(32,53,61,0.12)] backdrop-blur">
        <Target size={17} className="text-[#0e6f69]" />
        Frontend role focus
      </div>

      <div className="absolute bottom-[14%] right-[13%] inline-flex items-center gap-2 rounded-2xl border border-[#e7eff0] bg-white/80 p-5 text-sm font-semibold text-[#102229] shadow-[0_16px_32px_rgba(32,53,61,0.12)] backdrop-blur">
        <CheckCircle2 size={17} className="text-[#2e9b68]" />
        Resume proof improved
      </div>

      <div className="absolute bottom-[17%] left-[12%] w-72 rounded-2xl border border-[#e7eff0] bg-white/84 p-5 shadow-[0_16px_32px_rgba(32,53,61,0.12)] backdrop-blur">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#0e6f69]">
          <BrainCircuit size={16} />
          Veda active
        </div>
        <p className="mt-3 text-sm leading-6 text-[#53656d]">
          You are strongest in React state, weaker in async rendering. Start recall there.
        </p>
      </div>

      <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#158c83] text-white shadow-[0_0_0_16px_rgba(21,140,131,0.12)]">
        <Briefcase size={24} />
      </div>
    </div>
  );
}
