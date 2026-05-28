import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import {
  Bot,
  Check,
  Loader2,
  Menu,
  MessageSquare,
  Plus,
  Search,
  Send,
  UserRound,
  X,
  AlertTriangle,
  ExternalLink
} from "lucide-react";
import type { CopilotMessage } from "@studybuddy/shared";
import { cn } from "../../../lib/utils/cn";
import { formatTime } from "../../../lib/utils/date";
import * as notesApi from "../../../lib/api/notes";
import { useAppStore } from "../../../store/app-store";
import { useCopilotStore } from "../../../store/copilot-store";
import {
  FocusSprintCard,
  InsightCard,
  MissionCard,
  RecallChallenge,
  RecoveryPlanCard,
  WarningCard
} from "./MentorCards";
import { GuestGuard } from "../../../components/auth/GuestGuard";

const starterPrompts = [
  "What should I work on today?",
  "Help me understand what I am stuck on",
  "Make a focused study plan",
  "Check my mental health and burnout risk"
] as const;

function getConversationTitle(messages: CopilotMessage[]) {
  return messages.find((message) => message.role === "user")?.content ?? "New chat";
}

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

  const user = useAppStore((state) => state.user);
  const [draft, setDraft] = useState("");
  const [historyQuery, setHistoryQuery] = useState("");
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const visibleMessages = useMemo(
    () => currentConversation?.messages.filter((message) => message.role !== "system") ?? [],
    [currentConversation?.messages]
  );

  const filteredConversations = useMemo(() => {
    const query = historyQuery.trim().toLowerCase();
    if (!query) return conversations;
    return conversations.filter((conversation) =>
      getConversationTitle(conversation.messages).toLowerCase().includes(query)
    );
  }, [conversations, historyQuery]);

  useEffect(() => {
    void fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [visibleMessages, sending]);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "0px";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
  }, [draft]);

  const handleSendMessage = async (text?: string) => {
    const messageToSend = text ?? draft.trim();
    if (!messageToSend || sending) return;

    setDraft("");
    clearError();

    try {
      await storeSendMessage(messageToSend);
    } catch {
      setDraft(messageToSend);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSendMessage();
    }
  };

  const handleNewChat = () => {
    void createNewConversation();
    setMobileHistoryOpen(false);
  };

  const handleSelectChat = (conversationId: string) => {
    selectConversation(conversationId);
    setMobileHistoryOpen(false);
  };

  return (
    <div className="flex h-full w-full min-h-0 flex-1 overflow-hidden border-t border-white/[0.06] bg-[#0f1117]">
      <ChatHistory
        conversations={filteredConversations}
        activeConversationId={currentConversation?._id}
        query={historyQuery}
        loading={loading}
        onQueryChange={setHistoryQuery}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        className="hidden lg:flex"
      />

      <AnimatePresence>
        {mobileHistoryOpen && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 lg:hidden"
          >
            <Motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 360, damping: 34 }}
              className="h-full w-[min(320px,88vw)]"
            >
              <ChatHistory
                conversations={filteredConversations}
                activeConversationId={currentConversation?._id}
                query={historyQuery}
                loading={loading}
                onQueryChange={setHistoryQuery}
                onNewChat={handleNewChat}
                onSelectChat={handleSelectChat}
                onClose={() => setMobileHistoryOpen(false)}
              />
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      <main className="relative flex min-w-0 flex-1 flex-col bg-[#07090e] overflow-hidden">
        {/* Futuristic Cyber-Grid Backdrop */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(to right, #22d3ee 1px, transparent 1px), linear-gradient(to bottom, #22d3ee 1px, transparent 1px)`,
            backgroundSize: '28px 28px'
          }}
        />

        {/* Ambient Neural Pulsar Highlights */}
        <div className="absolute top-0 right-0 -z-10 h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none animate-pulse duration-[8000ms]" />
        <div className="absolute bottom-0 left-0 -z-10 h-[300px] w-[300px] rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none animate-pulse duration-[12000ms]" />

        <header className="relative flex h-14 shrink-0 items-center justify-between border-b border-white/[0.06] bg-slate-950/20 backdrop-blur-md px-4 sm:px-5 z-10 shadow-sm shadow-black/5">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileHistoryOpen(true)}
              className="rounded-md p-2 text-slate-400 hover:bg-white/[0.05] hover:text-white lg:hidden"
              aria-label="Open chat history"
            >
              <Menu size={18} />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-black text-white tracking-wide uppercase">Veda AI</h1>
              <p className="truncate text-[10px] font-bold text-slate-500 tracking-wider uppercase font-mono">NEURAL COGNITIVE COPILOT</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleNewChat}
            className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.03] px-3.5 py-1.5 text-xs font-black uppercase tracking-widest text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.05)] hover:bg-cyan-500 hover:text-slate-950 hover:shadow-[0_0_15px_rgba(34,211,238,0.35)] transition duration-300"
          >
            <Plus size={13} strokeWidth={2.5} />
            New chat
          </button>
        </header>

        {error && (
          <div className="mx-auto mt-4 flex w-[min(860px,calc(100%-32px))] items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-3.5 py-2.5 text-sm text-red-200 z-10 backdrop-blur-md shadow-lg shadow-black/10">
            <span className="min-w-0 flex-1 font-medium">{error}</span>
            <button type="button" onClick={clearError} className="rounded p-1 hover:bg-white/10 transition" aria-label="Dismiss error">
              <X size={14} />
            </button>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto relative z-10 custom-scrollbar">
          <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-4 py-8 sm:px-6">
            {visibleMessages.length === 0 ? (
              <EmptyState userName={user?.name} onPrompt={(prompt) => void handleSendMessage(prompt)} />
            ) : (
              <div className="space-y-7">
                {visibleMessages.map((message, index) => (
                  <ChatMessage key={message.id} message={message} index={index} />
                ))}
                {sending && <TypingIndicator />}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <GuestGuard fallbackText="Please login to chat with Veda and get personalized mentorship. Let's learn and grow together.">
          <Composer
            draft={draft}
            sending={sending}
            textareaRef={textareaRef}
            onDraftChange={setDraft}
            onKeyDown={handleKeyDown}
            onSend={() => void handleSendMessage()}
          />
        </GuestGuard>
      </main>
    </div>
  );
}

function ChatHistory({
  conversations,
  activeConversationId,
  query,
  loading,
  className,
  onQueryChange,
  onNewChat,
  onSelectChat,
  onClose
}: {
  conversations: Array<{ _id: string; messages: CopilotMessage[]; updatedAt: string }>;
  activeConversationId?: string;
  query: string;
  loading: boolean;
  className?: string;
  onQueryChange: (value: string) => void;
  onNewChat: () => void;
  onSelectChat: (conversationId: string) => void;
  onClose?: () => void;
}) {
  return (
    <aside className={cn("w-72 shrink-0 flex-col border-r border-white/[0.06] bg-[#0b0d12]", className)}>
      <div className="flex h-14 items-center gap-2 px-3">
        <button
          type="button"
          onClick={onNewChat}
          className="flex flex-1 items-center justify-center gap-2 rounded-md border border-white/[0.1] px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/[0.05]"
        >
          <Plus size={15} />
          New chat
        </button>
        {onClose ? (
          <button type="button" onClick={onClose} className="rounded-md p-2 text-slate-400 hover:bg-white/[0.05]" aria-label="Close history">
            <X size={18} />
          </button>
        ) : null}
      </div>

      <div className="px-3 pb-3">
        <label className="flex items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-slate-500 focus-within:border-white/20">
          <Search size={14} />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search chats"
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-400"
          />
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {loading && conversations.length === 0 ? (
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500">
            <Loader2 size={15} className="animate-spin" />
            Loading
          </div>
        ) : conversations.length === 0 ? (
          <p className="px-3 py-2 text-sm text-slate-500">No chats found.</p>
        ) : (
          <div className="space-y-1">
            {conversations.map((conversation) => {
              const active = activeConversationId === conversation._id;
              return (
                <button
                  key={conversation._id}
                  type="button"
                  onClick={() => onSelectChat(conversation._id)}
                  className={cn(
                    "flex w-full items-start gap-2 rounded-md px-3 py-2 text-left transition-colors",
                    active ? "bg-white/[0.08] text-white" : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-100"
                  )}
                >
                  <MessageSquare size={14} className="mt-0.5 shrink-0" />
                  <span className="min-w-0">
                    <span className="line-clamp-2 text-sm leading-5">{getConversationTitle(conversation.messages)}</span>
                    <span className="mt-0.5 block text-[11px] text-slate-400">{formatTime(conversation.updatedAt)}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}

function EmptyState({ userName, onPrompt }: { userName?: string; onPrompt: (prompt: string) => void }) {
  return (
    <div className="flex flex-1 flex-col justify-center">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.03] text-slate-200">
            <Bot size={22} />
          </div>
          <h2 className="text-2xl font-semibold text-white">
            How can I help{userName ? `, ${userName.split(" ")[0]}` : ""}?
          </h2>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {starterPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => onPrompt(prompt)}
              className="rounded-md border border-white/[0.08] bg-white/[0.025] p-4 text-left text-sm text-slate-300 hover:bg-white/[0.05] hover:text-white"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Composer({
  draft,
  sending,
  textareaRef,
  onDraftChange,
  onKeyDown,
  onSend
}: {
  draft: string;
  sending: boolean;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onDraftChange: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
}) {
  return (
    <div className="shrink-0 bg-transparent px-4 pb-5 pt-3 sm:px-6 relative z-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col gap-1.5 rounded-2xl border border-white/[0.08] bg-slate-950/65 backdrop-blur-xl p-2.5 shadow-2xl shadow-black/35 focus-within:border-cyan-500/30 focus-within:shadow-[0_0_25px_rgba(34,211,238,0.06)] transition-all duration-300">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Ask your Veda AI Mentor..."
            className="max-h-40 min-h-11 w-full resize-none bg-transparent px-4 py-3 text-sm leading-relaxed text-white outline-none placeholder:text-slate-500 custom-scrollbar"
          />
          <div className="flex items-center justify-between border-t border-white/[0.04] pt-2 px-2.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500"></span>
              </span>
              <span className="text-[9px] font-bold font-mono tracking-widest text-slate-500 uppercase">Veda Brain Core Active</span>
            </div>
            <button
              type="button"
              onClick={onSend}
              disabled={!draft.trim() || sending}
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-300 shadow-[0_0_12px_rgba(0,0,0,0.15)]",
                draft.trim() && !sending
                  ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.45)] hover:scale-105 active:scale-95"
                  : "bg-white/[0.04] text-slate-400"
              )}
              aria-label="Send message"
            >
              {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </div>
        </div>
        <p className="mt-2.5 text-center text-[10px] font-medium tracking-wide text-slate-500 uppercase">Veda is learning. Verify critical technical decisions.</p>
      </div>
    </div>
  );
}

function ChatMessage({ message, index }: { message: CopilotMessage; index: number }) {
  const isUser = message.role === "user";
  const metadata = message.metadata as any;

  return (
    <Motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.16) }}
      className={cn("flex gap-4 items-start", isUser && "justify-end")}
    >
      {!isUser && (
        <div className="relative group mt-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-950/30 text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.15)] overflow-hidden transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Bot size={18} className="relative z-10 text-cyan-300 animate-pulse duration-[4000ms]" />
          <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border border-slate-950 bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
        </div>
      )}

      <div className={cn("min-w-0 max-w-[min(720px,88%)]", isUser && "flex flex-col items-end")}>
        {!isUser && (metadata?.blackboardState || metadata?.behaviorAnalysis) && (
          <CognitiveAnalytics 
            blackboardState={metadata.blackboardState} 
            behaviorAnalysis={metadata.behaviorAnalysis} 
          />
        )}

        <div
          className={cn(
            "rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-lg shadow-black/10 transition-all duration-300",
            isUser 
              ? "bg-[#2f3440]/60 backdrop-blur-md border border-white/[0.06] text-white rounded-tr-sm shadow-indigo-950/5" 
              : "bg-[#0f121d]/50 backdrop-blur-md border border-white/[0.05] text-slate-100 rounded-tl-sm hover:border-cyan-500/20 hover:shadow-cyan-950/5"
          )}
        >
          {isUser ? <div className="whitespace-pre-wrap">{message.content}</div> : <MarkdownContent content={message.content} />}
        </div>

        {!isUser && metadata?.saveableNote && (
          <GuestGuard fallbackText="Please login to save insights to your knowledge base. Let's learn and grow together.">
            <button
              type="button"
              onClick={() => {
                notesApi.createNote(metadata.saveableNote).catch((error) => {
                  console.error("Failed to save note:", error);
                });
              }}
              className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] px-2.5 py-1.5 text-xs text-slate-400 hover:bg-white/[0.05] hover:text-white"
            >
              <Check size={13} />
              Save to notes
            </button>
          </GuestGuard>
        )}

        {!isUser && metadata?.cards?.length > 0 && (
          <div className="mt-3 grid w-full gap-3">
            {metadata.cards.map((card: any, cardIndex: number) => {
              switch (card.type) {
                case "insight":
                  return <InsightCard key={cardIndex} {...card} />;
                case "mission":
                  return <MissionCard key={cardIndex} {...card} />;
                case "focus_sprint":
                  return <FocusSprintCard key={cardIndex} {...card} />;
                case "recall_challenge":
                  return <RecallChallenge key={cardIndex} {...card} />;
                case "warning":
                  return <WarningCard key={cardIndex} {...card} />;
                case "recovery":
                  return <RecoveryPlanCard key={cardIndex} {...card} />;
                default:
                  return null;
              }
            })}
          </div>
        )}

        <div className={cn("mt-1 flex items-center gap-1.5 text-[11px] text-slate-400", isUser && "justify-end")}>
          {isUser ? <UserRound size={11} /> : <Bot size={11} />}
          {formatTime(message.createdAt)}
        </div>
      </div>
    </Motion.div>
  );
}

// Cognitive Diagnostics HUD dashboard for real-time memory metrics
function CognitiveAnalytics({ 
  blackboardState, 
  behaviorAnalysis 
}: { 
  blackboardState?: {
    cognitiveLoad: number;
    burnoutRisk: number;
    emotionalState: string;
    adaptiveDifficulty: string;
    targetRoles: string[];
  };
  behaviorAnalysis?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (!blackboardState && !behaviorAnalysis) return null;

  return (
    <div className="mb-3.5 overflow-hidden rounded-xl border border-white/[0.06] bg-[#121620]/60 backdrop-blur-md shadow-lg shadow-black/15">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:bg-white/[0.02] transition"
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500"></span>
          </span>
          <span className="text-white font-mono tracking-widest text-[10px]">Veda Neural Diagnostic Protocol</span>
        </div>
        <span className="text-[10px] font-bold text-cyan-400 transition-colors">
          {isOpen ? "Collapse [-]" : "Expand Metrics [+]"}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <Motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/[0.04]"
          >
            <div className="p-3.5 space-y-3.5">
              {/* Blackboard metrics grids */}
              {blackboardState && (
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {/* Burnout Risk */}
                  <div className="rounded-lg border border-white/[0.04] bg-white/[0.01] p-2.5">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-slate-500">
                      <span>Burnout Risk</span>
                      <span className={cn(
                        blackboardState.burnoutRisk >= 60 ? "text-red-400" :
                        blackboardState.burnoutRisk >= 40 ? "text-amber-400" : "text-green-400"
                      )}>
                        {blackboardState.burnoutRisk}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/[0.08]">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          blackboardState.burnoutRisk >= 60 ? "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]" :
                          blackboardState.burnoutRisk >= 40 ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" :
                          "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"
                        )}
                        style={{ width: `${blackboardState.burnoutRisk}%` }}
                      />
                    </div>
                  </div>

                  {/* Cognitive Load */}
                  <div className="rounded-lg border border-white/[0.04] bg-white/[0.01] p-2.5">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-slate-500">
                      <span>Cognitive Load</span>
                      <span className="text-cyan-400">{blackboardState.cognitiveLoad}%</span>
                    </div>
                    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/[0.08]">
                      <div 
                        className="h-full rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)] transition-all duration-500"
                        style={{ width: `${blackboardState.cognitiveLoad}%` }}
                      />
                    </div>
                  </div>

                  {/* Motivation / Emotional State */}
                  <div className="rounded-lg border border-white/[0.04] bg-white/[0.01] p-2.5 flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Motivation State</span>
                    <span className="inline-flex items-center rounded bg-cyan-400/5 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-cyan-300 border border-cyan-400/10">
                      {blackboardState.emotionalState}
                    </span>
                  </div>

                  {/* Adaptive Mode */}
                  <div className="rounded-lg border border-white/[0.04] bg-white/[0.01] p-2.5 flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Pacing Mode</span>
                    <span className="inline-flex items-center rounded bg-teal-400/5 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-teal-300 border border-teal-400/10">
                      {blackboardState.adaptiveDifficulty}
                    </span>
                  </div>
                </div>
              )}

              {/* Behavior Analysis Typewriter Terminal */}
              {behaviorAnalysis && (
                <div className="rounded-lg border border-white/[0.04] bg-black/45 p-2.5 font-mono text-xs leading-normal">
                  <div className="text-[8px] uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 font-bold">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span>Neural Log // Cognitive Assessment</span>
                  </div>
                  <p className="text-green-400 leading-relaxed text-[11px]">
                    {behaviorAnalysis}
                  </p>
                </div>
              )}
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Custom interactive checkbox widget
function InteractiveCheckbox({ checked, label }: { checked: boolean; label: React.ReactNode }) {
  const [isChecked, setIsChecked] = useState(checked);
  return (
    <label className="flex items-start gap-2.5 py-1 cursor-pointer select-none">
      <div 
        onClick={() => setIsChecked(!isChecked)}
        className={cn(
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all duration-200",
          isChecked 
            ? "border-cyan-400 bg-cyan-400/10 text-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.25)]" 
            : "border-white/20 hover:border-cyan-400/50 bg-white/[0.02]"
        )}
      >
        {isChecked && <Check size={11} strokeWidth={3} />}
      </div>
      <div className={cn("text-sm text-slate-200 leading-tight", isChecked && "text-slate-400 line-through decoration-slate-600")}>
        {label}
      </div>
    </label>
  );
}

// Custom IDE code terminal widget with interactive copy confirmation
function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code", err);
    }
  };

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-white/[0.08] bg-slate-950/75 backdrop-blur-md shadow-lg shadow-black/35 font-mono text-[11px]">
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-2 text-[9px] uppercase tracking-wider text-slate-400">
        <div className="flex items-center gap-1.5 font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee] animate-pulse" />
          <span>{language || "code"}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1 rounded px-2 py-0.5 transition-all hover:bg-white/[0.06] font-bold uppercase tracking-widest text-[9px]",
            copied ? "text-green-400" : "text-slate-400 hover:text-slate-200"
          )}
        >
          {copied ? (
            <>
              <Check size={10} strokeWidth={3} />
              <span>Copied!</span>
            </>
          ) : (
            <span>Copy Code</span>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 leading-relaxed text-cyan-200 select-all">
        <code>{code.trim()}</code>
      </pre>
    </div>
  );
}

