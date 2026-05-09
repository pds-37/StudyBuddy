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
         <div className="max-w-[1600px] mx-auto space-y-8">
            <div className="flex items-center justify-between">
               <div>
                  <h1 className="text-3xl font-black text-slate-900 dark:text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                     Veda AI <span className="text-brand font-normal text-sm border border-brand/20 px-2 py-0.5 rounded-lg bg-brand/5">Command Center</span>
                  </h1>
                  <p className="text-slate-400 text-sm mt-1 font-medium italic">Deeply contextual career guidance and adaptive study missions.</p>
               </div>
               <div className="flex items-center gap-4">
                  <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-panel border border-white/[0.08] text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                     <History size={14} className="text-brand" />
                     Mission: Graph Mastery
                  </div>
                  <button 
                    onClick={() => setIsInsightsVisible(!isInsightsVisible)}
                    className={cn("p-3 rounded-xl transition-colors", isInsightsVisible ? "bg-brand/10 text-brand shadow-glow" : "bg-panel border border-white/5 text-slate-400 hover:text-white")}
                  >
                     <LayoutDashboard size={18} />
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
               <TopMetric label="Focus Score" value={`${(user as any)?.behaviorProfile?.consistencyScore || 0}%`} icon={Zap} color="text-blue-400" />
               <TopMetric label="Recall Health" value={(user as any)?.behaviorProfile?.recallMomentum > 0 ? "Good" : "Learning"} icon={Brain} color="text-purple-400" />
               <TopMetric label="Consistency" value={(user as any)?.behaviorProfile?.consistencyScore > 70 ? "High" : "Medium"} icon={Flame} color="text-orange-400" />
               <TopMetric label="Burnout Risk" value={(user as any)?.behaviorProfile?.skipRate > 30 ? "High" : "Low"} icon={ShieldAlert} color="text-emerald-400" />
            </div>
         </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* ─── LEFT SIDEBAR: SESSIONS ─── */}
        <Motion.aside 
          initial={false}
          animate={{ width: isSidebarCollapsed ? 0 : 320, opacity: isSidebarCollapsed ? 0 : 1 }}
          className="shrink-0 border-r border-white/[0.06] bg-ink"
        >
          <div className="p-6 space-y-6 min-w-[320px]">
              <button 
                onClick={() => createNewConversation()}
                className="w-full p-4 rounded-2xl bg-brand text-slate-900 flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
              >
                <Plus size={18} /> New Thread
             </button>

             <div className="space-y-4">
                <h3 className="px-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Categories</h3>
                <div className="space-y-2">
                    {categories.map(cat => (
                      <button 
                         key={cat.id} 
                         onClick={() => handleSendMessage(`Analyze my ${cat.label} progress and suggest next steps.`)}
                         className="w-full p-4 rounded-2xl flex items-center justify-between transition-all group hover:bg-white/[0.04] text-slate-300 hover:text-white"
                      >
                         <div className="flex items-center gap-4">
                            <cat.icon size={18} className={cn("transition-transform group-hover:scale-110", cat.color)} />
                            <span className="text-sm font-bold">{cat.label}</span>
                         </div>
                         <ChevronRight size={14} className="text-brand opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                 </div>
             </div>

             <div className="space-y-4 flex-1">
                <h3 className="px-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Recent Missions</h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {conversations.map(conv => {
                      const active = currentConversation?._id === conv._id;
                      return (
                        <button 
                          key={conv._id}
                          onClick={() => selectConversation(conv._id)}
                          className={cn(
                            "w-full p-4 rounded-2xl text-left transition-all group",
                            active ? "bg-white/[0.08] text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                          )}
                        >
                           <p className={cn("text-sm font-bold truncate mb-1", active ? "text-white" : "group-hover:text-white")}>
                             {conv.messages.find(m => m.role === "user")?.content || "New Session"}
                           </p>
                           <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase">
                              <Clock3 size={12} /> {formatDate(conv.updatedAt)}
                           </div>
                        </button>
                      );
                    })}
                 </div>
             </div>
          </div>
        </Motion.aside>

        {/* ─── CENTER PANEL: MENTOR COMMAND CENTER ─── */}
        <main className="flex-1 flex flex-col min-w-0 relative">
          <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-10 scroll-smooth">
             <div className="max-w-4xl mx-auto space-y-12">
                {visibleMessages.length === 0 ? (
                  <Motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-20 text-center"
                  >
                     <div className="w-24 h-24 rounded-[3rem] bg-gradient-to-br from-brand to-purple-600 flex items-center justify-center text-white mx-auto mb-10 shadow-[0_20px_50px_rgba(124,92,255,0.3)]">
                        <Sparkles size={44} />
                     </div>
                     <h1 className="text-4xl font-black text-white mb-4 leading-tight tracking-tight">Your AI Mentor Command Center.</h1>
                     <p className="text-slate-400 max-w-md mx-auto leading-relaxed mb-12 text-base font-medium">
                        Deeply contextual career guidance, behavior-aware execution, and adaptive study missions.
                     </p>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                        {suggestedPrompts.map(prompt => (
                          <button
                            key={prompt}
                            onClick={() => handleSendMessage(prompt)}
                            className="group p-5 rounded-3xl glass border-white/5 bg-panel hover:bg-panel/50 hover:border-brand/30 transition-all text-left relative overflow-hidden"
                          >
                            <div className="absolute top-0 right-0 p-3 text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity">
                               <ArrowRight size={20} />
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2 group-hover:text-brand transition-colors">Veda Prompt</p>
                            <p className="text-sm font-bold text-slate-200 leading-snug">{prompt}</p>
                          </button>
                        ))}
                     </div>
                  </Motion.div>
                ) : (
                  <>
                    {visibleMessages.map((msg, i) => (
                      <MentorMessage key={msg.id} message={msg} index={i} />
                    ))}
                    {sending && (
                      <Motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-start gap-6"
                      >
                         <div className="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center text-brand animate-pulse">
                            <Bot size={20} />
                         </div>
                         <div className="space-y-3 pt-2">
                            <div className="flex gap-2">
                               <div className="w-2 h-2 rounded-full bg-brand/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                               <div className="w-2 h-2 rounded-full bg-brand/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                               <div className="w-2 h-2 rounded-full bg-brand/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Veda is analyzing context...</p>
                         </div>
                      </Motion.div>
                    )}
                  </>
                )}
                <div ref={messagesEndRef} />
             </div>
          </div>

          {/* ─── SMART INPUT AREA ─── */}
          <div className="px-8 pb-8 pt-4">
             <div className="max-w-4xl mx-auto">
                <div className="flex flex-wrap gap-2 mb-6">
                   <SuggestionChip icon={Target} label="Next Best Action" onClick={() => handleSendMessage("What should I do right now?")} />
                   <SuggestionChip icon={AlertCircle} label="Why am I stuck?" onClick={() => handleSendMessage("Analyze why I am stuck and suggest a recovery plan.")} />
                   <SuggestionChip icon={Clock3} label="1-Hour Session" onClick={() => handleSendMessage("Create a 1-hour adaptive study session for my current goals.")} />
                </div>

                <div className="relative group">
                   <div className="absolute -inset-1 bg-gradient-to-r from-brand to-purple-600 rounded-[2.5rem] blur opacity-10 group-focus-within:opacity-30 transition-opacity" />
                    <div className="relative glass bg-ink">
                       <MessageSquare size={18} className="text-slate-500 ml-4 hidden md:block" />
                       <textarea
                          ref={messageRef}
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Command Veda or ask anything..."
                          className="flex-1 bg-transparent py-4 px-4 text-sm text-white outline-none resize-none max-h-40 min-h-[50px] custom-scrollbar placeholder-slate-600 font-medium"
                          rows={1}
                       />
                       <div className="flex items-center gap-3">
                          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-panel border border-white/10 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                             <Command size={10} /> Enter
                          </div>
                          <button
                             onClick={() => void handleSendMessage()}
                             disabled={!draft.trim() || sending}
                             className={cn(
                               "p-3 rounded-xl transition-all disabled:opacity-30 active:scale-95",
                               draft.trim() ? "bg-brand text-black shadow-glow" : "bg-panel text-slate-600"
                             )}
                          >
                             {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                          </button>
                       </div>
                    </div>
                </div>
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "flex gap-6",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border transition-all",
        isUser 
          ? "bg-brand text-black border-brand/20 shadow-xl" 
          : "bg-brand/10 border-brand/20 text-brand"
      )}>
        {isUser ? <UserRound size={20} /> : <Bot size={20} />}
      </div>

      <div className={cn(
        "flex flex-col gap-4 max-w-[85%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "px-8 py-5 rounded-[2.2rem] text-sm leading-relaxed shadow-2xl backdrop-blur-3xl transition-all border group/msg relative",
          isUser 
            ? "bg-gradient-to-br from-brand to-purple-600 border-white/20 text-slate-900 rounded-tr-none" 
            : "glass border-white/10 bg-white/[0.03] text-slate-100 rounded-tl-none"
        )}>
          <div className="whitespace-pre-wrap font-medium">{message.content}</div>
          
          {!isUser && metadata?.saveableNote && (
            <button
              onClick={() => {
                notesApi.createNote(metadata.saveableNote).then(() => {
                  alert("Knowledge saved to your notes! 🧠");
                }).catch(err => {
                  console.error("Failed to save note:", err);
                });
              }}
              className="absolute -bottom-3 -right-3 px-3 py-1.5 rounded-full bg-emerald-500 text-obsidian text-[9px] font-black uppercase tracking-widest opacity-0 group-hover/msg:opacity-100 transition-all hover:scale-105 shadow-lg flex items-center gap-1.5 z-20"
            >
              <Plus size={10} /> Save to Note
            </button>
          )}

        </div>


        {/* RICH METADATA CARDS */}
        {!isUser && metadata && (
          <div className="w-full space-y-4 max-w-lg mt-2">
             {metadata.behaviorAnalysis && (
                <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-brand/5 border border-brand/10 text-[10px] font-bold text-brand uppercase tracking-widest">
                   <TrendingUp size={12} />
                   Behavior Insight: {metadata.behaviorAnalysis}
                </div>
             )}

             <div className="grid grid-cols-1 gap-4">
                {metadata.cards?.map((card: any, i: number) => {
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

             {metadata.nextBestAction && (
                <div className="p-6 rounded-[2.5rem] bg-emerald-500/5 border border-emerald-500/20 group">
                   <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={14} className="text-emerald-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Veda's Recommended Action</span>
                   </div>
                   <h4 className="text-sm font-black text-white mb-1">{metadata.nextBestAction.label}</h4>
                   <p className="text-[11px] text-slate-500 mb-4">{metadata.nextBestAction.description}</p>
                   <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400 group-hover:text-emerald-300 transition-colors">
                      Execute Now <ArrowRight size={12} />
                   </button>
                </div>
             )}
          </div>
        )}

        <div className="flex items-center gap-3 px-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {isUser ? "Authorized User" : "Veda AI Mentor"}
          </span>
          <div className="w-1 h-1 rounded-full bg-slate-700" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {formatTime(message.createdAt)}
          </span>
        </div>
      </div>
    </Motion.div>
  );
}
