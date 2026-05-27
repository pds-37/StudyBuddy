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
  RefreshCw
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

  // Custom API key states
  const [apiKeys, setApiKeys] = useState({
    groq: "",
    gemini: "",
    openai: "",
    huggingface: ""
  });
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [savingKeys, setSavingKeys] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const { data } = await apiClient.get("/users/me/api-keys");
        if (data && data.apiKeys) {
          setApiKeys({
            groq: data.apiKeys.groq || "",
            gemini: data.apiKeys.gemini || "",
            openai: data.apiKeys.openai || "",
            huggingface: data.apiKeys.huggingface || ""
          });
        }
      } catch (err) {
        console.error("Failed to load custom API keys:", err);
      } finally {
        setLoadingKeys(false);
      }
    };
    if (user) {
      fetchKeys();
    } else {
      setLoadingKeys(false);
    }
  }, [user]);

  const handleSaveKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingKeys(true);
    setSaveSuccess(false);
    try {
      await apiClient.put("/users/me/api-keys", apiKeys);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert("Failed to save API keys. Please try again.");
    } finally {
      setSavingKeys(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full relative pb-20">
      <NebulaBackground opacity={0.1} />
      
      <header className="py-10 border-b border-white/[0.04] mb-10 relative z-10">
        <h1 className="text-4xl font-black text-white text-white text-white tracking-tight">Account Settings</h1>
        <p className="mt-2 text-slate-500 font-medium">Manage your student profile, SaaS plan, and Veda workspace limits.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 relative z-10">
        <div className="space-y-12">
          {/* Profile Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <User className="w-5 h-5 text-brand" />
              <h2 className="text-lg font-bold text-white text-white text-white uppercase tracking-widest text-[11px]">Personal Profile</h2>
            </div>
            
            <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand to-cyan p-[1px]">
                  <div className="w-full h-full rounded-full bg-transparent bg-obsidian bg-transparent bg-obsidian$4">
                    {(user?.name || user?.email || "U")[0].toUpperCase()}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white text-white text-white">{user?.name || "System User"}</h3>
                  <p className="text-slate-500 text-sm">{user?.email}</p>
                </div>
                <button className="px-6 py-2 rounded-xl bg-transparent bg-transparent bg-white/5 border border-white/10 border-white/10 border-white/10 text-xs font-bold text-white text-white text-white hover:bg-transparent bg-transparent bg-white/10 transition-all">
                  Edit Profile
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingInput label="Target Role" value={user?.targetRoles?.[0] || "Not set"} disabled />
                <SettingInput label="Consistency Score" value={`${user?.behaviorProfile?.consistencyScore ?? 0}%`} disabled />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white text-white text-white uppercase tracking-widest text-[11px]">Plan & Usage</h2>
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

          {/* Custom API Credentials */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <Shield className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white uppercase tracking-widest text-[11px]">AI Engine Custom Credentials</h2>
            </div>
            
            <form onSubmit={handleSaveKeys} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white">Bring Your Own API Keys</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Configure your own credentials to enable fully independent, high-performance mock interviews, roadmaps, and chat modules.
                </p>
              </div>

              {loadingKeys ? (
                <div className="text-slate-400 text-xs animate-pulse">Retrieving secure key vaults...</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Groq API Key</label>
                      <input 
                        type="password"
                        placeholder="gsk_..."
                        value={apiKeys.groq}
                        onChange={(e) => setApiKeys({ ...apiKeys, groq: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder-slate-600 focus:border-brand/40 transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Google Gemini API Key</label>
                      <input 
                        type="password"
                        placeholder="AIzaSy..."
                        value={apiKeys.gemini}
                        onChange={(e) => setApiKeys({ ...apiKeys, gemini: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder-slate-600 focus:border-brand/40 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      type="submit"
                      disabled={savingKeys}
                      className="inline-flex items-center justify-center gap-3 rounded-xl bg-brand hover:bg-brand/90 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {savingKeys ? "Encrypting & Saving..." : "Save Credentials"}
                    </button>
                    {saveSuccess && (
                      <span className="text-emerald-400 text-xs font-bold animate-pulse">✓ Saved successfully!</span>
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
              <h2 className="text-lg font-bold text-white text-white text-white uppercase tracking-widest text-[11px]">Interface & Experience</h2>
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
                className="inline-flex items-center justify-center gap-3 rounded-xl bg-amber-500 hover:bg-amber-600 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-slate-955 hover:text-slate-950 transition-all active:scale-[0.98]"
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
              <h2 className="text-lg font-bold text-white text-white text-white uppercase tracking-widest text-[11px]">Veda Infrastructure</h2>
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
              <h4 className="text-sm font-black text-white text-white text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                Need Support?
              </h4>
              <p className="text-xs text-slate-500 text-slate-500 text-slate-400 leading-relaxed font-medium mb-6">
                Our team is ready to help you optimize your career workspace.
              </p>
              <button className="w-full py-4 rounded-2xl bg-transparent text-obsidian text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all">
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
        className="w-full bg-white/[0.03] border border-white/10 border-white/10 border-white/10 rounded-2xl px-6 py-4 text-sm text-white text-white text-white placeholder-slate-600 focus:border-brand/40 transition-all outline-none"
      />
    </div>
  );
}

function SettingToggle({ label, description, enabled }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
      <div>
        <p className="text-sm font-bold text-white text-white text-white">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <div className={cn(
        "w-12 h-6 rounded-full transition-all relative cursor-pointer",
        enabled ? "bg-brand shadow-glow" : "bg-transparent bg-transparent bg-white/10"
      )}>
        <div className={cn(
          "absolute top-1 w-4 h-4 rounded-full bg-transparent transition-all",
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
        <div className="p-2 rounded-lg bg-transparent bg-transparent bg-white/5 text-slate-500 text-slate-500 text-slate-400 group-hover:text-white text-white text-white transition-colors">
          <Icon size={16} />
        </div>
        <span className="text-sm font-bold text-slate-300 text-slate-300 text-slate-300 group-hover:text-white text-white text-white transition-colors">{label}</span>
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