// Token types for recursive block compile
type MarkdownBlock =
  | { type: 'code'; language: string; code: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'blockquote'; lines: string[] }
  | { type: 'header'; level: number; text: string }
  | { type: 'list'; items: { text: string; indent: number; checked?: boolean }[] }
  | { type: 'hr' }
  | { type: 'paragraph'; text: string };

// Parser to split raw markdown text into structural block components
function parseMarkdownToBlocks(text: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const lines = text.split('\n');
  let currentBlock: MarkdownBlock | null = null;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // 1. Fenced code block handling
    if (line.trim().startsWith('```')) {
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      
      const langMatch = line.trim().match(/^```(\w*)/);
      const language = langMatch?.[1] || '';
      let codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({
        type: 'code',
        language,
        code: codeLines.join('\n')
      });
      i++; // Skip closing ```
      continue;
    }

    // 2. Horizontal rule handling
    if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___') {
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // 3. Header handling
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      blocks.push({
        type: 'header',
        level: headerMatch[1].length,
        text: headerMatch[2].trim()
      });
      i++;
      continue;
    }

    // 4. Blockquote handling
    if (line.trim().startsWith('>')) {
      if (currentBlock && (currentBlock.type as string) !== 'blockquote') {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      const quoteText = line.trim().replace(/^>\s?/, '');
      if (!currentBlock) {
        currentBlock = { type: 'blockquote', lines: [quoteText] };
      } else if (currentBlock.type === 'blockquote') {
        currentBlock.lines.push(quoteText);
      }
      i++;
      continue;
    }

    // 5. Table handling
    if (line.trim().startsWith('|')) {
      if (currentBlock && (currentBlock.type as string) !== 'table') {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const headers = tableLines[0]
          .split('|')
          .slice(1, -1)
          .map(h => h.trim());
        
        const rows = tableLines.slice(2).map(row => 
          row.split('|')
            .slice(1, -1)
            .map(cell => cell.trim())
        );

        blocks.push({
          type: 'table',
          headers,
          rows
        });
      } else {
        tableLines.forEach(tl => {
          blocks.push({ type: 'paragraph', text: tl });
        });
      }
      continue;
    }

    // 6. List handling (including nested checklists)
    const listMatch = line.match(/^(\s*)([-*+]|\d+\.)\s+(.+)$/);
    if (listMatch) {
      if (currentBlock && (currentBlock.type as string) !== 'list') {
        blocks.push(currentBlock);
        currentBlock = null;
      }

      const indentStr = listMatch[1];
      const indent = indentStr.length;
      let rest = listMatch[3].trim();

      let checked: boolean | undefined = undefined;
      if (rest.startsWith('[ ]')) {
        checked = false;
        rest = rest.slice(3).trim();
      } else if (rest.startsWith('[x]') || rest.startsWith('[X]')) {
        checked = true;
        rest = rest.slice(3).trim();
      }

      const listItem = {
        text: rest,
        indent,
        checked
      };

      if (!currentBlock) {
        currentBlock = { type: 'list', items: [listItem] };
      } else if (currentBlock.type === 'list') {
        currentBlock.items.push(listItem);
      }
      i++;
      continue;
    }

    // 7. Empty line handling (block separator)
    if (line.trim() === '') {
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      i++;
      continue;
    }

    // 8. Paragraph accumulator
    if (currentBlock && (currentBlock.type as string) !== 'paragraph') {
      blocks.push(currentBlock);
      currentBlock = null;
    }

    if (!currentBlock) {
      currentBlock = { type: 'paragraph', text: line.trim() };
    } else if (currentBlock.type === 'paragraph') {
      currentBlock.text += ' ' + line.trim();
    }
    i++;
  }

  if (currentBlock) {
    blocks.push(currentBlock);
  }

  return blocks;
}

