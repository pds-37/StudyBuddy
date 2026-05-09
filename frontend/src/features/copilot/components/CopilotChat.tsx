import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  Bot,
  Clock3,
  Loader2,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  UserRound,
  PanelLeftClose,
  PanelLeftOpen,
  Brain,
  Zap,
  Flame,
  Target,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  History,
  LayoutDashboard,
  ShieldAlert,
  ChevronRight,
  Command
} from "lucide-react";
import { cn } from "../../../lib/utils/cn";
import { NebulaBackground } from "../../../components/common/NebulaBackground";
import { formatTime, formatDate } from "../../../lib/utils/date";
import { useCopilotStore } from "../../../store/copilot-store";
import { useAppStore } from "../../../store/app-store";
import type { CopilotMessage } from "@studybuddy/shared";
import * as notesApi from "../../../lib/api/notes";

import { 
  InsightCard, 
  MissionCard, 
  FocusSprintCard, 
  RecallChallenge, 
  WarningCard, 
  RecoveryPlanCard 
} from "./MentorCards";

const suggestedPrompts = [
  "What should I focus on right now?",
  "Why am I stuck lately?",
  "Create a 1-hour study session",
  "Analyze my roadmap progress"
] as const;

const categories = [
  { id: "career", label: "Career Path", icon: Target, color: "text-cyan-400" },
  { id: "dsa", label: "DSA & Mastery", icon: Brain, color: "text-purple-400" },
  { id: "recall", label: "Recall Recovery", icon: RefreshCw, color: "text-amber-400" },
  { id: "recovery", label: "Focus Sprint", icon: Zap, color: "text-blue-400" }
];

