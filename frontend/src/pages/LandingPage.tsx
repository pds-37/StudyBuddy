import { Link } from "react-router-dom";
import {
  ArrowRight,
  Brain,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  FileText,
  Github,
  GraduationCap,
  Linkedin,
  ListChecks,
  MessageCircle,
  MessageSquare,
  NotebookText,
  Play,
  Route,
  ShieldCheck,
  Sparkles,
  Target,
  TerminalSquare
} from "lucide-react";
import { useAppStore } from "../store/app-store";

const metrics = [
  { label: "Readiness", value: "72%", detail: "+18 this month" },
  { label: "Recall due", value: "6", detail: "2 high priority" },
  { label: "Roadmap", value: "41%", detail: "Frontend track" }
];

const mentorTasks = [
  { title: "Clear JavaScript closures recall", type: "Recall", icon: Brain, done: false },
  { title: "Ship one project improvement", type: "Build", icon: ListChecks, done: false },
  { title: "Rewrite async rendering note", type: "Notes", icon: NotebookText, done: true }
];

const workflow = [
  {
    icon: TerminalSquare,
    title: "Local-first notes",
    text: "Keep studying in Markdown. The CLI syncs your strongest material into the cloud workspace."
  },
  {
    icon: Target,
    title: "Role-aware diagnosis",
    text: "StudyBuddy compares your notes, skills, and resume against the role you actually want."
  },
  {
    icon: Route,
    title: "Daily execution",
    text: "The dashboard turns gaps into recall, roadmap, project, and interview tasks."
  }
];

const surfaces = [
  { icon: MessageSquare, title: "Ask Veda", text: "Answers with your notes and career context." },
  { icon: FileText, title: "Resume Tailor", text: "Turns proof points into role-specific bullets." },
  { icon: Briefcase, title: "Job Match", text: "Ranks jobs by fit and missing evidence." },
  { icon: GraduationCap, title: "Interview Prep", text: "Practice answers against weak topics." }
];