// Parses bold titles at list beginnings into gorgeous visual neon badges
function parseListItemText(text: string) {
  const match = text.match(/^\*\*([^*]+)\*\*:\s*(.+)$/);
  if (match) {
    const badgeText = match[1];
    const restOfText = match[2];
    return (
      <span className="flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center rounded border border-cyan-400/20 bg-cyan-400/5 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-cyan-300 shadow-[0_0_6px_rgba(34,211,238,0.08)]">
          {badgeText}
        </span>
        <span className="text-slate-200 leading-normal">{parseInlineMarkdown(restOfText)}</span>
      </span>
    );
  }
  return parseInlineMarkdown(text);
}

// Recursively processes inline formatting like hyperlinks, code highlights, bold, and italics
function parseInlineMarkdown(text: string) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*|_[^_]+_)/g);

  return parts.map((part, index) => {
    if (part.startsWith("[") && part.includes("](")) {
      const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (match) {
        return (
          <a
            key={index}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 border-b border-cyan-400/30 text-cyan-400 transition hover:border-cyan-400 hover:text-cyan-300 font-medium"
          >
            <span>{match[1]}</span>
            <ExternalLink size={10} className="stroke-[2.5]" />
          </a>
        );
      }
    }

    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="font-bold text-white">{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index} className="rounded bg-white/[0.07] px-1.5 py-0.5 font-mono text-[0.9em] text-cyan-300">{part.slice(1, -1)}</code>;
    }

    if ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_"))) {
      return <em key={index} className="italic text-slate-300">{part.slice(1, -1)}</em>;
    }

    return part;
  });
}

