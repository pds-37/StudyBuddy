import { useEffect, useState } from "react";
import { FolderGit2, Check, Clock, Target, Sparkles, Code2, Layers, Cpu, Server, Plus, ArrowRight, Brain, Zap, Send, Play, BarChart2, Briefcase, Award, Flame, Monitor, HardDrive, Smartphone, ChevronRight, MoreHorizontal, LayoutDashboard } from "lucide-react";
import { useProjectsStore } from "../../../store/projects-store";
import { useAppStore } from "../../../store/app-store";
import { logBehavior } from "../../../lib/api/behavior";
import { Link } from "react-router-dom";
import { cn } from "../../../lib/utils/cn";

export function CapstoneProjects() {
  const { matches, mentorInsights, loading, generating, error, fetchMatches, updateStatus, generateCustom } = useProjectsStore();
  const user = useAppStore(state => state.user);
  
  const [ideaPrompt, setIdeaPrompt] = useState("");

  const handleGenerate = async () => {
    if (!ideaPrompt.trim()) return;
    await generateCustom(ideaPrompt);
    setIdeaPrompt("");
  };

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  if (!user?.targetRoles || user.targetRoles.length === 0) {
    return (
      <div className="rounded-xl border border-amber-500/20 bg-amber-50 bg-amber-500/10 p-6">
        <h3 className="text-lg font-medium text-amber-700 text-amber-200">Target Role Required</h3>
        <p className="mt-1 text-sm text-amber-600 text-amber-200/70">Set your target role in your profile to get project recommendations.</p>
        <Link to="/onboarding" className="mt-4 inline-block bg-amber-100 bg-amber-500/20 text-amber-700 text-amber-300 hover:bg-amber-200 hover:bg-amber-500/30 px-4 py-2 rounded-lg text-sm font-medium">
          Go to Onboarding
        </Link>
      </div>
    );
  }

  if (loading && matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-500 text-slate-400 space-y-4">
        <FolderGit2 className="w-8 h-8 animate-pulse text-cyan-600 text-cyan-400" />
        <p>Analyzing industry trends for project recommendations...</p>
      </div>
    );
  }

  const recommendedProjects = matches.filter(m => m.status === 'recommended');
  const activeProjects = matches.filter(m => m.status === 'in_progress');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Main Content */}
        <div className="space-y-8">

          {/* Recommended Projects */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500 text-emerald-400" /> Recommended Projects for You
              </h2>
              <button className="text-[10px] uppercase font-bold tracking-widest text-slate-500 text-slate-400 border border-white/10 border-white/10 px-3 py-1.5 rounded-lg hover:bg-transparent hover:bg-transparent bg-transparent bg-white/5 transition flex items-center gap-1.5">
                Personalize <BarChart2 className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recommendedProjects.slice(0, 3).map((match, idx) => (
                <ProjectCard key={match.id} match={match} featured={idx === 0} onStart={() => updateStatus(match.id, 'in_progress')} />
              ))}
              {recommendedProjects.length === 0 && (
                <div className="col-span-3 text-center py-10 text-slate-500 border border-white/10 border-white/10 rounded-2xl border-dashed">
                  No recommended projects at the moment. Update your skills to see more!
                </div>
              )}
            </div>
          </div>

          {/* Active Projects */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500 text-amber-400" /> Your Active Projects
              </h2>
              <button className="text-[10px] uppercase font-bold tracking-widest text-slate-500 hover:text-slate-800 hover:text-white text-white text-white transition">
                View All Projects →
              </button>
            </div>
            <div className="space-y-3">
              {activeProjects.map((match) => (
                <ActiveProjectItem key={match.id} match={match} onComplete={() => updateStatus(match.id, 'completed')} />
              ))}
              {activeProjects.length === 0 && (
                <div className="text-center py-6 text-slate-500 border border-white/10 border-white/5 rounded-2xl bg-transparent bg-white/[0.01]">
                  You have no active projects. Start one from the recommendations!
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          
          {/* AI Project Mentor */}
          <div className="rounded-3xl border border-white/10 border-white/[0.06] bg-transparent bg-obsidian">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-brand" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 text-slate-300">AI Project Mentor</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-transparent bg-white/[0.03] border border-slate-100 border-white/[0.06]">
                <p className="text-xs text-white text-white font-medium mb-1">
                  {mentorInsights?.encouragement || "You're doing great! 🔥"}
                </p>
                <p className="text-[11px] text-slate-400 text-slate-400 leading-relaxed">
                  Focus on completing 1 project end-to-end to boost your interview confidence.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-brand/5 border border-brand/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
                <h4 className="text-[11px] font-bold text-white text-white mb-1">
                  {mentorInsights?.focusArea?.title || "Focus Area"}
                </h4>
                <p className="text-[11px] text-slate-300 text-slate-300 mb-4 leading-relaxed relative z-10">
                  {mentorInsights?.focusArea?.description || "Backend integration is your weakest area. Try building more full-stack projects."}
                </p>
                <button className="w-full py-2 rounded-lg bg-brand/10 bg-brand/20 text-brand text-[10px] font-bold uppercase tracking-widest hover:bg-brand/20 hover:bg-brand/30 transition border border-brand/20 border-brand/30 relative z-10">
                  {mentorInsights?.focusArea?.action || "Show Recommendations"}
                </button>
              </div>
            </div>
          </div>

          {/* Create with AI */}
          <div className="rounded-3xl border border-white/10 border-white/[0.06] bg-transparent bg-obsidian">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-cyan-500 text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 text-slate-300">Create with AI</h3>
            </div>
            <p className="text-[11px] text-slate-500 text-slate-400 mb-4">Describe your idea and let Veda plan it for you.</p>
            <div className="space-y-3">
              <input 
                type="text" 
                value={ideaPrompt}
                onChange={(e) => setIdeaPrompt(e.target.value)}
                placeholder="E.g. AI resume matcher..."
                className="w-full bg-transparent bg-white/[0.03] border border-white/10 border-white/10 rounded-xl px-3 py-2.5 text-sm text-white text-white placeholder-slate-400 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
              />
              <button 
                onClick={handleGenerate}
                disabled={generating || !ideaPrompt.trim()}
                className="w-full py-2.5 rounded-xl bg-brand text-white text-white text-white text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand/90 transition shadow-[0_0_15px_rgba(202,138,247,0.3)] disabled:opacity-50 disabled:shadow-none"
              >
                {generating ? <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />} 
                {generating ? "Generating..." : "Generate Project"}
              </button>
            </div>
          </div>



        </div>
      </div>
    </div>
  );
}

/* --- Sub Components --- */

function ProjectCard({ match, featured, onStart }: any) {
  return (
    <div className={cn(
      "rounded-2xl border bg-transparent bg-obsidian",
      featured ? "border-brand/40 shadow-brand/10 shadow-[0_0_20px_rgba(202,138,247,0.1)]" : "border-white/10 border-white/[0.06] hover:border-slate-300 hover:border-white/20"
    )}>
      <div className="p-3 border-b border-white/10 border-white/[0.05] flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-wider text-slate-300">
          {featured ? <><Sparkles className="w-3 h-3 text-brand" /> High Impact</> : <><Target className="w-3 h-3 text-cyan-400" /> Recommended</>}
        </div>
        <button className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-white/10 transition">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-sm font-bold text-white text-white mb-2 leading-tight">{match.project.title}</h3>
        <p className="text-[11px] text-slate-400 text-slate-400 leading-relaxed mb-4 flex-1 line-clamp-2">
          {match.project.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {match.project.requiredSkills.slice(0, 4).map((skill: string) => (
            <span key={skill} className="px-2 py-0.5 rounded text-[9px] font-medium bg-transparent bg-white/[0.04] text-slate-300 text-slate-300 border border-white/10 border-white/[0.04]">
              {skill}
            </span>
          ))}
          {match.project.requiredSkills.length > 4 && (
            <span className="px-2 py-0.5 rounded text-[9px] font-medium bg-transparent bg-white/[0.04] text-slate-500">
              +{match.project.requiredSkills.length - 4}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="text-[10px] font-bold text-slate-400 text-white bg-transparent bg-white/5 px-2 py-1 rounded">0% Completed</div>
          <div className="h-1 flex-1 bg-slate-200 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-brand w-0" />
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 mb-4 pt-4 border-t border-slate-100 border-white/[0.06]">
          <span className="flex items-center gap-1.5"><BarChart2 className="w-3 h-3 text-emerald-500 text-emerald-400" /> {match.project.difficulty}</span>
          <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {match.project.estimatedHours}h est.</span>
          <span className="flex items-center gap-1.5 text-cyan-600 text-cyan-400 font-bold">+120 XP</span>
        </div>

        <button 
          onClick={onStart}
          className="w-full py-2.5 rounded-xl border border-white/10 border-white/10 text-xs font-bold text-slate-800 text-white hover:bg-transparent hover:bg-transparent bg-transparent bg-white/5 transition flex items-center justify-center gap-2 shadow-sm shadow-none"
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
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-transparent bg-obsidian">
      <div className="w-10 h-10 rounded-xl bg-cyan-50 bg-cyan-400/10 border border-cyan-200 border-cyan-400/20 flex items-center justify-center shrink-0">
        <FolderGit2 className="w-5 h-5 text-cyan-600 text-cyan-400" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-white text-white truncate mb-1">{match.project.title}</h4>
        <div className="text-[10px] text-slate-500 truncate">{match.project.requiredSkills.join(", ")}</div>
      </div>
      
      <div className="hidden md:flex items-center gap-8 px-4 text-[11px] font-semibold">
         <div className="text-brand">In Progress</div>
         <div className="text-slate-300 text-slate-300 w-8 text-right">{progress}%</div>
         <div className="text-slate-500 flex items-center gap-1 w-16"><Clock className="w-3 h-3" /> 18h left</div>
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); onComplete(); }}
        className="w-8 h-8 rounded-full border border-white/10 border-white/10 flex items-center justify-center text-slate-500 text-slate-500 text-slate-400 text-slate-500 hover:text-emerald-500 hover:text-emerald-400 hover:border-emerald-500 hover:border-emerald-400 hover:bg-emerald-50 hover:bg-emerald-400/10 transition shrink-0 bg-transparent bg-transparent"
        title="Mark Completed"
      >
        <Check className="w-4 h-4" />
      </button>
      
      <ChevronRight className="w-4 h-4 text-slate-500 text-slate-500 text-slate-400 text-slate-400 group-hover:text-slate-800 group-hover:text-white text-white text-white transition" />
    </div>
  );
}


