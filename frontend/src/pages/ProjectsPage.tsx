import { CapstoneProjects } from "../features/projects/components/CapstoneProjects";
import { FolderGit2, Play } from "lucide-react";

export function ProjectsPage() {
  return (
    <section className="space-y-6 max-w-[1400px] mx-auto pb-10">
      <div className="py-6 border-b border-white/10 border-white/[0.04] flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FolderGit2 className="w-5 h-5 text-brand" />
            <h1 className="text-3xl tracking-tight font-bold text-white text-white text-white text-white">Projects</h1>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-slate-400 text-slate-500 text-slate-500 text-slate-400">Build real-world experience for your target role.</p>
            <button className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-transparent bg-transparent bg-transparent bg-white/5 border border-white/10 border-white/10 border-white/10 border-white/10 hover:bg-slate-200 hover:bg-transparent bg-transparent bg-white/10 transition text-[10px] font-bold uppercase tracking-widest text-slate-500 text-slate-300 text-slate-300 text-slate-300">
              <Play className="w-3 h-3" /> How Projects Work
            </button>
          </div>
        </div>
        <div className="hidden md:flex">
          <button className="px-4 py-2 rounded-xl bg-brand/10 bg-brand/20 text-brand border border-brand/20 hover:bg-brand hover:text-white text-white text-white transition text-xs font-bold flex items-center gap-2">
            <FolderGit2 className="w-4 h-4" /> + New Project
          </button>
        </div>
      </div>
      <CapstoneProjects />
    </section>
  );
}
