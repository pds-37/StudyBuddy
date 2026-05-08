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
import { 
  KnowledgeMetrics, 
  IntelligentNoteCard, 
  KnowledgeInsightsPanel 
} from "../features/notes/components/KnowledgeComponents";

const collections = [
  { id: "all", label: "All Knowledge", icon: BookOpen, color: "text-slate-500 dark:text-slate-500 dark:text-slate-400" },
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
    <div className="flex flex-col h-full overflow-hidden relative bg-white dark:bg-obsidian bg-white dark:bg-obsidian$4">
      {/* ─── TOP KNOWLEDGE STATUS ─── */}
      <header className="shrink-0 px-8 pt-10 pb-6 z-20 border-b border-white/5">
         <div className="max-w-[1600px] mx-auto space-y-10">
            <div className="flex items-center justify-between">
               <div>
                  <h1 className="text-lg font-medium text-slate-100 flex items-center gap-3">
                     Knowledge OS <span className="text-brand text-[10px] border border-brand/20 px-2 py-0.5 rounded-full bg-brand/5">Veda Brain v2</span>
                  </h1>
                  <p className="text-slate-500 dark:text-slate-500 dark:text-slate-400 text-xs mt-2 font-medium">Transforming scattered learning into structured long-term mastery.</p>
               </div>
               <button 
                 onClick={() => setIsCreateModalOpen(true)}
                 className="px-6 py-2.5 bg-brand text-slate-900 dark:text-slate-900 dark:text-white text-xs font-semibold hover:bg-brand/90 transition-colors"
               >
                  Ingest knowledge
               </button>
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
        <aside className="w-64 shrink-0 p-8 flex flex-col z-10 hidden xl:flex">
           <div className="space-y-10">
              <div className="space-y-2">
                 <h3 className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Collections</h3>
                 {collections.map((col, idx) => (
                   <button 
                     key={col.id} 
                     onClick={() => setActiveCollection(col.id)}
                     className={cn(
                       "w-full px-2 py-1.5 flex items-center justify-between transition-all",
                       activeCollection === col.id ? "text-brand" : "text-slate-500 dark:text-slate-500 dark:text-slate-400 hover:text-slate-200"
                     )}
                   >
                      <span className="text-xs font-medium">{col.label}</span>
                      <span className="text-[10px] font-medium w-5 h-5 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-50 dark:bg-white/5">
                        {idx === 0 ? notes.length : Math.max(1, 4 - idx)}
                      </span>
                   </button>
                 ))}
              </div>

              <div className="space-y-2">
                 <h3 className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">AI Suggested</h3>
                 <div className="space-y-1">
                    {["Dynamic Programming", "React Lifecycle", "System Design"].map(tag => (
                      <button key={tag} className="w-full px-2 py-1.5 hover:bg-white/[0.02] text-[11px] font-medium text-slate-500 dark:text-slate-500 dark:text-slate-400 hover:text-slate-200 text-left transition-colors flex items-center gap-3">
                         <div className="w-1 h-1 rounded-full bg-brand/60" /> {tag}
                      </button>
                    ))}
                 </div>
              </div>
           </div>
        </aside>

        {/* ─── CENTER PANEL: KNOWLEDGE FEED ─── */}
        <main className="flex-1 flex flex-col min-w-0 bg-transparent relative">
           {/* Command Bar / Search */}
           <div className="px-8 py-6 sticky top-0 z-10 bg-white dark:bg-obsidian bg-white dark:bg-obsidian$4">
              <div className="relative w-full max-w-2xl group">
                 <input 
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Semantic search: 'graph thing' or 'React state'..."
                   className="w-full bg-transparent border-b border-slate-200 dark:border-slate-200 dark:border-white/10 px-0 py-3 text-sm text-slate-900 dark:text-slate-900 dark:text-white outline-none focus:border-brand transition-all placeholder-slate-500 font-medium"
                 />
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
                       <h2 className="text-2xl font-black text-slate-900 dark:text-slate-900 dark:text-white mb-2">No concepts captured yet.</h2>
                       <p className="text-slate-500 text-sm mb-10 max-w-sm mx-auto font-medium">Ingest your first note, PDF, or video to start building your second brain.</p>
                       <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-8 py-4 rounded-2xl bg-brand text-slate-900 dark:text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest shadow-glow"
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
               animate={{ width: 320, opacity: 1 }}
               exit={{ width: 0, opacity: 0 }}
               className="shrink-0 p-8 hidden 2xl:flex flex-col z-10 border-l border-white/5"
             >
                <div className="min-w-[260px]">
                   <KnowledgeInsightsPanel />

                   <div className="pt-10 mt-10 border-t border-white/5">
                      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">Knowledge Recovery Digest</h3>
                      <div className="space-y-4">
                         <DigestItem label="Revise Graph BFS" />
                         <DigestItem label="Review DP Tables" />
                         <DigestItem label="Mock Concept: React Hooks" />
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
              className="absolute inset-0 bg-white dark:bg-obsidian bg-white dark:bg-obsidian$4"
            />
            <Motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-obsidian bg-white dark:bg-obsidian$4"
            >
              <div className="absolute top-0 right-0 p-10 opacity-5">
                <Brain size={200} className="text-brand" />
              </div>

              <div className="relative z-10 space-y-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-slate-900 dark:text-white tracking-tight">Ingest New Knowledge</h2>
                  <p className="text-slate-500 dark:text-slate-500 dark:text-slate-400 text-sm mt-1">Add a new concept to Veda's memory engine.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Concept Title</label>
                    <input 
                      autoFocus
                      placeholder="e.g., React Lifecycle Hooks"
                      className="w-full bg-transparent border-b border-slate-200 dark:border-slate-200 dark:border-white/10 px-0 py-3 text-slate-900 dark:text-slate-900 dark:text-white placeholder-slate-600 focus:border-brand transition-all outline-none"
                      value={newNote.title}
                      onChange={e => setNewNote({ ...newNote, title: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Topic</label>
                      <input 
                        placeholder="e.g., Frontend"
                        className="w-full bg-transparent border-b border-slate-200 dark:border-slate-200 dark:border-white/10 px-0 py-3 text-sm text-slate-900 dark:text-slate-900 dark:text-white placeholder-slate-600 focus:border-brand transition-all outline-none"
                        value={newNote.topic}
                        onChange={e => setNewNote({ ...newNote, topic: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tags (comma separated)</label>
                      <input 
                        placeholder="e.g., react, hooks, interview"
                        className="w-full bg-transparent border-b border-slate-200 dark:border-slate-200 dark:border-white/10 px-0 py-3 text-sm text-slate-900 dark:text-slate-900 dark:text-white placeholder-slate-600 focus:border-brand transition-all outline-none"
                        onChange={e => setNewNote({ ...newNote, tags: e.target.value as any })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Content</label>
                    <textarea 
                      placeholder="Explain the concept in detail..."
                      rows={6}
                      className="w-full bg-transparent border border-slate-200 dark:border-slate-200 dark:border-white/10 px-4 py-3 mt-2 text-sm text-slate-900 dark:text-slate-900 dark:text-white placeholder-slate-600 focus:border-brand transition-all outline-none resize-none"
                      value={newNote.content}
                      onChange={e => setNewNote({ ...newNote, content: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 py-3 bg-slate-50 dark:bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-500 dark:text-slate-400 font-semibold text-[10px] uppercase tracking-widest hover:text-slate-900 dark:text-slate-900 dark:text-white hover:bg-slate-100 dark:bg-slate-100 dark:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCreateNote}
                    disabled={!newNote.title || !newNote.content}
                    className="flex-[2] py-3 bg-brand text-slate-900 dark:text-slate-900 dark:text-white font-semibold text-[10px] uppercase tracking-widest disabled:opacity-50 transition-all"
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

function DigestItem({ label }: any) {
  return (
    <div className="group py-2 transition-all cursor-pointer flex items-center justify-between border-b border-white/5 last:border-0">
       <span className="text-[11px] font-medium text-slate-500 dark:text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:text-slate-900 dark:text-white transition-colors">{label}</span>
    </div>
  );
}