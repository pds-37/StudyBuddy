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

      <div className="max-w-4xl mx-auto w-full relative z-10">
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
          <section className="space-y-6 opacity-60 pointer-events-none">
            <div className="flex items-center gap-3 px-2">
              <Server className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white uppercase tracking-widest text-[11px]">Zookeeper Master AI Control Center</h2>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-8 relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Zookeeper Per-Feature AI Routing</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Distribute computational load by configuring which AI engine acts as the primary worker bee for each core StudyBuddy feature.
                  </p>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/[0.01] border border-white/5">
                  <Activity className="w-4 h-4 text-slate-500" />
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Status: <span className="text-amber-500 font-bold">Coming Soon</span>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                <div className="text-sm font-bold text-white uppercase tracking-widest px-6 py-3 rounded-2xl bg-white/5 border border-white/10">
                  Feature In Development
                </div>
              </div>
            </div>
          </section>

        </div>
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
