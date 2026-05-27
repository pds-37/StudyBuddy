import { useState, useEffect } from "react";
import { useAppStore } from "../store/app-store";
import { Link } from "react-router-dom";
import { 
  User, 
  Bell, 
  Shield, 
  ChevronRight,
  Database,
  Cloud,
  Zap,
  CreditCard,
  BarChart3,
  RefreshCw,
  Cpu,
  GitBranch,
  Server,
  Activity
} from "lucide-react";
import { cn } from "../lib/utils/cn";
import { NebulaBackground } from "../components/common/NebulaBackground";
import { apiClient } from "../lib/api/client";

export function SettingsPage() {
  const { user, isDemoMode } = useAppStore();
  const plan = user?.subscription?.plan ?? "free";
  const aiUsage = user?.usage?.aiMessagesThisMonth ?? (isDemoMode ? 142 : 0);
  const mentorPlans = user?.usage?.mentorPlansGenerated ?? (isDemoMode ? 18 : 0);
  const aiLimit = plan === "team" ? 10000 : plan === "pro" ? 2000 : 100;
  const notesLimit = plan === "team" ? 50000 : plan === "pro" ? 10000 : 250;

  // Using developer-configured server keys exclusively.

  // Dynamic Zookeeper Routing states
  const [aiRoutes, setAiRoutes] = useState({
    mentor: "groq",
    roadmap: "gemini",
    quiz: "groq",
    resume: "gemini",
    skills: "gemini",
    note: "gemini",
    interview: "groq",
    mentorship: "gemini",
    project: "groq"
  });
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [savingRoutes, setSavingRoutes] = useState(false);
  const [routeSuccess, setRouteSuccess] = useState(false);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const { data } = await apiClient.get("/users/me/ai-routes");
        if (data && data.aiRoutes) {
          setAiRoutes({
            mentor: data.aiRoutes.mentor || "groq",
            roadmap: data.aiRoutes.roadmap || "gemini",
            quiz: data.aiRoutes.quiz || "groq",
            resume: data.aiRoutes.resume || "gemini",
            skills: data.aiRoutes.skills || "gemini",
            note: data.aiRoutes.note || "gemini",
            interview: data.aiRoutes.interview || "groq",
            mentorship: data.aiRoutes.mentorship || "gemini",
            project: data.aiRoutes.project || "groq"
          });
        }
      } catch (err) {
        console.error("Failed to load AI routes:", err);
      } finally {
        setLoadingRoutes(false);
      }
    };

    if (user) {
      fetchRoutes();
    } else {
      setLoadingRoutes(false);
    }
  }, [user]);
  // Save handler and key check configurations removed to guarantee exclusive developer-level key routing.
  const handleSaveRoutes = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRoutes(true);
    setRouteSuccess(false);
    try {
      await apiClient.put("/users/me/ai-routes", aiRoutes);
      setRouteSuccess(true);
      setTimeout(() => setRouteSuccess(false), 3000);
    } catch (err) {
      alert("Failed to save AI routing. Please try again.");
    } finally {
      setSavingRoutes(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full relative pb-20">
      <NebulaBackground opacity={0.1} />
      
      <header className="py-10 border-b border-white/[0.04] mb-10 relative z-10">
        <h1 className="text-4xl font-black text-white tracking-tight">Account Settings</h1>
        <p className="mt-2 text-slate-500 font-medium">Manage your student profile, SaaS plan, and Veda workspace limits.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 relative z-10">
        <div className="space-y-12">
          {/* Profile Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <User className="w-5 h-5 text-brand" />
              <h2 className="text-lg font-bold text-white uppercase tracking-widest text-[11px]">Personal Profile</h2>
            </div>
            
            <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand to-cyan p-[1px]">
                  <div className="w-full h-full rounded-full bg-obsidian flex items-center justify-center font-black text-white text-3xl">
                    {(user?.name || user?.email || "U")[0].toUpperCase()}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">{user?.name || "System User"}</h3>
                  <p className="text-slate-500 text-sm">{user?.email}</p>
                </div>
                <button className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 transition-all">
                  Edit Profile
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingInput label="Target Role" value={user?.targetRoles?.[0] || "Not set"} disabled />
                <SettingInput label="Consistency Score" value={`${user?.behaviorProfile?.consistencyScore ?? 0}%`} disabled />
              </div>
            </div>
          </section>

          {/* Plan & Usage Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white uppercase tracking-widest text-[11px]">Plan & Usage</h2>
            </div>
            
            <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-white capitalize">{isDemoMode ? "Pro Student demo" : `${plan} plan`}</p>
                  <p className="mt-1 text-xs text-slate-500">Transparent limits for AI messages, mentor plans, notes, and projects.</p>
                </div>
                <a href="/pricing" className="inline-flex items-center justify-center gap-2 rounded-xl bg-transparent px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-950">
                  View pricing
                  <ChevronRight size={14} />
                </a>
              </div>
              <UsageMeter label="AI messages" value={aiUsage} limit={aiLimit} />
              <UsageMeter label="Mentor plans generated" value={mentorPlans} limit={30} />
              <UsageMeter label="Notes tracked" value={isDemoMode ? 42 : 0} limit={notesLimit} />
            </div>
          </section>



          {/* Zookeeper AI Master Orchestrator Routing Matrix */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <Server className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white uppercase tracking-widest text-[11px]">Zookeeper Master AI Control Center</h2>
            </div>

            <form onSubmit={handleSaveRoutes} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                <div>
                  <h3 className="text-sm font-bold text-white">Zookeeper Per-Feature AI Routing</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Distribute computational load by configuring which AI engine acts as the primary worker bee for each core StudyBuddy feature.
                  </p>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/[0.01] border border-white/5">
                  <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Zookeeper Status: <span className="text-emerald-400 font-bold">Active</span>
                  </div>
                </div>
              </div>

              {loadingRoutes ? (
                <div className="text-slate-400 text-xs animate-pulse">Consulting routing configuration...</div>
              ) : (
                <>
                  {/* Routing Topology Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <RouteCard 
                      title="AI Mentor Copilot" 
                      description="Empathetic chat coach, low-latency, friendly style." 
                      value={aiRoutes.mentor} 
                      onChange={(val) => setAiRoutes({ ...aiRoutes, mentor: val })}
                    />
                    <RouteCard 
                      title="Strategic Roadmaps" 
                      description="Context-heavy curriculum builder and logical structuring." 
                      value={aiRoutes.roadmap} 
                      onChange={(val) => setAiRoutes({ ...aiRoutes, roadmap: val })}
                    />
                    <RouteCard 
                      title="Active Recall Quizzes" 
                      description="Rapid conceptual and code-based quiz card generator." 
                      value={aiRoutes.quiz} 
                      onChange={(val) => setAiRoutes({ ...aiRoutes, quiz: val })}
                    />
                    <RouteCard 
                      title="ATS Resume Tailoring" 
                      description="Large prompt parsing, ATS evaluations, and storytelling edits." 
                      value={aiRoutes.resume} 
                      onChange={(val) => setAiRoutes({ ...aiRoutes, resume: val })}
                    />
                    <RouteCard 
                      title="Mock Interview Rounds" 
                      description="SDE technical evaluation, algorithmic pressure mode, and scoring." 
                      value={aiRoutes.interview} 
                      onChange={(val) => setAiRoutes({ ...aiRoutes, interview: val })}
                    />
                    <RouteCard 
                      title="Note Graph Ingestion" 
                      description="Analyzes notes to extract concepts, graph edges, and review cards." 
                      value={aiRoutes.note} 
                      onChange={(val) => setAiRoutes({ ...aiRoutes, note: val })}
                    />
                    <RouteCard 
                      title="Skill Readiness Analyst" 
                      description="Aggregates consistency metrics to score career preparedness." 
                      value={aiRoutes.skills} 
                      onChange={(val) => setAiRoutes({ ...aiRoutes, skills: val })}
                    />
                    <RouteCard 
                      title="Project Coordinator" 
                      description="Analyzes student blockers to suggest architectural projects." 
                      value={aiRoutes.project} 
                      onChange={(val) => setAiRoutes({ ...aiRoutes, project: val })}
                    />
                  </div>

                  <div className="flex items-center gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={savingRoutes}
                      className="inline-flex items-center justify-center gap-3 rounded-xl bg-amber-500 hover:bg-amber-600 px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-950 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {savingRoutes ? "Calibrating Zookeeper..." : "Apply Zookeeper Routing"}
                    </button>
                    {routeSuccess && (
                      <span className="text-emerald-400 text-xs font-bold animate-pulse flex items-center gap-2">
                        <GitBranch size={12} className="text-emerald-400" />
                        ✓ Topology updated successfully!
                      </span>
                    )}
                  </div>
                </>
              )}
            </form>
          </section>

          {/* Interface Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white uppercase tracking-widest text-[11px]">Interface & Experience</h2>
            </div>
            
            <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6">
              <SettingToggle 
                label="Reduced Motion" 
                description="Minimize animations for better performance."
                enabled={false}
              />
              <SettingToggle 
                label="Compact Mode" 
                description="Show more content with smaller text and density."
                enabled={true}
              />
            </div>
          </section>

          {/* Roadmap Calibration Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <RefreshCw className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white uppercase tracking-widest text-[11px]">Roadmap Calibration</h2>
            </div>
            
            <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white">Struggling with your current pace?</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Recalibrate your strategic SDE timeline, target role parameters, skill assumptions, and daily workload limits to better align with your pacing.
                </p>
              </div>
              
              <Link
                to="/onboarding"
                className="inline-flex items-center justify-center gap-3 rounded-xl bg-amber-500 hover:bg-amber-600 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-slate-950 hover:text-slate-955 transition-all active:scale-[0.98]"
              >
                <RefreshCw size={14} />
                Recalibrate SDE Trajectory
              </Link>
            </div>
          </section>

          {/* Infrastructure Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <Database className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white uppercase tracking-widest text-[11px]">Veda Infrastructure</h2>
            </div>
            
            <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-4">
              <InfrastructureItem icon={Cloud} label="AI Orchestration" status="Connected" color="text-emerald-400" />
              <InfrastructureItem icon={Shield} label="Knowledge Persistence" status="Encrypted" color="text-cyan-400" />
              <InfrastructureItem icon={Bell} label="Push Notifications" status="Active" color="text-brand" />
              <InfrastructureItem icon={BarChart3} label="Student Intelligence" status="Live" color="text-amber-400" />
            </div>
          </section>
        </div>

        {/* Sidebar help */}
        <aside className="space-y-8">
          <div className="p-8 rounded-[3rem] bg-brand/5 border border-brand/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-5">
              <Zap size={150} className="text-brand" />
            </div>
            <div className="relative z-10">
              <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                Need Support?
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium mb-6">
                Our team is ready to help you optimize your career workspace.
              </p>
              <button className="w-full py-4 rounded-2xl bg-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all">
                Contact Mentors
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SettingInput({ label, value, disabled }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
      <input 
        disabled={disabled}
        value={value}
        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder-slate-600 focus:border-brand/40 transition-all outline-none"
      />
    </div>
  );
}

function SettingToggle({ label, description, enabled }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
      <div>
        <p className="text-sm font-bold text-white">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <div className={cn(
        "w-12 h-6 rounded-full transition-all relative cursor-pointer",
        enabled ? "bg-brand shadow-glow" : "bg-white/10"
      )}>
        <div className={cn(
          "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
          enabled ? "left-7" : "left-1"
        )} />
      </div>
    </div>
  );
}

function InfrastructureItem({ icon: Icon, label, status, color }: any) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors group cursor-pointer rounded-2xl">
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-lg bg-white/5 text-slate-400 group-hover:text-white transition-colors">
          <Icon size={16} />
        </div>
        <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn("text-[10px] font-black uppercase tracking-widest", color)}>{status}</span>
        <ChevronRight size={14} className="text-slate-300" />
      </div>
    </div>
  );
}

