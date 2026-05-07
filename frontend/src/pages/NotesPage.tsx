import { useEffect, useState, useMemo } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  Brain, 
  Target, 
  Sparkles, 
  History,
  AlertCircle,
  MessageSquare,
  Zap,
  MoreVertical,
  ChevronRight,
  BookOpen,
  Command,
  PlusCircle
} from "lucide-react";
import { cn } from "../lib/utils/cn";
import { useNotesStore } from "../store/notes-store";
import { NebulaBackground } from "../components/common/NebulaBackground";
import { 
  KnowledgeMetrics, 
  IntelligentNoteCard, 
  KnowledgeInsightsPanel 
} from "../features/notes/components/KnowledgeComponents";

const collections = [
  { id: "all", label: "All Knowledge", icon: BookOpen, color: "text-slate-400" },
  { id: "recall", label: "Recall Queue", icon: Brain, color: "text-purple-400" },
  { id: "weak", label: "Weak Concepts", icon: AlertCircle, color: "text-red-400" },
  { id: "interview", label: "Interview Prep", icon: Target, color: "text-emerald-400" },
  { id: "recent", label: "Recent Uploads", icon: History, color: "text-cyan-400" }
];

export function NotesPage() {
  const { notes, loading, fetchNotes, createNote } = useNotesStore();
  const [activeCollection, setActiveCollection] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isInsightsVisible, setIsInsightsVisible] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "", topic: "", tags: [] });

  useEffect(() => {
    void fetchNotes();
  }, [fetchNotes]);

  const handleCreateNote = async () => {
    if (!newNote.title || !newNote.content) return;
    await createNote({
      ...newNote,
      tags: typeof newNote.tags === 'string' ? (newNote.tags as string).split(',').map(t => t.trim()) : newNote.tags
    });
    setIsCreateModalOpen(false);
    setNewNote({ title: "", content: "", topic: "", tags: [] });
  };

  const filteredNotes = useMemo(() => {
    let result = notes;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((n: any) => 
        n.title.toLowerCase().includes(q) || 
        n.content.toLowerCase().includes(q) ||
        n.topic?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [notes, searchQuery]);

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      <NebulaBackground opacity={0.2} showGrid={false} />

      {/* ─── TOP KNOWLEDGE STATUS ─── */}
      <header className="shrink-0 px-8 py-8 border-b border-white/[0.06] bg-obsidian/40 backdrop-blur-3xl z-20">
         <div className="max-w-[1600px] mx-auto space-y-8">
            <div className="flex items-center justify-between">
               <div>
                  <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                     Knowledge OS <span className="text-brand font-normal text-sm border border-brand/20 px-2 py-0.5 rounded-lg bg-brand/5">Veda Brain v2</span>
                  </h1>
                  <p className="text-slate-400 text-sm mt-1 font-medium italic">Transforming scattered learning into structured long-term mastery.</p>
               </div>
               <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-obsidian font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-glow"
                  >
                     <PlusCircle size={18} /> Ingest Knowledge
                  </button>
               </div>

            </div>

            <KnowledgeMetrics 
               metrics={{ 
                  concepts: notes.length * 4, 
                  recallHealth: 81, 
                  retention: "Strong", 
                  roadmapContribution: 12 
               }} 
            />
         </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* ─── LEFT PANEL: COLLECTIONS ─── */}
        <aside className="w-80 shrink-0 border-r border-white/[0.06] bg-ink/20 backdrop-blur-3xl p-8 flex flex-col z-10 hidden xl:flex">
           <div className="space-y-8">
              <div className="space-y-2">
                 <h3 className="px-2 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4">Semantic Collections</h3>
                 {collections.map(col => (
                   <button 
                     key={col.id} 
                     onClick={() => setActiveCollection(col.id)}
                     className={cn(
                       "w-full p-4 rounded-2xl flex items-center justify-between transition-all group",
                       activeCollection === col.id ? "bg-white/[0.05] text-white" : "text-slate-500 hover:text-white"
                     )}
                   >
                      <div className="flex items-center gap-4">
                         <col.icon size={18} className={cn("transition-transform group-hover:scale-110", activeCollection === col.id ? col.color : "")} />
                         <span className="text-sm font-bold">{col.label}</span>
                      </div>
                      {activeCollection === col.id && <ChevronRight size={14} className="text-brand" />}
                   </button>
                 ))}
              </div>

              <div className="pt-8 border-t border-white/5 space-y-4">
                 <h3 className="px-2 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">AI Suggested</h3>
                 <div className="space-y-1">
                    {["Dynamic Programming", "React Lifecycle", "System Design"].map(tag => (
                      <button key={tag} className="w-full p-3 rounded-xl hover:bg-white/[0.02] text-xs font-bold text-slate-500 hover:text-white text-left transition-colors flex items-center gap-3">
                         <div className="w-1.5 h-1.5 rounded-full bg-brand/40" /> {tag}
                      </button>
                    ))}
                 </div>
              </div>
           </div>
        </aside>

        {/* ─── CENTER PANEL: KNOWLEDGE FEED ─── */}
        <main className="flex-1 flex flex-col min-w-0 bg-ink/10 relative">
           {/* Command Bar / Search */}
           <div className="px-8 py-6 border-b border-white/[0.06] flex items-center justify-between bg-obsidian/20 backdrop-blur-xl sticky top-0 z-10">
              <div className="relative flex-1 max-w-2xl group">
                 <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand transition-colors" />
                 <input 
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Semantic search: 'That graph thing' or 'React state'..."
                   className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-sm text-white outline-none focus:border-brand/40 focus:bg-white/[0.05] transition-all placeholder-slate-600 font-medium"
                 />
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    <Command size={10} /> S
                 </div>
              </div>

              <div className="flex items-center gap-4">
                 <button className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-slate-400 hover:text-white transition-all">
                    <Filter size={18} />
                 </button>
                 <div className="flex items-center p-1 rounded-xl bg-white/[0.03] border border-white/5">
                    <button className="p-2 rounded-lg bg-brand text-white shadow-glow"><LayoutGrid size={16} /></button>
                    <button className="p-2 rounded-lg text-slate-500 hover:text-white"><List size={16} /></button>
                 </div>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
              <div className="max-w-[1400px] mx-auto">
                 {loading ? (
                   <div className="flex flex-col items-center justify-center py-40 animate-pulse">
                      <div className="w-16 h-16 rounded-full border-4 border-brand/20 border-t-brand animate-spin mb-4" />
                      <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Synchronizing Knowledge Graph...</p>
                   </div>
                 ) : filteredNotes.length === 0 ? (
                    <div className="text-center py-40">
                       <div className="w-20 h-20 rounded-[2rem] bg-brand/10 border border-brand/20 flex items-center justify-center text-brand mx-auto mb-8">
                          <Brain size={40} />
                       </div>
                       <h2 className="text-2xl font-black text-white mb-2">No concepts captured yet.</h2>
                       <p className="text-slate-500 text-sm mb-10 max-w-sm mx-auto font-medium">Ingest your first note, PDF, or video to start building your second brain.</p>
                       <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-8 py-4 rounded-2xl bg-brand text-white font-black text-xs uppercase tracking-widest shadow-glow"
                       >
                          Add First Concept
                       </button>
                    </div>
                 ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
                      {filteredNotes.map((note: any, i: number) => (
                        <IntelligentNoteCard 
                          key={note.id} 
                          note={note} 
                          onAction={(action: string) => console.log(action, note.id)} 
                        />
                      ))}
                   </div>
                 )}
              </div>
           </div>
        </main>

        {/* ─── RIGHT PANEL: KNOWLEDGE INSIGHTS ─── */}
        <AnimatePresence>
           {isInsightsVisible && (
             <Motion.aside 
               initial={{ width: 0, opacity: 0 }}
               animate={{ width: 400, opacity: 1 }}
               exit={{ width: 0, opacity: 0 }}
               className="shrink-0 border-l border-white/[0.06] bg-ink/20 backdrop-blur-3xl overflow-hidden hidden 2xl:flex flex-col z-10"
             >
                <div className="p-10 space-y-12 min-w-[400px]">
                   <KnowledgeInsightsPanel />

                   <div className="pt-10 border-t border-white/5">
                      <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-6">Knowledge Recovery Digest</h3>
                      <div className="space-y-4">
                         <DigestItem label="Revise Graph BFS" time="5 mins" icon={History} color="text-amber-400" />
                         <DigestItem label="Review DP Tables" time="10 mins" icon={Target} color="text-red-400" />
                         <DigestItem label="Mock Concept: React Hooks" time="15 mins" icon={Brain} color="text-purple-400" />
                            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-brand/10 to-purple-600/10 border border-brand/20 relative overflow-hidden group cursor-pointer">
                               <div className="relative z-10">
                                  <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                                     <Sparkles size={16} className="text-brand" /> Mastery Level Up
                                  </h4>
                                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                     You've captured 12 system design concepts this week. Ready for a mock interview?
                                  </p>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </Motion.aside>
            )}
         </AnimatePresence>
      </div>

      {/* ─── CREATE NOTE MODAL ─── */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <Motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-obsidian/80 backdrop-blur-xl"
            />
            <Motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-panel border border-white/10 rounded-[3rem] p-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-10 opacity-5">
                <Brain size={200} className="text-brand" />
              </div>

              <div className="relative z-10 space-y-8">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Ingest New Knowledge</h2>
                  <p className="text-slate-400 text-sm mt-1">Add a new concept to Veda's memory engine.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Concept Title</label>
                    <input 
                      autoFocus
                      placeholder="e.g., React Lifecycle Hooks"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-slate-600 focus:border-brand/40 transition-all outline-none"
                      value={newNote.title}
                      onChange={e => setNewNote({ ...newNote, title: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Topic</label>
                      <input 
                        placeholder="e.g., Frontend"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder-slate-600 focus:border-brand/40 transition-all outline-none"
                        value={newNote.topic}
                        onChange={e => setNewNote({ ...newNote, topic: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tags (comma separated)</label>
                      <input 
                        placeholder="e.g., react, hooks, interview"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder-slate-600 focus:border-brand/40 transition-all outline-none"
                        onChange={e => setNewNote({ ...newNote, tags: e.target.value as any })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Content</label>
                    <textarea 
                      placeholder="Explain the concept in detail..."
                      rows={6}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder-slate-600 focus:border-brand/40 transition-all outline-none resize-none"
                      value={newNote.content}
                      onChange={e => setNewNote({ ...newNote, content: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl bg-white/[0.05] text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCreateNote}
                    disabled={!newNote.title || !newNote.content}
                    className="flex-[2] py-4 rounded-2xl bg-brand text-white font-black text-[10px] uppercase tracking-widest shadow-glow disabled:opacity-50 disabled:shadow-none transition-all"
                  >
                    Sync to Veda Brain
                  </button>
                </div>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>

  );
}

function DigestItem({ label, time, icon: Icon, color }: any) {
  return (
    <div className="group p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all cursor-pointer flex items-center justify-between">
       <div className="flex items-center gap-4">
          <div className={cn("p-2 rounded-xl bg-white/[0.04]", color)}>
             <Icon size={16} />
          </div>
          <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{label}</span>
       </div>
       <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{time}</span>
    </div>
  );
}