// Premium visual MarkdownContent component
export function MarkdownContent({ content, compact = false }: { content: string; compact?: boolean }) {
  // Double-safety net: If content is raw JSON from a parsing failure, parse it on the fly!
  const processedContent = useMemo(() => {
    const trimmed = content.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.content) {
          return parsed.content;
        }
      } catch {
        // Not valid JSON, fallback to raw
      }
    }
    return content;
  }, [content]);

  const blocks = useMemo(() => parseMarkdownToBlocks(processedContent), [processedContent]);

  return (
    <div className={cn("space-y-4 leading-relaxed", compact ? "text-[13px] space-y-3" : "text-sm")}>
      {blocks.map((block, blockIndex) => {
        switch (block.type) {
          case 'code':
            return <CodeBlock key={blockIndex} language={block.language} code={block.code} />;

          case 'table':
            return (
              <div key={blockIndex} className="my-4 overflow-x-auto rounded-xl border border-white/[0.08] bg-slate-950/20 backdrop-blur-sm shadow-md custom-scrollbar">
                <table className="w-full border-collapse text-left text-xs leading-normal">
                  <thead>
                    <tr className="border-b border-white/[0.08] bg-white/[0.04] text-[10px] font-bold uppercase tracking-wider text-white">
                      {block.headers.map((h, idx) => (
                        <th key={idx} className="px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {block.rows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="bg-white/[0.005] transition hover:bg-white/[0.02]">
                        {row.map((cell, cellIdx) => (
                          <td key={cellIdx} className="px-4 py-2.5 text-slate-300">
                            {parseInlineMarkdown(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case 'blockquote':
            const hasWarning = block.lines.some(l => /warn|alert|error|crit/i.test(l));
            return (
              <div 
                key={blockIndex} 
                className={cn(
                  "my-4 flex gap-3.5 rounded-xl border p-4 shadow-md backdrop-blur-sm",
                  hasWarning 
                    ? "border-red-500/20 bg-red-500/[0.02] border-l-4 border-l-red-500 shadow-red-950/5" 
                    : "border-cyan-500/20 bg-cyan-500/[0.02] border-l-4 border-l-cyan-400 shadow-cyan-950/5"
                )}
              >
                <div className={cn("mt-0.5 shrink-0", hasWarning ? "text-red-400" : "text-cyan-400")}>
                  {hasWarning ? <AlertTriangle size={16} /> : <Bot size={16} />}
                </div>
                <div className="space-y-1.5 text-slate-300 italic leading-relaxed text-[13px]">
                  {block.lines.map((line, idx) => (
                    <p key={idx}>{parseInlineMarkdown(line)}</p>
                  ))}
                </div>
              </div>
            );

          case 'header':
            const baseClass = "font-bold text-white font-display tracking-tight";
            if (block.level === 1) return <h1 key={blockIndex} className={cn(baseClass, "text-lg pt-4 pb-1 border-b border-white/[0.06]", compact ? "text-base pt-3" : "")}>{parseInlineMarkdown(block.text)}</h1>;
            if (block.level === 2) return <h2 key={blockIndex} className={cn(baseClass, "text-base pt-3.5 pb-0.5", compact ? "text-sm pt-2.5" : "")}>{parseInlineMarkdown(block.text)}</h2>;
            return <h3 key={blockIndex} className={cn(baseClass, "text-sm pt-2.5 pb-0.5", compact ? "text-[13px] pt-2" : "")}>{parseInlineMarkdown(block.text)}</h3>;

          case 'list':
            return (
              <div key={blockIndex} className="my-2.5 space-y-2">
                {block.items.map((item, itemIdx) => {
                  const label = parseListItemText(item.text);
                  if (item.checked !== undefined) {
                    return (
                      <div key={itemIdx} style={{ paddingLeft: `${item.indent * 6}px` }}>
                        <InteractiveCheckbox checked={item.checked} label={label} />
                      </div>
                    );
                  }
                  return (
                    <div
                      key={itemIdx}
                      className="flex gap-2.5 text-slate-200 items-start text-sm"
                      style={{ paddingLeft: `${item.indent * 6}px` }}
                    >
                      <span className={cn(
                        "mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full",
                        item.indent > 0 
                          ? "border border-cyan-400 bg-transparent h-1.5 w-1.5" 
                          : "bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.4)]"
                      )} />
                      <span className="flex-1 leading-normal text-slate-300">{label}</span>
                    </div>
                  );
                })}
              </div>
            );

          case 'hr':
            return <hr key={blockIndex} className="my-5 border-white/[0.08]" />;

          case 'paragraph':
          default:
            return <p key={blockIndex} className="text-slate-300 leading-relaxed text-sm">{parseInlineMarkdown(block.text)}</p>;
        }
      })}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-slate-200">
        <Bot size={15} />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl px-4 py-3">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-transparent0" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-transparent0 [animation-delay:120ms]" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-transparent0 [animation-delay:240ms]" />
      </div>
    </div>
  );
}
