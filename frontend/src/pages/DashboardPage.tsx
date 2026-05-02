import { useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Briefcase, 
  MessageSquare, 
  Route, 
  Target, 
  Users, 
  FolderKanban, 
  Sparkles,
  Zap,
  TrendingUp,
  Clock,
  ChevronRight
} from "lucide-react";
import { RoadmapWidget } from "../components/dashboard";
import { SyncStatusWidget } from "../features/sync/components/SyncStatusWidget";
import { MilestoneQuiz } from "../features/roadmaps/components/MilestoneQuiz";
import { useAppStore } from "../store/app-store";
import { useCopilotStore } from "../store/copilot-store";
import { useJobsStore } from "../store/jobs-store";
import { useRoadmapsStore } from "../store/roadmaps-store";
import { cn } from "../lib/utils/cn";

const setupSteps = [
  { title: "Target role", icon: Target },
  { title: "Current skills", icon: Zap },
  { title: "Experience level", icon: TrendingUp }
] as const;

export function DashboardPage() {
  const { user } = useAppStore();
  const jobs = useJobsStore((state) => state.jobs);
  const currentRoadmap = useRoadmapsStore((state) => state.currentRoadmap);
  const conversations = useCopilotStore((state) => state.conversations);

  const completedMilestones = useMemo(
    () => currentRoadmap?.milestones.filter((m) => m.status === "completed").length ?? 0,
    [currentRoadmap]
  );

  const nextMilestone = useMemo(
    () => currentRoadmap?.milestones.find((m) => m.status !== "completed"),
    [currentRoadmap]
  );

  const stats = [
    { label: "Skills Tracked", value: String(user?.currentSkills.length ?? 0), icon: Target, color: "text-brand" },
    { label: "Milestones", value: currentRoadmap ? `${completedMilestones}/${currentRoadmap.milestones.length}` : "0", icon: Route, color: "text-cyan" },
    { label: "Matched Jobs", value: String(jobs.length), icon: Briefcase, color: "text-emerald-400" },
    { label: "AI Sessions", value: String(conversations.length), icon: MessageSquare, color: "text-purple-400" }
  ] as const;

  const quickActions = [
    { title: "AI Job Matcher", desc: "View tailored opportunities", to: "/jobs", icon: Briefcase, color: "bg-blue-500/10 text-blue-400" },
    { title: "Expert Network", desc: "Connect with mentors", to: "/mentorship", icon: Users, color: "bg-purple-500/10 text-purple-400" },
    { title: "Capstone Lab", desc: "Build real projects", to: "/projects", icon: FolderKanban, color: "bg-emerald-500/10 text-emerald-400" },
    { title: "Ask Veda", desc: "Consult your AI mentor", to: "/copilot", icon: Sparkles, color: "bg-brand/10 text-brand" }
  ];

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">Welcome back, {user?.name || "User"}</h1>
          <p className="text-slate-400">Here's what's happening with your <span className="text-white font-semibold">{user?.targetRoles?.[0] || "career setup"}</span> path.</p>
        </div>
        {!user?.onboardingCompleted && (
          <Link
            to="/onboarding"
            className="px-6 py-3 rounded-xl bg-brand text-white font-bold hover:scale-105 transition-all shadow-[0_0_20px_rgba(124,92,255,0.3)] flex items-center gap-2"
          >
            Complete Onboarding
            <ArrowRight size={18} />
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="group p-6 rounded-2xl glass border-white/5 hover:border-white/10 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2 rounded-lg bg-white/5", stat.color)}>
                <stat.icon size={20} />
              </div>
              <TrendingUp size={14} className="text-emerald-500 opacity-50" />
            </div>
            <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      {!user?.onboardingCompleted ? (
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3 p-10 rounded-[2.5rem] glass border-brand/20 bg-brand/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 blur-[100px] -z-10" />
            <h2 className="text-3xl font-bold text-white mb-4">Initialize your Career OS</h2>
            <p className="text-slate-400 mb-10 max-w-md leading-relaxed">
              Complete these steps to unlock personalized roadmaps, job matching, and AI-powered mentorship.
            </p>
            
            <div className="space-y-4">
              {setupSteps.map((step, i) => (
                <div key={step.title} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 group hover:border-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-brand transition-colors">
                    <step.icon size={20} />
                  </div>
                  <span className="font-semibold text-white">{step.title}</span>
                  <div className="ml-auto w-6 h-6 rounded-full border border-white/10 flex items-center justify-center text-[10px] font-bold text-slate-500">
                    {i + 1}
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/onboarding"
              className="mt-10 w-full py-4 rounded-2xl bg-white text-obsidian font-black text-center block hover:bg-slate-200 transition-colors"
            >
              Start Onboarding Sequence
            </Link>
          </div>

          <Link to="/copilot" className="lg:col-span-2 p-10 rounded-[2.5rem] glass border-cyan/20 bg-cyan/5 flex flex-col justify-center text-center group hover:border-cyan/40 transition-all">
             <div className="w-20 h-20 rounded-3xl bg-cyan/20 flex items-center justify-center text-cyan mx-auto mb-8 shadow-[0_0_30px_rgba(34,211,238,0.2)] group-hover:scale-110 transition-transform">
                <Sparkles size={40} />
             </div>
             <h3 className="text-2xl font-bold text-white mb-4">Veda is ready.</h3>
             <p className="text-slate-400 leading-relaxed text-sm">
                Once onboarded, your personal assistant will guide you through every hurdle of your career journey.
             </p>
          </Link>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Main Focus Area */}
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-[2.5rem] overflow-hidden">
               <RoadmapWidget />
            </div>

            {nextMilestone && (
              <div className="rounded-[2.5rem] glass border-white/5 p-8 bg-white/[0.01]">
                <div className="flex items-center gap-3 mb-6">
                   <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <Zap size={18} />
                   </div>
                   <h3 className="text-lg font-bold text-white">Active Milestone</h3>
                </div>
                <MilestoneQuiz milestoneId={nextMilestone.id} milestoneTitle={nextMilestone.title} />
              </div>
            )}
          </div>

          {/* Sidebar / Shortcuts */}
          <div className="space-y-8">
            <div>
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-6 px-2">Quick Actions</h3>
               <div className="grid gap-4">
                  {quickActions.map((action) => (
                    <Link
                      key={action.to}
                      to={action.to}
                      className="group p-4 rounded-2xl glass border-white/5 hover:border-white/20 transition-all flex items-center gap-4"
                    >
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", action.color)}>
                        <action.icon size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm group-hover:text-brand transition-colors">{action.title}</p>
                        <p className="text-xs text-slate-500 truncate">{action.desc}</p>
                      </div>
                      <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition-colors" />
                    </Link>
                  ))}
               </div>
            </div>

            <SyncStatusWidget />

            <div className="p-8 rounded-[2rem] glass border-brand/20 bg-gradient-to-br from-brand/10 to-transparent">
               <p className="text-sm font-bold text-brand mb-4 flex items-center gap-2">
                  <Sparkles size={16} />
                  Pro Tip
               </p>
               <p className="text-sm text-slate-300 leading-relaxed italic">
                  "Try uploading your latest resume to see how it matches with your target role's skill requirements."
               </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
