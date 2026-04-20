import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, MessageSquare, Route, Target, Users, FolderKanban, Sparkles } from "lucide-react";
import { RoadmapWidget } from "../components/dashboard";
import { useAppStore } from "../store/app-store";
import { useCopilotStore } from "../store/copilot-store";
import { useJobsStore } from "../store/jobs-store";
import { useRoadmapsStore } from "../store/roadmaps-store";
import { cn } from "../lib/utils/cn";

const setupSteps = ["Target role", "Current skills", "Experience level"] as const;

/** 
 * Shows a premium protected dashboard with a central progress loop and action hub.
 */
export function DashboardPage() {
  const user = useAppStore((state) => state.user);
  const clearSession = useAppStore((state) => state.clearSession);
  const jobs = useJobsStore((state) => state.jobs);
  const currentRoadmap = useRoadmapsStore((state) => state.currentRoadmap);
  const conversations = useCopilotStore((state) => state.conversations);

  const completedMilestones = useMemo(
    () => currentRoadmap?.milestones.filter((milestone) => milestone.status === "completed").length ?? 0,
    [currentRoadmap]
  );

  const stats = [
    { label: "Tracked Skills", value: String(user?.currentSkills.length ?? 0), icon: Target },
    { label: "Milestones", value: currentRoadmap ? `${completedMilestones}` : "0", icon: Route },
    { label: "Matched Jobs", value: String(jobs.length), icon: Briefcase },
    { label: "AI Sessions", value: String(conversations.length), icon: MessageSquare }
  ] as const;

  const quickActions = [
    { title: "Review AI Matches", desc: "View the jobs best suited for your skills", to: "/jobs", icon: Briefcase, color: "from-blue-500/20 to-cyan-500/10", border: "border-blue-500/20" },
    { title: "Find Mentorship", desc: "Connect with experts in your target field", to: "/mentorship", icon: Users, color: "from-purple-500/20 to-fuchsia-500/10", border: "border-purple-500/20" },
    { title: "Capstone Projects", desc: "Build real-world projects to close gaps", to: "/projects", icon: FolderKanban, color: "from-emerald-500/20 to-teal-500/10", border: "border-emerald-500/20" },
    { title: "Career Copilot", desc: "Chat with your personal career assistant", to: "/copilot", icon: Sparkles, color: "from-amber-500/20 to-orange-500/10", border: "border-amber-500/20" }
  ];

  return (
    <section className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* PREMIUM HERO SECTION */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0f1115] p-8 md:p-12 shadow-2xl">
        {/* Dynamic Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-violet-500/5 to-cyan/10" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-cyan uppercase tracking-widest mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Your Command Center
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-tight">
              Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ""}
            </h1>
            <p className="mt-4 text-lg text-slate-400 max-w-xl leading-relaxed">
              {user?.onboardingCompleted
                ? `You are on the path to becoming a ${user.targetRole}. Let's close those skill gaps and land your dream role.`
                : "Finish your profile setup to let StudyBuddy personalize your career roadmap and matches."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/onboarding"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.15)]"
            >
              {user?.onboardingCompleted ? "Update Profile" : "Complete Setup"}
            </Link>
            <button
              onClick={clearSession}
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white backdrop-blur-md"
            >
              Log out
            </button>
          </div>
        </div>
      </div>

      {/* SLEEK STATS ROW */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="group relative overflow-hidden rounded-[1.75rem] border border-white/5 bg-white/[0.02] p-5 transition-all hover:bg-white/[0.04]">
              <div className="absolute top-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
                <Icon className="w-20 h-20 text-white" />
              </div>
              <div className="relative z-10 flex items-center justify-between">
                <p className="font-mono text-xs uppercase tracking-widest text-slate-500">{stat.label}</p>
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 text-cyan transition-transform group-hover:scale-110">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="relative z-10 mt-6 text-4xl font-semibold tracking-tight text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {!user?.onboardingCompleted ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan/10 text-cyan mb-6">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">Let's finish your setup</h2>
            <p className="mt-3 text-slate-400 leading-relaxed max-w-md">
              StudyBuddy needs a few basics to generate your personalized learning roadmap, match you with mentors, and recommend Capstone projects.
            </p>
            <div className="mt-8 space-y-3">
              {setupSteps.map((step, i) => (
                <div key={step} className="flex items-center gap-4 rounded-xl border border-white/5 bg-black/20 p-4">
                  <div className="grid w-6 h-6 place-items-center rounded-full bg-white/10 text-xs font-mono text-white">
                    {i + 1}
                  </div>
                  <span className="font-medium text-slate-200">{step}</span>
                </div>
              ))}
            </div>
            <Link
              to="/onboarding"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-cyan px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 w-full justify-center"
            >
              Begin Onboarding
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="hidden lg:block rounded-[2rem] border border-white/5 bg-[url('/brand/abstract-bg.jpg')] bg-cover bg-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
            <div className="relative z-10 p-12 h-full flex flex-col justify-end">
              <h3 className="text-3xl font-semibold text-white tracking-tight">Your Career, Accelerated.</h3>
              <p className="mt-4 text-slate-300 max-w-sm">
                Unlock AI-powered mock interviews, tailored learning paths, and industry mentorship exactly when you need it.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
          {/* LEFT CORE COLUMN: The Roadmap & Primary Focus */}
          <div className="flex flex-col gap-6">
            <div className="flex-1">
              <RoadmapWidget />
            </div>
            
            <div className="rounded-[2rem] border border-white/5 bg-[#14161a] p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan to-transparent opacity-20" />
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-cyan" />
                    Interview Preparation
                  </h3>
                  <p className="mt-2 text-sm text-slate-400 max-w-lg leading-relaxed">
                    Ready to test your skills? Our AI Interview Simulator will dynamically generate technical and behavioral questions tailored exactly to your target role.
                  </p>
                </div>
                <Link
                  to="/interview"
                  className="shrink-0 inline-flex items-center gap-2 rounded-full bg-cyan/10 border border-cyan/20 px-5 py-2.5 text-sm font-semibold text-cyan transition hover:bg-cyan/20"
                >
                  Start Mock Interview
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: The Action Hub */}
          <div className="flex flex-col gap-4">
            <h3 className="font-mono text-xs uppercase tracking-widest text-slate-500 px-2 pb-2">
              Action Hub
            </h3>
            {quickActions.map((action) => {
              const ActionIcon = action.icon;
              return (
                <Link
                  key={action.to}
                  to={action.to}
                  className={cn(
                    "group relative overflow-hidden rounded-[1.75rem] border bg-black/40 p-6 transition-all hover:-translate-y-1 hover:shadow-xl",
                    action.border
                  )}
                >
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100", action.color)} />
                  <div className="relative z-10 flex items-start gap-4">
                    <div className="grid w-12 h-12 shrink-0 place-items-center rounded-2xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
                      <ActionIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-white flex items-center gap-2">
                        {action.title}
                        <ArrowRight className="w-3.5 h-3.5 text-white/0 -translate-x-2 transition-all group-hover:text-white/100 group-hover:translate-x-0" />
                      </h4>
                      <p className="mt-1 text-sm text-slate-400 leading-snug">
                        {action.desc}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