function UsageMeter({ label, value, limit }: { label: string; value: number; limit: number }) {
  const percent = Math.min(100, Math.round((value / limit) * 100));

  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-400">{label}</span>
        <span className="font-mono text-slate-300">{value}/{limit}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-brand to-cyan" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

interface RouteCardProps {
  title: string;
  description: string;
  value: string;
  onChange: (val: string) => void;
}

function RouteCard({ title, description, value, onChange }: RouteCardProps) {
  return (
    <div className="p-5 rounded-3xl bg-white/[0.01] border border-white/5 flex flex-col justify-between gap-4 hover:border-white/10 transition-colors">
      <div>
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-white tracking-tight">{title}</h4>
          <span className={cn(
            "text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full",
            value === "groq" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
            value === "gemini" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" :
            "bg-orange-500/10 text-orange-400 border border-orange-500/20"
          )}>
            Active: {value.toUpperCase()}
          </span>
        </div>
        <p className="mt-1 text-[10px] text-slate-500 leading-normal">{description}</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onChange("groq")}
          className={cn(
            "py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border",
            value === "groq" 
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)]" 
              : "bg-white/[0.02] text-slate-400 border-white/5 hover:bg-white/5 hover:text-white"
          )}
        >
          Groq
        </button>
        <button
          type="button"
          onClick={() => onChange("gemini")}
          className={cn(
            "py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border",
            value === "gemini" 
              ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.15)]" 
              : "bg-white/[0.02] text-slate-400 border-white/5 hover:bg-white/5 hover:text-white"
          )}
        >
          Gemini
        </button>
        <button
          type="button"
          onClick={() => onChange("huggingface")}
          className={cn(
            "py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border",
            value === "huggingface" 
              ? "bg-orange-500/10 text-orange-400 border-orange-500/40 shadow-[0_0_12px_rgba(249,115,22,0.15)]" 
              : "bg-white/[0.02] text-slate-400 border-white/5 hover:bg-white/5 hover:text-white"
          )}
        >
          HF
        </button>
      </div>
    </div>
  );
}
