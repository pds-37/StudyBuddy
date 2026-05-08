import { useEffect, useState } from "react";
import { FolderGit2, Check, Clock, Target, Sparkles, Code2, Layers, Cpu, Server, Plus, ArrowRight, Brain, Zap, Send, Play, BarChart2, Briefcase, Award, Flame, Monitor, HardDrive, Smartphone, ChevronRight, MoreHorizontal } from "lucide-react";
import { useProjectsStore } from "../../../store/projects-store";
import { useAppStore } from "../../../store/app-store";
import { logBehavior } from "../../../lib/api/behavior";
import { Link } from "react-router-dom";
import { cn } from "../../../lib/utils/cn";

export function CapstoneProjects() {
  const { matches, loading, error, fetchMatches, updateStatus } = useProjectsStore();
  const user = useAppStore(state => state.user);
  
  const [ideaPrompt, setIdeaPrompt] = useState("");

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  if (!user?.targetRoles || user.targetRoles.length === 0) {
    return (
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-6">
        <h3 className="text-lg font-medium text-amber-200">Target Role Required</h3>
        <p className="mt-1 text-sm text-amber-200/70">Set your target role in your profile to get project recommendations.</p>
        <Link to="/onboarding" className="mt-4 inline-block bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 px-4 py-2 rounded-lg text-sm font-medium">
          Go to Onboarding
        </Link>
      </div>
    );
  }

  if (loading && matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400 space-y-4">
        <FolderGit2 className="w-8 h-8 animate-pulse text-cyan" />
        <p>Analyzing industry trends for project recommendations...</p>
      </div>
    );
  }

  const recommendedProjects = matches.filter(m => m.status === 'recommended');
  const activeProjects = matches.filter(m => m.status === 'in_progress');

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard label="Portfolio Strength" value="62%" trend="+12% this week" trendColor="text-emerald-400" icon={<Briefcase className="w-4 h-4 text-blue-400" />} />
        <MetricCard label="Projects Completed" value="4" trend="↑ 1 this month" trendColor="text-brand" icon={<LayoutDashboard className="w-4 h-4 text-brand" />} />
        <MetricCard label="Interview Impact" value="+18%" trend="High" trendColor="text-emerald-400" icon={<Target className="w-4 h-4 text-emerald-400" />} />
        <MetricCard label="Total XP Earned" value="1,240" trend="↑ 240 this week" trendColor="text-brand" icon={<Award className="w-4 h-4 text-purple-400" />} />
        <MetricCard label="Build Streak" value="7 days" trend="Keep it up!" trendColor="text-amber-400" icon={<Flame className="w-4 h-4 text-amber-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Main Content */}
        <div className="space-y-8">
          
          {/* Project Paths */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-brand" /> Project Paths
              </h2>
              <button className="text-[10px] uppercase font-bold tracking-widest text-slate-500 hover:text-white transition">
                View All Paths →
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
              <PathCard icon={<Monitor className="w-5 h-5 text-brand" />} title="Frontend Developer" count="8 Projects" active />
              <PathCard icon={<Layers className="w-5 h-5 text-cyan-400" />} title="Full Stack Developer" count="10 Projects" />
              <PathCard icon={<Brain className="w-5 h-5 text-emerald-400" />} title="AI Engineer" count="7 Projects" />
              <PathCard icon={<Server className="w-5 h-5 text-amber-400" />} title="Backend Developer" count="6 Projects" />
              <div className="flex-none w-40 rounded-2xl border border-dashed border-white/20 hover:border-white/40 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.04]">
                <Plus className="w-6 h-6" />
                <div className="text-center">
                  <p className="text-xs font-semibold">Custom Path</p>
                  <p className="text-[10px] opacity-70">Create your own</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Projects */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Recommended Projects for You
              </h2>
              <button className="text-[10px] uppercase font-bold tracking-widest text-slate-400 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/5 transition flex items-center gap-1.5">
                Personalize <BarChart2 className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recommendedProjects.slice(0, 3).map((match, idx) => (
                <ProjectCard key={match.id} match={match} featured={idx === 0} onStart={() => updateStatus(match.id, 'in_progress')} />
              ))}
              {recommendedProjects.length === 0 && (
                <div className="col-span-3 text-center py-10 text-slate-500 border border-white/10 rounded-2xl border-dashed">
                  No recommended projects at the moment. Update your skills to see more!
                </div>
              )}
            </div>
          </div>

          {/* Active Projects */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> Your Active Projects
              </h2>
              <button className="text-[10px] uppercase font-bold tracking-widest text-slate-500 hover:text-white transition">
                View All Projects →
              </button>
            </div>
            <div className="space-y-3">
              {activeProjects.map((match) => (
                <ActiveProjectItem key={match.id} match={match} onComplete={() => updateStatus(match.id, 'completed')} />
              ))}
              {activeProjects.length === 0 && (
                <div className="text-center py-6 text-slate-500 border border-white/5 rounded-2xl bg-white/[0.01]">
                  You have no active projects. Start one from the recommendations!
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          
          {/* AI Project Mentor */}
          <div className="rounded-3xl border border-white/[0.06] bg-obsidian p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-brand" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">AI Project Mentor</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-xs text-white font-medium mb-1">You're doing great! 🔥</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Focus on completing 1 project end-to-end to boost your interview confidence.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-brand/5 border border-brand/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
                <h4 className="text-[11px] font-bold text-white mb-1">Focus Area</h4>
                <p className="text-[11px] text-slate-300 mb-4 leading-relaxed relative z-10">
                  Backend integration is your weakest area. Try building more full-stack projects.
                </p>
                <button className="w-full py-2 rounded-lg bg-brand/20 text-brand text-[10px] font-bold uppercase tracking-widest hover:bg-brand/30 transition border border-brand/30 relative z-10">
                  Show Recommendations
                </button>
              </div>
            </div>
          </div>

          {/* Create with AI */}
          <div className="rounded-3xl border border-white/[0.06] bg-obsidian p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">Create with AI</h3>
            </div>
            <p className="text-[11px] text-slate-400 mb-4">Describe your idea and let Veda plan it for you.</p>
            <div className="space-y-3">
              <input 
                type="text" 
                value={ideaPrompt}
                onChange={(e) => setIdeaPrompt(e.target.value)}
                placeholder="E.g. AI resume matcher..."
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan/50"
              />
              <button className="w-full py-2.5 rounded-xl bg-brand text-white text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand/90 transition shadow-[0_0_15px_rgba(202,138,247,0.3)]">
                <Sparkles className="w-3.5 h-3.5" /> Generate Project
              </button>
            </div>
          </div>

          {/* Project Stats */}
          <div className="rounded-3xl border border-white/[0.06] bg-obsidian p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">Project Stats</h3>
            </div>
            <div className="space-y-3">
              <StatRow icon={<Layers className="w-4 h-4 text-slate-400" />} label="Total Projects" value="7" />
              <StatRow icon={<Check className="w-4 h-4 text-emerald-400" />} label="Completed" value="4" />
              <StatRow icon={<Clock className="w-4 h-4 text-cyan-400" />} label="In Progress" value="2" />
              <StatRow icon={<Target className="w-4 h-4 text-brand" />} label="Planning" value="1" />
            </div>
          </div>

          {/* Build Streak Visualizer */}
          <div className="rounded-3xl border border-white/[0.06] bg-obsidian p-6 flex flex-col items-center">
             <div className="w-full flex items-center gap-2 mb-6">
                <Flame className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">Build Streak</h3>
             </div>
             <div className="relative w-32 h-32 flex items-center justify-center mb-4">
               <div className="absolute inset-0 rounded-full border-[6px] border-white/5" />
               <svg className="absolute inset-0 w-full h-full -rotate-90">
                 <circle cx="64" cy="64" r="61" fill="transparent" stroke="url(#streak-gradient)" strokeWidth="6" strokeDasharray="383" strokeDashoffset={383 * 0.3} className="transition-all duration-1000" strokeLinecap="round" />
                 <defs>
                   <linearGradient id="streak-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                     <stop offset="0%" stopColor="#f59e0b" />
                     <stop offset="100%" stopColor="#ef4444" />
                   </linearGradient>
                 </defs>
               </svg>
               <div className="text-center">
                 <div className="text-3xl font-black text-white">7</div>
                 <div className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mt-1">Days</div>
               </div>
               
               {/* Glowing dots */}
               <div className="absolute top-0 right-4 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24]" />
             </div>
             <p className="text-[11px] text-amber-500/80 font-bold">Keep building every day!</p>
          </div>

        </div>
      </div>
    </div>
  );
}

/* --- Sub Components --- */

function MetricCard({ label, value, trend, icon, trendColor }: any) {
  return (
    <div className="bg-obsidian border border-white/[0.06] rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">{label}</p>
        {icon}
      </div>
      <div className="text-2xl font-semibold text-white">{value}</div>
      <div className={cn("text-[10px] font-bold", trendColor)}>{trend}</div>
    </div>
  );
}

function PathCard({ icon, title, count, active }: any) {
  return (
    <div className={cn(
      "flex-none w-48 rounded-2xl border p-4 cursor-pointer transition-all",
      active ? "bg-white/[0.04] border-white/20 shadow-lg" : "bg-white/[0.01] border-white/[0.04] hover:bg-white/[0.03]"
    )}>
      <div className={cn("w-10 h-10 rounded-xl mb-3 flex items-center justify-center", active ? "bg-white/10" : "bg-white/5")}>
        {icon}
      </div>
      <h4 className="text-sm font-semibold text-white mb-1">{title}</h4>
      <p className="text-[10px] text-slate-500">{count}</p>
    </div>
  );
}

function ProjectCard({ match, featured, onStart }: any) {
  return (
    <div className={cn(
      "rounded-2xl border bg-obsidian flex flex-col overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl",
      featured ? "border-brand/40 shadow-[0_0_20px_rgba(202,138,247,0.1)]" : "border-white/[0.06] hover:border-white/20"
    )}>
      {/* Decorative Image Area */}
      <div className="h-32 w-full relative overflow-hidden bg-slate-900 border-b border-white/[0.05]">
        {/* Abstract UI placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-black opacity-80" />
        <div className={cn("absolute inset-0 opacity-30 mix-blend-overlay", featured ? "bg-brand" : "bg-cyan")} />
        
        {/* Fake UI elements */}
        <div className="absolute top-4 left-4 right-4 bottom-4 border border-white/10 rounded-lg flex flex-col overflow-hidden bg-black/40 backdrop-blur-sm">
           <div className="h-4 border-b border-white/10 flex items-center px-2 gap-1 bg-white/5">
             <div className="w-1.5 h-1.5 rounded-full bg-red-400/50" />
             <div className="w-1.5 h-1.5 rounded-full bg-amber-400/50" />
             <div className="w-1.5 h-1.5 rounded-full bg-green-400/50" />
           </div>
           <div className="flex-1 p-2 flex gap-2">
              <div className="w-1/4 h-full bg-white/5 rounded-md" />
              <div className="flex-1 space-y-2">
                 <div className="w-3/4 h-2 bg-white/10 rounded" />
                 <div className="w-1/2 h-2 bg-white/10 rounded" />
              </div>
           </div>
        </div>

        {/* Top Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-bold uppercase tracking-wider text-white">
          {featured ? <><Sparkles className="w-3 h-3 text-brand" /> High Impact</> : <><Target className="w-3 h-3 text-cyan-400" /> Recommended</>}
        </div>
        
        {/* Action button */}
        <button className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-sm font-bold text-white mb-2 leading-tight">{match.project.title}</h3>
        <p className="text-[11px] text-slate-400 leading-relaxed mb-4 flex-1 line-clamp-2">
          {match.project.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {match.project.requiredSkills.slice(0, 4).map((skill: string) => (
            <span key={skill} className="px-2 py-0.5 rounded text-[9px] font-medium bg-white/[0.04] text-slate-300 border border-white/[0.04]">
              {skill}
            </span>
          ))}
          {match.project.requiredSkills.length > 4 && (
            <span className="px-2 py-0.5 rounded text-[9px] font-medium bg-white/[0.04] text-slate-500">
              +{match.project.requiredSkills.length - 4}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="text-[10px] font-bold text-white bg-white/5 px-2 py-1 rounded">0% Completed</div>
          <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-brand w-0" />
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 mb-4 pt-4 border-t border-white/[0.06]">
          <span className="flex items-center gap-1.5"><BarChart2 className="w-3 h-3 text-emerald-400" /> {match.project.difficulty}</span>
          <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {match.project.estimatedHours}h est.</span>
          <span className="flex items-center gap-1.5 text-cyan-400 font-bold">+120 XP</span>
        </div>

        <button 
          onClick={onStart}
          className="w-full py-2.5 rounded-xl border border-white/10 text-xs font-bold text-white hover:bg-white/5 transition flex items-center justify-center gap-2"
        >
          <Play className="w-3.5 h-3.5" /> Start Project
        </button>
      </div>
    </div>
  );
}

function ActiveProjectItem({ match, onComplete }: any) {
  // Mock progress based on title length for variety
  const progress = Math.min(80, Math.max(15, match.project.title.length * 2));
  
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-obsidian border border-white/[0.06] hover:bg-white/[0.02] transition cursor-pointer group">
      <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center shrink-0">
        <FolderGit2 className="w-5 h-5 text-cyan-400" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-white truncate mb-1">{match.project.title}</h4>
        <div className="text-[10px] text-slate-500 truncate">{match.project.requiredSkills.join(", ")}</div>
      </div>
      
      <div className="hidden md:flex items-center gap-8 px-4 text-[11px] font-semibold">
         <div className="text-brand">In Progress</div>
         <div className="text-slate-300 w-8 text-right">{progress}%</div>
         <div className="text-slate-500 flex items-center gap-1 w-16"><Clock className="w-3 h-3" /> 18h left</div>
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); onComplete(); }}
        className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-slate-500 hover:text-emerald-400 hover:border-emerald-400 hover:bg-emerald-400/10 transition shrink-0"
        title="Mark Completed"
      >
        <Check className="w-4 h-4" />
      </button>
      
      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition" />
    </div>
  );
}

function StatRow({ icon, label, value }: any) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-3 text-slate-400">
        <div className="w-6 h-6 rounded flex items-center justify-center bg-white/[0.02] border border-white/[0.05]">
          {icon}
        </div>
        <span>{label}</span>
      </div>
      <span className="font-bold text-white">{value}</span>
    </div>
  );
}
