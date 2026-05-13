import { FileText, History, Sparkles, Wand2 } from "lucide-react";
import { useState, useEffect } from "react";
import { ResumeTailorWorkspace } from "../features/resume/components/ResumeTailorWorkspace";
import { getResumeVersions, type ResumeVersion } from "../lib/api/resume";
import { cn } from "../lib/utils/cn";

export function ResumePage() {
  const [activeTab, setActiveTab] = useState<"builder" | "versions">("builder");
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<ResumeVersion | null>(null);

  const handleViewResult = (v: ResumeVersion) => {
    setSelectedVersion(v);
    setActiveTab("builder");
  };

  useEffect(() => {
    if (activeTab === "versions") {
      void loadVersions();
    }
  }, [activeTab]);

  const loadVersions = async () => {
    try {
      const data = await getResumeVersions();
      setVersions(data);
    } catch (err) {
      console.error("Failed to load versions", err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#05070A] overflow-hidden">
      {/* Header */}
      <header className="shrink-0 px-8 pt-8 pb-5 border-b border-white/[0.04]">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-slate-100 flex items-center gap-3">
              Resume Intelligence
              <span className="text-cyan-400 text-[9px] border border-cyan-500/20 px-2 py-0.5 bg-cyan-500/5 font-bold tracking-wider uppercase">Strategic Engine</span>
            </h1>
            <p className="text-slate-600 text-[11px] mt-1.5 font-medium">Reposition your experience for high-impact roles using AI career intelligence.</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveTab("builder")}
              className={cn(
                "px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                activeTab === "builder" ? "text-brand border-b-2 border-brand" : "text-slate-600 hover:text-slate-300"
              )}
            >
              <Wand2 size={12} />
              Tailor Workspace
            </button>
            <button 
              onClick={() => setActiveTab("versions")}
              className={cn(
                "px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                activeTab === "versions" ? "text-brand border-b-2 border-brand" : "text-slate-600 hover:text-slate-300"
              )}
            >
              <History size={12} />
              Version History
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-[1600px] mx-auto h-full">
          {activeTab === "builder" ? (
            <ResumeTailorWorkspace initialResult={selectedVersion?.structuredData} />
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {versions.length > 0 ? (versions.map((v) => (
                <div key={v.id} className="group relative p-6 rounded-2xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                      <FileText size={20} />
                    </div>
                    <span className="text-[10px] font-mono text-slate-600">{new Date(v.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-200 mb-1">{v.versionName}</h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{v.targetRole}</p>
                  
                  <div className="mt-6 flex items-center gap-3">
                    <button 
                      onClick={() => handleViewResult(v)}
                      className="flex-1 px-4 py-2 rounded-xl bg-white/[0.05] text-[10px] font-bold text-slate-300 hover:bg-white/[0.08] transition-colors"
                    >
                      View Results
                    </button>
                  </div>
                </div>
              ))) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-slate-600 mb-6">
                    <History size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-200 mb-2">No versions yet</h3>
                  <p className="text-sm text-slate-500 max-w-sm">Once you tailor a resume, it will automatically appear here for your reference.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
