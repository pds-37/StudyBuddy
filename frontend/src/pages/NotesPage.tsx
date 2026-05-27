import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Brain,
  Target,
  Sparkles,
  History,
  AlertCircle,
  BookOpen,
  CheckCircle2,
  X,
  Loader2,
  Upload
} from "lucide-react";
import { cn } from "../lib/utils/cn";
import { useNotesStore } from "../store/notes-store";
import {
  KnowledgeMetrics,
  IntelligentNoteCard,
  KnowledgeInsightsPanel,
  TodaysFocusStrip,
  NoteDetailPanel
} from "../features/notes/components/KnowledgeComponents";
import type { ContradictionItem } from "../lib/api/notes";

const collections = [
  { id: "all", label: "All Knowledge", icon: BookOpen, color: "text-slate-400" },
  { id: "weak", label: "Weak Concepts", icon: AlertCircle, color: "text-red-400" },
  { id: "interview", label: "Interview Prep", icon: Target, color: "text-purple-400" },
  { id: "recent", label: "Recently Added", icon: History, color: "text-cyan-400" }
];

export function NotesPage() {
  const navigate = useNavigate();
  const {
    notes, loading, error,
    knowledgeHealth, revisionPriorities, concepts,
    contradictions,
    healthLoading, searchResults, searchLoading,
    activeNote,
    fetchNotes, createNote, ingestLearning, deleteNote,
    fetchKnowledgeHealth, fetchRevisionPriorities, fetchConcepts, fetchContradictions, resolveContradiction,
    searchNotes, clearSearch, setActiveNote, uploadStudyMaterial
  } = useNotesStore();

  const [activeCollection, setActiveCollection] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isInsightsVisible, setIsInsightsVisible] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [learningText, setLearningText] = useState("");
  const [newNote, setNewNote] = useState({ title: "", content: "", topic: "", tags: [] as string[] });
  const [automatedNote, setAutomatedNote] = useState<{
    id: string;
    title: string;
    cardCount: number;
    nextReviewAt?: string;
  } | null>(null);

  // Load everything on mount
  useEffect(() => {
    void fetchNotes();
    void fetchKnowledgeHealth();
    void fetchRevisionPriorities();
    void fetchConcepts();
    void fetchContradictions();
  }, [fetchNotes, fetchKnowledgeHealth, fetchRevisionPriorities, fetchConcepts, fetchContradictions]);

  // Semantic search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      clearSearch();
      return;
    }
    const timeout = setTimeout(() => {
      void searchNotes(searchQuery);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchQuery, searchNotes, clearSearch]);

  const handleCreateNote = async () => {
    if (!newNote.title || !newNote.content) return;
    const created = await createNote({
      ...newNote,
      tags: typeof newNote.tags === 'string' ? (newNote.tags as unknown as string).split(',').map((t: string) => t.trim()) : newNote.tags
    });
    setAutomatedNote({
      id: created.id,
      title: created.title,
      cardCount: created.metadata?.flashcards?.length ?? 0,
      nextReviewAt: created.nextReviewAt
    });
    setIsCreateModalOpen(false);
    setNewNote({ title: "", content: "", topic: "", tags: [] });
    // Refresh intelligence data after creating
    setTimeout(() => {
      void fetchKnowledgeHealth();
      void fetchRevisionPriorities();
      void fetchConcepts();
    }, 3000);
  };

  const handleIngestLearning = async () => {
    const text = learningText.trim();
    if (!text) return;
    const created = await ingestLearning(text);
    setAutomatedNote({
      id: created.id,
      title: created.title,
      cardCount: created.metadata?.flashcards?.length ?? 0,
      nextReviewAt: created.nextReviewAt
    });
    setLearningText("");
    setTimeout(() => {
      void fetchKnowledgeHealth();
      void fetchRevisionPriorities();
      void fetchConcepts();
    }, 1500);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const created = await uploadStudyMaterial(file);
      setAutomatedNote({
        id: created.id,
        title: created.title,
        cardCount: created.metadata?.flashcards?.length ?? 0,
        nextReviewAt: created.nextReviewAt
      });
      e.target.value = '';

      setTimeout(() => {
        void fetchKnowledgeHealth();
        void fetchRevisionPriorities();
        void fetchConcepts();
      }, 1500);
    } catch (err: any) {
      const serverMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      alert(`Upload failed: ${serverMsg}`);
      e.target.value = '';
    }
  };

  const handleNoteAction = useCallback((action: string, noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    if (action === "view" || action === "detail") {
      setActiveNote(note);
    } else if (action === "recall") {
      navigate(`/recall?noteId=${encodeURIComponent(noteId)}`);
    } else if (action === "delete") {
      if (confirm(`Are you sure you want to delete "${note.title}" from your knowledge graph?`)) {
        void deleteNote(noteId).then(() => {
          void fetchKnowledgeHealth();
          void fetchRevisionPriorities();
          void fetchConcepts();
        });
      }
    }
  }, [navigate, notes, setActiveNote, deleteNote, fetchKnowledgeHealth, fetchRevisionPriorities, fetchConcepts]);

  const handleStartRevision = useCallback((noteId: string) => {
    navigate(`/recall?noteId=${encodeURIComponent(noteId)}`);
  }, [navigate]);

  // Filter notes based on collection
  const filteredNotes = useMemo(() => {
    let result = searchQuery && searchResults.length > 0 ? searchResults : notes;

    if (searchQuery && !searchResults.length && !searchLoading) {
      // Fall back to local text search
      const q = searchQuery.toLowerCase();
      result = notes.filter((n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.topic?.toLowerCase().includes(q) ||
        n.concepts?.some(c => c.toLowerCase().includes(q))
      );
    }

    // Apply collection filters
    switch (activeCollection) {
      case "weak":
        result = result.filter(n => n.strength < 0.35);
        break;
      case "interview":
        result = result.filter(n => n.interviewImportance > 40);
        break;
      case "recent":
        result = [...result].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ).slice(0, 20);
        break;
    }

    return result;
  }, [notes, searchQuery, searchResults, searchLoading, activeCollection]);

  // Concept suggestions from AI analysis
  const suggestedConcepts = useMemo(() => {
    if (concepts.length === 0) return [];
    return concepts
      .filter(c => c.retentionState === "weakening" || c.retentionState === "critical")
      .slice(0, 5)
      .map(c => c.name);
  }, [concepts]);

  return (
    <div className="flex flex-col h-full overflow-hidden relative bg-background">
      {/* ─── TOP: KNOWLEDGE STATUS HEADER ─── */}
      <header className="shrink-0 px-8 pt-10 pb-8 z-20 border-b border-border glass-panel">
        <div className="max-w-[1600px] mx-auto space-y-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[1.25rem] bg-brand/10 flex items-center justify-center text-brand border border-brand/20 shadow-[0_0_40px_rgba(124,92,255,0.1)]">
                <Brain size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">
                  Knowledge Intelligence
                </h1>
                <p className="text-slate-500 text-sm mt-1 font-medium">
                  Transforming raw data into long-term structured mastery.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-8 py-4 bg-[#ffffff] text-slate-950 text-xs font-black uppercase tracking-[0.2em] hover:bg-transparent transition-all active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.1)] flex items-center gap-3 rounded-2xl"
              >
                <Plus size={16} strokeWidth={3} /> Ingest Knowledge
              </button>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-brand/5 rounded-3xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <div className="relative flex items-end gap-3 p-2 bg-white/[0.02] border border-white/[0.08] rounded-[1.5rem] focus-within:border-brand/40 transition-all">
              <label className="shrink-0 p-3 text-slate-400 hover:text-white cursor-pointer hover:bg-white/5 rounded-xl transition-all self-end mb-1">
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.txt,.md"
                  onChange={handleFileUpload}
                  disabled={loading}
                />
              </label>
              <textarea
                value={learningText}
                onChange={(event) => setLearningText(event.target.value)}
                placeholder="What did you learn today? Veda will extract concepts and build connections..."
                className="w-full bg-transparent border-0 px-2 py-4 text-base text-white outline-none placeholder:text-slate-500 focus:ring-0 resize-none min-h-[60px]"
              />
              <button
                type="button"
                onClick={handleIngestLearning}
                disabled={!learningText.trim() || loading}
                className="shrink-0 inline-flex items-center justify-center gap-2 bg-brand p-3 text-sm font-black uppercase text-white transition-all hover:bg-brand/90 disabled:opacity-40 rounded-xl mb-1 self-end"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                Ingest
              </button>
            </div>
          </div>

          {/* Live metrics bar */}
          <KnowledgeMetrics metrics={knowledgeHealth} />
        </div>
      </header>

      {/* ─── TODAY'S FOCUS STRIP ─── */}
      {revisionPriorities.length > 0 && (
        <div className="shrink-0 px-8 py-4 border-b border-white/[0.04]">
          <div className="max-w-[1600px] mx-auto">
            <TodaysFocusStrip
              priorities={revisionPriorities}
              onStartRevision={handleStartRevision}
            />
          </div>
        </div>
      )}

      {automatedNote && (
        <div className="shrink-0 px-8 py-4 border-b border-brand/10 bg-brand/[0.045]">
          <div className="max-w-[1600px] mx-auto flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand/25 bg-brand/10 text-brand">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Recall automation is ready for “{automatedNote.title}”</p>
                <p className="mt-1 text-xs text-slate-400">
                  {automatedNote.cardCount > 0
                    ? `${automatedNote.cardCount} flashcards were generated and scheduled for review.`
                    : "A focused recall prompt was scheduled from this note."}
                  {automatedNote.nextReviewAt ? ` Next review: ${new Date(automatedNote.nextReviewAt).toLocaleString()}.` : ""}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAutomatedNote(null)}
                className="rounded-lg border border-white/[0.08] px-4 py-2 text-xs font-semibold text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={() => navigate(`/recall?noteId=${encodeURIComponent(automatedNote.id)}`)}
                className="premium-button rounded-lg px-4 py-2 text-xs font-bold"
              >
                Start recall now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* ─── LEFT: COLLECTIONS SIDEBAR ─── */}
        <aside className="w-56 shrink-0 p-6 flex-col z-10 hidden xl:flex border-r border-white/[0.04]">
          <div className="space-y-8">
            <div className="space-y-1">
              <h3 className="px-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Collections</h3>
              {collections.map((col) => (
                <button
                  key={col.id}
                  onClick={() => setActiveCollection(col.id)}
                  className={cn(
                    "w-full px-2 py-1.5 flex items-center justify-between transition-all text-left",
                    activeCollection === col.id ? "text-brand" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  <span className="text-[11px] font-medium">{col.label}</span>
                  <span className="text-[9px] font-medium w-5 h-5 flex items-center justify-center rounded-full bg-white/[0.04]">
                    {col.id === "all" ? notes.length :
                     col.id === "weak" ? notes.filter(n => n.strength < 0.35).length :
                     col.id === "interview" ? notes.filter(n => n.interviewImportance > 40).length :
                     Math.min(notes.length, 20)}
                  </span>
                </button>
              ))}
            </div>

            {/* AI Suggested Weak Concepts */}
            {suggestedConcepts.length > 0 && (
              <div className="space-y-1">
                <h3 className="px-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Needs Attention
                </h3>
                <div className="space-y-0.5">
                  {suggestedConcepts.map(concept => (
                    <button
                      key={concept}
                      onClick={() => setSearchQuery(concept)}
                      className="w-full px-2 py-1.5 text-[10px] font-medium text-slate-500 hover:text-slate-300 text-left transition-colors flex items-center gap-2"
                    >
                      <div className="w-1 h-1 rounded-full bg-red-500/60" /> {concept}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Concept Count */}
            <div className="pt-4 border-t border-white/5">
              <div className="flex items-center justify-between text-[9px] font-medium text-slate-400">
                <span>Total concepts</span>
                <span className="text-brand">{knowledgeHealth?.totalConcepts || 0}</span>
              </div>
              <div className="flex items-center justify-between text-[9px] font-medium text-slate-400 mt-1">
                <span>Due today</span>
                <span className="text-amber-400">{knowledgeHealth?.dueCount || 0}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ─── CENTER: KNOWLEDGE FEED ─── */}
        <main className="flex-1 flex flex-col min-w-0 bg-transparent relative">
          {/* Semantic Search Bar */}
          <div className="px-8 py-5 sticky top-0 z-10 bg-background/80 backdrop-blur-md">
            <div className="relative w-full max-w-2xl group">
              <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Semantic search: 'graph thing', 'React optimization', 'closures'..."
                className="w-full bg-transparent border-b border-white/[0.08] pl-6 pr-8 py-2.5 text-sm text-white outline-none focus:border-brand transition-all placeholder-slate-600 font-medium"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(""); clearSearch(); }} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  <X size={14} />
                </button>
              )}
              {searchLoading && (
                <Loader2 size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-brand animate-spin" />
              )}
            </div>
          </div>

          {/* Notes Grid */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-2">
            <div className="max-w-[1400px] mx-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32 animate-pulse">
                  <div className="w-14 h-14 rounded-full border-4 border-brand/20 border-t-brand animate-spin mb-4" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synchronizing Knowledge Graph...</p>
                </div>
              ) : error ? (
                <div className="text-center py-32">
                  <AlertCircle size={32} className="text-red-400 mx-auto mb-4" />
                  <p className="text-sm text-red-400 mb-2">Failed to load notes</p>
                  <p className="text-xs text-slate-400">{error}</p>
                </div>
              ) : filteredNotes.length === 0 ? (
                <div className="text-center py-32">
                  <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand mx-auto mb-6">
                    <Brain size={32} />
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2">
                    {searchQuery ? "No matching concepts found." : "No concepts captured yet."}
                  </h2>
                  <p className="text-slate-500 text-xs mb-8 max-w-sm mx-auto font-medium">
                    {searchQuery
                      ? "Try a different search — Veda understands natural language like 'that React thing'."
                      : "Ingest your first note, PDF, or concept to start building your second brain."}
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="px-6 py-3 bg-brand text-white font-bold text-[10px] uppercase tracking-widest"
                    >
                      Add First Concept
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
                  {filteredNotes.map((note) => (
                    <IntelligentNoteCard
                      key={note.id}
                      note={note}
                      onAction={(action: string) => handleNoteAction(action, note.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* ─── RIGHT: KNOWLEDGE INSIGHTS PANEL ─── */}
        <AnimatePresence>
          {isInsightsVisible && (
            <Motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="shrink-0 p-6 hidden 2xl:flex flex-col z-10 border-l border-white/[0.04] overflow-y-auto custom-scrollbar"
            >
              <div className="min-w-[250px]">
              <KnowledgeInsightsPanel
                health={knowledgeHealth}
                priorities={revisionPriorities}
                loading={loading}
                onIngestClick={() => setIsCreateModalOpen(true)}
                onFileUpload={handleFileUpload}
              />
              <ContradictionReview
                items={contradictions}
                onOpen={(noteId) => {
                  const note = notes.find((item) => item.id === noteId);
                  if (note) setActiveNote(note);
                }}
                onResolve={(noteId) => void resolveContradiction(noteId, "Clarified from contradiction review.")}
              />
            </div>
          </Motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* ─── NOTE DETAIL PANEL ─── */}
      <AnimatePresence>
        {activeNote && (
          <>
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveNote(null)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <NoteDetailPanel
              note={activeNote}
              onClose={() => setActiveNote(null)}
            />
          </>
        )}
      </AnimatePresence>

      {/* ─── CREATE NOTE MODAL ─── */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <Motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl glass-panel p-8"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Brain size={160} className="text-brand" />
              </div>

              <div className="relative z-10 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-white tracking-tight">Ingest New Knowledge</h2>
                  <p className="text-slate-500 text-xs mt-1">Add a new concept to Veda&apos;s knowledge intelligence engine.</p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Concept Title</label>
                    <input
                      autoFocus
                      placeholder="e.g., React Lifecycle Hooks"
                      className="w-full bg-transparent border-b border-white/10 px-0 py-2.5 text-white placeholder-slate-600 focus:border-brand transition-all outline-none"
                      value={newNote.title}
                      onChange={e => setNewNote({ ...newNote, title: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Topic</label>
                      <input
                        placeholder="e.g., Frontend"
                        className="w-full bg-transparent border-b border-white/10 px-0 py-2.5 text-sm text-white placeholder-slate-600 focus:border-brand transition-all outline-none"
                        value={newNote.topic}
                        onChange={e => setNewNote({ ...newNote, topic: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Tags (comma separated)</label>
                      <input
                        placeholder="e.g., react, hooks, interview"
                        className="w-full bg-transparent border-b border-white/10 px-0 py-2.5 text-sm text-white placeholder-slate-600 focus:border-brand transition-all outline-none"
                        onChange={e => setNewNote({ ...newNote, tags: e.target.value as any })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Content</label>
                    <textarea
                      placeholder="Explain the concept in detail — Veda will extract concepts, generate flashcards, and build knowledge connections..."
                      rows={6}
                      className="w-full bg-transparent border border-white/10 px-4 py-3 mt-1 text-sm text-white placeholder-slate-600 focus:border-brand transition-all outline-none resize-none"
                      value={newNote.content}
                      onChange={e => setNewNote({ ...newNote, content: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 py-2.5 bg-white/[0.04] text-slate-400 font-semibold text-[10px] uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateNote}
                    disabled={!newNote.title || !newNote.content}
                    className="flex-[2] py-2.5 bg-brand text-white font-bold text-[10px] uppercase tracking-widest disabled:opacity-40 hover:bg-brand/90 transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles size={13} /> Sync to Veda Brain
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

function ContradictionReview({
  items,
  onOpen,
  onResolve
}: {
  items: ContradictionItem[];
  onOpen: (noteId: string) => void;
  onResolve: (noteId: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className="mt-8 border-t border-white/5 pt-6">
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Contradiction Review</h3>
      <div className="mt-4 space-y-3">
        {items.slice(0, 5).map((item) => (
          <div key={item.noteId} className="border border-amber-400/20 bg-amber-400/5 p-3">
            <button
              type="button"
              onClick={() => onOpen(item.noteId)}
              className="block w-full text-left"
            >
              <p className="text-[11px] font-semibold text-slate-200 line-clamp-1">{item.title}</p>
              <p className="mt-1 text-[10px] leading-4 text-slate-500 line-clamp-2">{item.signals[0]}</p>
            </button>
            <button
              type="button"
              onClick={() => onResolve(item.noteId)}
              className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-300 hover:text-emerald-200"
            >
              <CheckCircle2 size={12} />
              Mark clarified
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
