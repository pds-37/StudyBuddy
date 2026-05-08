import { useAppStore } from "../store/app-store";
import { useThemeStore } from "../store/theme-store";
import { 
  User, 
  Moon, 
  Sun, 
  Bell, 
  Shield, 
  ChevronRight,
  Database,
  Cloud,
  Zap
} from "lucide-react";
import { cn } from "../lib/utils/cn";
import { NebulaBackground } from "../components/common/NebulaBackground";

export function SettingsPage() {
  const { user } = useAppStore();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="flex flex-col min-h-full relative pb-20">
      <NebulaBackground opacity={0.1} />
      
      <header className="py-10 border-b border-white/[0.04] mb-10 relative z-10">
        <h1 className="text-4xl font-black text-slate-900 dark:text-slate-900 dark:text-white tracking-tight">System Settings</h1>
        <p className="mt-2 text-slate-500 font-medium italic">Configure your Veda Brain and workspace environment.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 relative z-10">
        <div className="space-y-12">
          {/* Profile Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <User className="w-5 h-5 text-brand" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-900 dark:text-white uppercase tracking-widest text-[11px]">Personal Profile</h2>
            </div>
            
            <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand to-cyan p-[1px]">
                  <div className="w-full h-full rounded-full bg-white dark:bg-obsidian bg-white dark:bg-obsidian$4">
                    {(user?.name || user?.email || "U")[0].toUpperCase()}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-900 dark:text-white">{user?.name || "System User"}</h3>
                  <p className="text-slate-500 text-sm">{user?.email}</p>
                </div>
                <button className="px-6 py-2 rounded-xl bg-slate-50 dark:bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-slate-900 dark:text-white hover:bg-slate-100 dark:bg-slate-100 dark:bg-white/10 transition-all">
                  Edit Profile
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingInput label="Target Role" value="Senior Frontend Engineer" disabled />
                <SettingInput label="Consistency Score" value="84%" disabled />
              </div>
            </div>
          </section>

          {/* Interface Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-900 dark:text-white uppercase tracking-widest text-[11px]">Interface & Experience</h2>
            </div>
            
            <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-brand/10 text-brand border border-brand/20">
                    {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-900 dark:text-white">Appearance</p>
                    <p className="text-xs text-slate-500">Toggle between Dark Nebula and Light Stellar modes.</p>
                  </div>
                </div>
                <button 
                  onClick={toggleTheme}
                  className="px-6 py-2 rounded-xl bg-brand text-slate-900 dark:text-slate-900 dark:text-white text-xs font-black uppercase tracking-widest shadow-glow"
                >
                  {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                </button>
              </div>

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

          {/* Infrastructure Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <Database className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-900 dark:text-white uppercase tracking-widest text-[11px]">Veda Infrastructure</h2>
            </div>
            
            <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-4">
              <InfrastructureItem icon={Cloud} label="AI Orchestration" status="Connected" color="text-emerald-400" />
              <InfrastructureItem icon={Shield} label="Knowledge Persistence" status="Encrypted" color="text-cyan-400" />
              <InfrastructureItem icon={Bell} label="Push Notifications" status="Active" color="text-brand" />
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
              <h4 className="text-sm font-black text-slate-900 dark:text-slate-900 dark:text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                Need Support?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-6">
                Our team is ready to help you optimize your career workspace.
              </p>
              <button className="w-full py-4 rounded-2xl bg-white text-obsidian text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all">
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
        className="w-full bg-white/[0.03] border border-slate-200 dark:border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-sm text-slate-900 dark:text-slate-900 dark:text-white placeholder-slate-600 focus:border-brand/40 transition-all outline-none"
      />
    </div>
  );
}

function SettingToggle({ label, description, enabled }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
      <div>
        <p className="text-sm font-bold text-slate-900 dark:text-slate-900 dark:text-white">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <div className={cn(
        "w-12 h-6 rounded-full transition-all relative cursor-pointer",
        enabled ? "bg-brand shadow-glow" : "bg-slate-100 dark:bg-slate-100 dark:bg-white/10"
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
        <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:text-slate-900 dark:text-white transition-colors">
          <Icon size={16} />
        </div>
        <span className="text-sm font-bold text-slate-700 dark:text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:text-slate-900 dark:text-white transition-colors">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn("text-[10px] font-black uppercase tracking-widest", color)}>{status}</span>
        <ChevronRight size={14} className="text-slate-700" />
      </div>
    </div>
  );
}