export function CopilotChat() {
  const {
    conversations,
    currentConversation,
    loading,
    sending,
    error,
    sendMessage: storeSendMessage,
    createNewConversation,
    selectConversation,
    fetchConversations,
    clearError
  } = useCopilotStore();

  const user = useAppStore(state => state.user);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isInsightsVisible, setIsInsightsVisible] = useState(true);
  const [draft, setDraft] = useState("");
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const visibleMessages = useMemo(
    () => currentConversation?.messages.filter((message) => message.role !== "system") ?? [],
    [currentConversation?.messages]
  );

  useEffect(() => {
    void fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleMessages, sending]);

  useEffect(() => {
    if (!messageRef.current) return;
    messageRef.current.style.height = "0px";
    messageRef.current.style.height = `${Math.min(messageRef.current.scrollHeight, 160)}px`;
  }, [draft]);

  const handleSendMessage = async (text?: string) => {
    const messageToSend = text || draft.trim();
    if (!messageToSend || sending) return;
    setDraft("");
    try {
      await storeSendMessage(messageToSend);
    } catch (error) {
      setDraft(messageToSend);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      <NebulaBackground opacity={0.3} showGrid={false} />

      {/* ─── TOP STATUS BAR: MENTOR METRICS ─── */}
      <header className="shrink-0 px-8 py-8 border-b border-white/[0.06] bg-obsidian">
         <div className="max-w-[1600px] mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                   <span className="opacity-50">Veda</span>
                   <ChevronRight size={14} className="opacity-30" />
                   <span className="text-white font-bold">Command Center</span>
                </div>
                <div className="flex items-center gap-4">
                   <button className="p-2 rounded-lg hover:bg-white/5 text-slate-400 transition-colors">
                      <Send size={18} />
                   </button>
                   <button 
                    onClick={() => setIsInsightsVisible(!isInsightsVisible)}
                    className={cn("p-3 rounded-xl transition-colors", isInsightsVisible ? "bg-brand/10 text-brand shadow-glow" : "bg-panel border border-white/5 text-slate-400 hover:text-white")}
                  >
                     <LayoutDashboard size={18} />
                  </button>
               </div>
            </div>
         </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* ─── LEFT SIDEBAR: SESSIONS ─── */}
        <Motion.aside 
          initial={false}
          animate={{ width: isSidebarCollapsed ? 0 : 280, opacity: isSidebarCollapsed ? 0 : 1 }}
          className="shrink-0 bg-[#0d0d0d] relative z-20 flex flex-col h-full"
        >
          <div className="p-3 flex flex-col h-full">
              {/* TOP NAVIGATION */}
              <div className="space-y-1 mb-6">
                <button 
                  onClick={() => createNewConversation()}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 text-slate-200 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center">
                       <Bot size={16} />
                    </div>
                    <span className="text-sm font-medium">New chat</span>
                  </div>
                  <MessageSquare size={16} className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                
                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-slate-400 transition-colors">
                  <History size={18} />
                  <span className="text-sm font-medium">Search chats</span>
                </button>

                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-slate-400 transition-colors">
                  <Command size={18} />
                  <span className="text-sm font-medium">Codex</span>
                </button>
              </div>

              {/* GPTS / TOOLS SECTION */}
              <div className="space-y-1 mb-8">
                 <h3 className="px-3 text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Veda GPTs</h3>
                 {categories.map(cat => (
                    <button 
                       key={cat.id} 
                       className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-slate-400 transition-colors group"
                    >
                       <div className={cn("w-6 h-6 rounded-md flex items-center justify-center bg-white/5", cat.color)}>
                          <cat.icon size={14} />
                       </div>
                       <span className="text-sm font-medium">{cat.label}</span>
                    </button>
                 ))}
              </div>

              {/* HISTORY SECTION */}
              <div className="flex-1 overflow-y-auto space-y-1 min-h-0 custom-scrollbar pr-1">
                 <h3 className="px-3 text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">History</h3>
                 {conversations.map(conv => {
                    const active = currentConversation?._id === conv._id;
                    return (
                      <button 
                        key={conv._id}
                        onClick={() => selectConversation(conv._id)}
                        className={cn(
                          "w-full p-3 rounded-lg text-left transition-all group flex items-center justify-between",
                          active ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
                        )}
                      >
                         <span className="text-sm truncate flex-1">
                           {conv.messages.find(m => m.role === "user")?.content || "New Session"}
                         </span>
                         {active && <div className="w-1.5 h-1.5 rounded-full bg-brand ml-2" />}
                      </button>
                    );
                 })}
              </div>

              {/* USER PROFILE */}
              <div className="mt-auto pt-4 border-t border-white/5">
                 <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-slate-200 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-slate-900 font-bold text-xs">
                       {user?.name?.substring(0, 2).toUpperCase() || "US"}
                    </div>
                    <span className="text-sm font-medium">{user?.name || "Priyanshu Tiwari"}</span>
                 </button>
              </div>
          </div>
        </Motion.aside>

        {/* ─── CENTER PANEL: MENTOR COMMAND CENTER ─── */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#171717] relative">
          <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-10 scroll-smooth">
             <div className="max-w-3xl mx-auto space-y-10">
                {visibleMessages.length === 0 ? (
                   <div className="flex h-full flex-col items-center justify-center text-center py-20">
                      <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center text-white mb-6">
                         <Bot size={32} />
                      </div>
                      <h1 className="text-2xl font-bold text-white mb-8">How can I help you today?</h1>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                         {suggestedPrompts.map(prompt => (
                           <button
                             key={prompt}
                             onClick={() => handleSendMessage(prompt)}
                             className="p-4 rounded-xl border border-white/10 hover:bg-white/5 text-left transition-all"
                           >
                             <p className="text-sm font-medium text-slate-300">{prompt}</p>
                           </button>
                         ))}
                      </div>
                   </div>
                ) : (
                  <>
                    {visibleMessages.map((msg, i) => (
                      <MentorMessage key={msg.id} message={msg} index={i} />
                    ))}
                    {sending && (
                      <div className="flex gap-4 p-4">
                         <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white shrink-0">
                            <Bot size={16} className="animate-spin" />
                         </div>
                         <div className="space-y-2 pt-1">
                            <div className="flex gap-1.5">
                               <div className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-pulse" />
                               <div className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-pulse delay-75" />
                               <div className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-pulse delay-150" />
                            </div>
                         </div>
                      </div>
                    )}
                  </>
                )}
                <div ref={messagesEndRef} />
             </div>
          </div>

          {/* ─── CHATGPT STYLE INPUT ─── */}
          <div className="px-6 pb-12 pt-4">
             <div className="max-w-3xl mx-auto">
                <div className="relative group">
                   <div className="relative bg-[#2f2f2f] rounded-[1.5rem] flex items-end p-2 pr-4 shadow-2xl">
                       <button className="p-3 text-slate-400 hover:text-white transition-colors">
                          <Plus size={20} />
                       </button>
                       <textarea
                          ref={messageRef}
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Ask anything"
                          className="flex-1 bg-transparent py-3 px-2 text-[16px] text-white outline-none resize-none max-h-40 min-h-[48px] custom-scrollbar placeholder-slate-500 font-normal leading-relaxed"
                          rows={1}
                       />
                       <div className="flex items-center gap-2 pb-1.5">
                          <button className="p-2 text-slate-400 hover:text-white transition-colors">
                             <Sparkles size={20} />
                          </button>
                          <button
                             onClick={() => void handleSendMessage()}
                             disabled={!draft.trim() || sending}
                             className={cn(
                               "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                               draft.trim() ? "bg-white text-black" : "bg-[#676767] text-[#2f2f2f]"
                             )}
                          >
                             <Send size={16} className="fill-current" />
                          </button>
                       </div>
                    </div>
                </div>
                <p className="text-center text-[11px] text-slate-600 mt-3">
                   Veda can make mistakes. Check important info.
                </p>
             </div>
          </div>
        </main>

        {/* ─── RIGHT PANEL: AI INSIGHTS ─── */}
        <AnimatePresence>
          {isInsightsVisible && (
            <Motion.aside 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 360, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="shrink-0 border-l border-white/[0.06] bg-ink"
            >
              <div className="p-8 space-y-8 min-w-[360px]">
                 <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">AI Mentor Insights</h3>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 </div>

                 <div className="space-y-6">
                    <InsightRow 
                      label="Burnout Indicator" 
                      message="Your skip rate increased by 12% this week. Consider a rest session." 
                      color={(user as any)?.behaviorProfile?.skipRate > 30 ? "text-red-400" : "text-emerald-400"}
                      icon={ShieldAlert}
                    />
                    
                    <InsightRow 
                      label="Learning Velocity" 
                      message="Topic mastery is 15% faster than last month. Ready for advanced modules." 
                      color="text-cyan-400"
                      icon={TrendingUp}
                    />

                    <div className="p-6 rounded-[2rem] bg-panel border border-white/[0.06] space-y-4">
                       <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Weak Concepts</h4>
                       <div className="flex flex-wrap gap-2">
                          {["Recursion", "DP Tables", "CSS Grid"].map(tag => (
                            <span key={tag} className="px-3 py-1 rounded-full bg-red-400/10 border border-red-400/20 text-[9px] font-bold text-red-400 uppercase tracking-widest">{tag}</span>
                          ))}
                       </div>
                    </div>

                    <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-brand/10 to-purple-600/10 border border-brand/20 relative overflow-hidden group">
                       <div className="relative z-10">
                          <h4 className="text-xs font-black text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                             <Sparkles size={14} className="text-brand" /> 
                             Veda Proactive Recommendation
                          </h4>
                          <p className="text-xs text-slate-300 leading-relaxed mb-4">
                             You perform best between 9 PM and 11 PM. I've scheduled your heavy "Mission Execution" for that window.
                          </p>
                          <button className="text-[10px] font-black uppercase tracking-widest text-brand hover:text-white transition-colors">
                             Optimize Schedule →
                          </button>
                       </div>
                    </div>
                 </div>

                 <div className="pt-8 border-t border-white/5">
                    <div className="flex items-center justify-between mb-4">
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recall Momentum</span>
                       <span className="text-[10px] font-black text-emerald-400">+8%</span>
                    </div>
                    <div className="h-1 w-full bg-panel rounded-full overflow-hidden">
                       <Motion.div className="h-full bg-emerald-400" initial={{ width: 0 }} animate={{ width: "72%" }} />
                    </div>
                 </div>
              </div>
            </Motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── SUB-COMPONENTS ─── */

function TopMetric({ label, value, icon: Icon, color }: any) {
  return (
    <Motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-[2.5rem] glass border-white/5 bg-panel relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-3xl -mr-12 -mt-12 rounded-full" />
      <div className="relative z-10">
        <div className={cn("p-2 rounded-xl bg-white/[0.04] w-fit mb-4", color)}>
          <Icon size={20} />
        </div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{label}</p>
        <p className="text-2xl font-black text-white">{value}</p>
      </div>
    </Motion.div>
  );
}

function SuggestionChip({ icon: Icon, label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-full glass border-white/5 bg-panel hover:bg-panel/50 hover:border-brand/30 transition-all text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest"
    >
      <Icon size={12} className="text-brand" />
      {label}
    </button>
  );
}

function InsightRow({ label, message, color, icon: Icon }: any) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon size={14} className={color} />
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-[11px] text-slate-300 font-medium leading-relaxed">{message}</p>
    </div>
  );
}

function MentorMessage({ message, index }: { message: any; index: number }) {
  const isUser = message.role === "user";
  const metadata = message.metadata;

  return (
    <Motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "flex gap-4 w-full group/msg",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
        isUser 
          ? "bg-brand text-slate-900 border-brand/20" 
          : "bg-white/10 border-white/10 text-white"
      )}>
        {isUser ? <UserRound size={16} /> : <Bot size={16} />}
      </div>

      <div className={cn(
        "flex flex-col gap-2 max-w-[85%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "px-4 py-2 rounded-2xl text-[15px] leading-relaxed relative",
          isUser 
            ? "bg-[#2f2f2f] text-white" 
            : "text-slate-100"
        )}>
          <div className="whitespace-pre-wrap">{message.content}</div>
          
          {!isUser && metadata?.saveableNote && (
            <button
              onClick={() => {
                notesApi.createNote(metadata.saveableNote).then(() => {
                  alert("Knowledge saved to your notes! 🧠");
                }).catch(err => {
                  console.error("Failed to save note:", err);
                });
              }}
              className="mt-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400 hover:text-white transition-all opacity-0 group-hover/msg:opacity-100"
            >
              <Plus size={10} /> Save to Note
            </button>
          )}
        </div>

        {/* RICH METADATA CARDS */}
        {!isUser && metadata && metadata.cards && metadata.cards.length > 0 && (
          <div className="w-full space-y-4 max-w-lg mt-2">
             <div className="grid grid-cols-1 gap-4">
                {metadata.cards.map((card: any, i: number) => {
                   switch (card.type) {
                     case 'insight': return <InsightCard key={i} {...card} />;
                     case 'mission': return <MissionCard key={i} {...card} />;
                     case 'focus_sprint': return <FocusSprintCard key={i} {...card} />;
                     case 'recall_challenge': return <RecallChallenge key={i} {...card} />;
                     case 'warning': return <WarningCard key={i} {...card} />;
                     case 'recovery': return <RecoveryPlanCard key={i} {...card} />;
                     default: return null;
                   }
                })}
             </div>
          </div>
        )}

        <div className="flex items-center gap-3 px-1 opacity-0 group-hover/msg:opacity-100 transition-opacity">
           <span className="text-[10px] text-slate-600 font-medium">
             {formatTime(message.createdAt)}
           </span>
        </div>
      </div>
    </Motion.div>
  );
}