export function LandingPage() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const startPath = isAuthenticated ? "/dashboard" : "/auth";

  return (
    <div className="min-h-screen bg-[#05070b] text-slate-300 selection:bg-cyan/20 selection:text-white">
      <div>
        <section id="workspace" className="border-b border-white/8">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-6 lg:grid-cols-[0.84fr_1.16fr] lg:py-18 xl:py-20">
            <div className="flex flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/8 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                <ShieldCheck size={15} />
                AI career workspace
              </div>

              <h1 className="mt-7 max-w-3xl text-4xl font-semibold leading-[1.03] tracking-normal text-white sm:text-5xl lg:text-6xl">
                Turn scattered study notes into a daily career plan.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
                StudyBuddy connects your notes, resume, roadmap, recall queue, and AI mentor so the next useful task is always obvious.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to={startPath}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan px-5 py-3 text-sm font-bold text-[#041014] transition hover:bg-cyan/90"
                >
                  Open workspace
                  <ArrowRight size={17} />
                </Link>
                <a
                  href="#workflow"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/5"
                >
                  See workflow
                  <Play size={16} />
                </a>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {metrics.map((metric) => (
                  <div key={metric.label} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{metric.label}</p>
                    <p className="mt-3 text-2xl font-semibold text-white">{metric.value}</p>
                    <p className="mt-1 text-xs text-slate-400">{metric.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <ProductPreview />
          </div>
        </section>

        <section id="workflow" className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan">Workflow</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">
                Built around the way developers actually learn.
              </h2>
            </div>
            <p className="max-w-3xl text-base leading-7 text-slate-400">
              The product starts with your existing study habits, then adds structure: diagnosis, spaced recall, project proof, and interview practice.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {workflow.map((item) => (
              <article key={item.title} className="rounded-lg border border-white/10 bg-white/[0.035] p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-[#071016]">
                  <item.icon size={21} />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="tools" className="border-y border-white/8 bg-white/[0.018]">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:py-20">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">Tools</p>
                <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">One workspace, four job-search loops.</h2>
              </div>
              <Link to={startPath} className="inline-flex items-center gap-2 text-sm font-bold text-cyan hover:text-white">
                Start now
                <ChevronRight size={16} />
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {surfaces.map((surface) => (
                <article key={surface.title} className="rounded-lg border border-white/10 bg-[#080d12] p-5">
                  <surface.icon className="text-cyan" size={22} />
                  <h3 className="mt-5 text-base font-semibold text-white">{surface.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{surface.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:py-20">
          <div className="rounded-lg border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(16,185,129,0.08)_45%,rgba(255,255,255,0.04))] p-6 sm:p-8 lg:flex lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan">Ready when you are</p>
              <h2 className="mt-3 max-w-2xl text-2xl font-semibold leading-tight text-white sm:text-3xl">
                Bring your notes in, choose a target role, and let StudyBuddy plan the next move.
              </h2>
            </div>
            <Link
              to={startPath}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-[#07090d] hover:bg-slate-200 lg:mt-0"
            >
              Launch StudyBuddy
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </div>

      <footer className="border-t border-white/8">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-6 md:grid-cols-[1fr_auto_auto] md:items-center">
          <div>
            <strong className="text-lg font-semibold text-white">StudyBuddy</strong>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              AI mentor, recall trainer, and career planning workspace for technical learners.
            </p>
          </div>
          <div className="flex gap-5 text-sm text-slate-400">
            <Link to="/auth" className="hover:text-white">Login</Link>
            <a href="#tools" className="hover:text-white">Tools</a>
            <a href="#workflow" className="hover:text-white">Workflow</a>
          </div>
          <div className="flex gap-3 text-slate-400">
            <a href="#" aria-label="GitHub" className="rounded-lg border border-white/10 p-2 hover:text-white">
              <Github size={17} />
            </a>
            <a href="https://www.linkedin.com/in/priyanshu-tiwari-pds37" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="rounded-lg border border-white/10 p-2 hover:text-white">
              <Linkedin size={17} />
            </a>
            <a href="#" aria-label="Discord" className="rounded-lg border border-white/10 p-2 hover:text-white">
              <MessageCircle size={17} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ProductPreview() {
  return (
    <div className="rounded-lg border border-white/10 bg-[#080d12] p-3 shadow-2xl shadow-black/40">
      <div className="rounded-md border border-white/10 bg-[#0d141b]">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Today</span>
        </div>

        <div className="grid min-h-[520px] lg:grid-cols-[190px_1fr]">
          <aside className="hidden border-r border-white/10 p-4 lg:block">
            <div className="mb-5 rounded-lg bg-cyan/10 p-3 text-cyan">
              <Sparkles size={18} />
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em]">AI Dost</p>
            </div>
            {["Dashboard", "Recall", "Roadmap", "Resume", "Jobs"].map((item, index) => (
              <div
                key={item}
                className={`mb-2 rounded-lg px-3 py-2 text-sm ${index === 0 ? "bg-white text-[#071016] font-semibold" : "text-slate-400"}`}
              >
                {item}
              </div>
            ))}
          </aside>

          <div className="p-4 sm:p-5">
            <div className="grid gap-4 xl:grid-cols-[1fr_240px]">
              <section className="rounded-lg border border-white/10 bg-[#101821] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan">Mentor focus</p>
                <h3 className="mt-3 text-2xl font-semibold text-white">Patch weak topic: async React</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Review the note, answer from memory, then turn the idea into one portfolio commit.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <MiniStat label="Memory" value="54%" />
                  <MiniStat label="Roadmap" value="41%" />
                  <MiniStat label="Interview" value="7/10" />
                </div>
              </section>

              <section className="rounded-lg border border-white/10 bg-[#101821] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Readiness</p>
                <div className="mt-5 flex items-end gap-3">
                  <span className="text-5xl font-semibold text-white">72</span>
                  <span className="pb-2 text-sm text-emerald-300">+8</span>
                </div>
                <div className="mt-5 h-2 rounded-full bg-white/10">
                  <div className="h-full w-[72%] rounded-full bg-emerald-300" />
                </div>
              </section>
            </div>

            <section className="mt-4 rounded-lg border border-white/10 bg-[#101821] p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">Mission list</h3>
                <span className="text-xs text-slate-500">3 tasks</span>
              </div>

              <div className="mt-4 space-y-3">
                {mentorTasks.map((task) => (
                  <div key={task.title} className="flex items-center gap-3 rounded-lg bg-[#0b1118] p-3">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${task.done ? "bg-emerald-300 text-[#071016]" : "bg-cyan/10 text-cyan"}`}>
                      {task.done ? <CheckCircle2 size={17} /> : <task.icon size={17} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-semibold ${task.done ? "text-slate-500 line-through" : "text-white"}`}>{task.title}</p>
                      <p className="text-xs text-slate-500">{task.type}</p>
                    </div>
                    <ChevronRight className="text-slate-600" size={16} />
                  </div>
                ))}
              </div>
            </section>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <section className="rounded-lg border border-white/10 bg-[#101821] p-5">
                <h3 className="font-semibold text-white">Weak topics</h3>
                <TopicBar label="Async rendering" value="54%" width="54%" color="bg-amber-300" />
                <TopicBar label="System design" value="61%" width="61%" color="bg-cyan" />
                <TopicBar label="Resume proof" value="76%" width="76%" color="bg-emerald-300" />
              </section>

              <section className="rounded-lg border border-white/10 bg-[#101821] p-5">
                <h3 className="font-semibold text-white">Veda note</h3>
                <p className="mt-4 text-sm leading-6 text-slate-400">
                  Your project evidence is improving. Add one measurable result before applying to more frontend roles.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#0b1118] p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function TopicBar({ label, value, width, color }: { label: string; value: string; width: string; color: string }) {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-500">{value}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-white/10">
        <div className={`h-full rounded-full ${color}`} style={{ width }} />
      </div>
    </div>
  );
}
