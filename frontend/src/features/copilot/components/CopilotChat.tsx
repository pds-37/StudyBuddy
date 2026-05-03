import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Bot,
  Clock3,
  Loader2,
  MessageCircle,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  UserRound,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import { cn } from "../../../lib/utils/cn";
import { NebulaBackground } from "../../../components/common/NebulaBackground";
import { formatTime, formatDate } from "../../../lib/utils/date";
import { useCopilotStore } from "../../../store/copilot-store";
import type { CopilotMessage } from "@studybuddy/shared";

const suggestedPrompts = [
  "What should I focus on this week?",
  "Review my roadmap and suggest next steps.",
  "How can I improve my job match quality?"
] as const;

/** Returns a compact, readable conversation title. */
function getConversationTitle(messages: CopilotMessage[]) {
  const firstUserMessage = messages.find((message) => message.role === "user");

  if (!firstUserMessage) {
    return "New conversation";
  }

  return firstUserMessage.content.length > 54
    ? `${firstUserMessage.content.slice(0, 54)}...`
    : firstUserMessage.content;
}


/** Main copilot chat interface component. */
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

   const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [draft, setDraft] = useState("");
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const visibleMessages = useMemo(
    () => currentConversation?.messages.filter((message) => message.role !== "system") ?? [],
    [currentConversation?.messages]
  );
  const activeTitle = currentConversation ? getConversationTitle(currentConversation.messages) : "No active chat";
  const totalMessages = visibleMessages.length;

  useEffect(() => {
    void fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleMessages, sending]);

  useEffect(() => {
    if (!messageRef.current) {
      return;
    }

    messageRef.current.style.height = "0px";
    messageRef.current.style.height = `${Math.min(messageRef.current.scrollHeight, 160)}px`;
  }, [draft]);

  const handleSendMessage = async () => {
    const messageToSend = draft.trim();

    if (!messageToSend || sending) {
      return;
    }

    setDraft("");

    try {
      await storeSendMessage(messageToSend);
    } catch (error) {
      console.error("Failed to send message:", error);
      setDraft(messageToSend);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSendMessage();
    }
  };

  const handleNewConversation = async () => {
    setDraft("");
    await createNewConversation();
  };

  const handleRefresh = () => {
    void fetchConversations(true);
  };

  return (
    <div className="flex h-full overflow-hidden rounded-[2.5rem] glass border-white/5 bg-obsidian/20 shadow-2xl relative">
      {/* Sidebar: Conversation History */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: isSidebarCollapsed ? 0 : 300,
          opacity: isSidebarCollapsed ? 0 : 1,
          x: isSidebarCollapsed ? -20 : 0
        }}
        className={cn(
          "flex flex-col border-r border-white/5 bg-ink/40 backdrop-blur-2xl transition-all duration-300 overflow-hidden shrink-0",
          "hidden lg:flex"
        )}
      >
        <div className="p-6 border-b border-white/5 min-w-[300px]">
          <button
            onClick={() => void handleNewConversation()}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white text-obsidian font-black text-sm hover:bg-slate-200 transition-all hover:scale-[1.02] shadow-lg"
          >
            <Plus size={18} />
            New Thread
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar min-w-[300px]">
          {conversations.map((conversation) => {
            const isActive = currentConversation?._id === conversation._id;
            return (
              <button
                key={conversation._id}
                onClick={() => selectConversation(conversation._id)}
                className={cn(
                  "w-full p-4 rounded-2xl text-left transition-all group relative",
                  isActive 
                    ? "bg-white/5 border border-white/10 shadow-sm" 
                    : "hover:bg-white/[0.02] border border-transparent"
                )}
              >
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand rounded-r-full" />}
                <p className="text-sm font-bold text-white truncate mb-1">{getConversationTitle(conversation.messages)}</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                   <Clock3 size={10} />
                   {formatDate(conversation.updatedAt)}
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-white/5 min-w-[300px]">
          <button
            onClick={handleRefresh}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-slate-500 hover:text-white transition-colors text-xs font-bold"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Sync Conversations
          </button>
        </div>
      </motion.aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        <NebulaBackground opacity={0.4} showGrid={false} />
        {/* Chat Header */}
        <header className="px-8 py-4 border-b border-white/5 bg-obsidian/40 backdrop-blur-xl flex items-center justify-between">
          <div className="flex items-center gap-4">
             <button 
               onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
               className="p-2 -ml-2 rounded-lg hover:bg-white/5 text-slate-500 transition-colors hidden lg:block"
             >
                {isSidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
             </button>
             <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                <Bot size={20} />
             </div>
             <div>
                <h2 className="text-sm font-black text-white truncate max-w-[300px]">{activeTitle}</h2>
                <div className="flex items-center gap-2">
                   <span className={cn("w-1.5 h-1.5 rounded-full", sending ? "bg-brand animate-pulse" : "bg-emerald-500")} />
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{sending ? "Thinking..." : "Connected"}</span>
                </div>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
             <button className="p-2 rounded-lg hover:bg-white/5 text-slate-500 transition-colors">
                <Sparkles size={18} />
             </button>
          </div>
        </header>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-10">
          <div className="max-w-3xl mx-auto space-y-10">
            {visibleMessages.length === 0 ? (
              <div className="py-20 text-center animate-fade-in">
                 <div className="w-20 h-20 rounded-[2rem] bg-brand/10 border border-brand/20 flex items-center justify-center text-brand mx-auto mb-8 shadow-glow">
                    <Sparkles size={40} />
                 </div>
                 <h3 className="text-3xl font-black text-white mb-4 leading-tight">How can I help your <br /> career today?</h3>
                 <p className="text-slate-400 max-w-md mx-auto leading-relaxed mb-10">
                    I can help you analyze roadmaps, prep for interviews, or optimize your resume with AI precision.
                 </p>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {suggestedPrompts.map(prompt => (
                      <button
                        key={prompt}
                        onClick={() => setDraft(prompt)}
                        className="p-4 rounded-2xl glass border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-brand/30 transition-all text-xs font-semibold text-slate-300 text-left"
                      >
                        {prompt}
                      </button>
                    ))}
                 </div>
              </div>
            ) : (
              <>
                {visibleMessages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {sending && (
                  <div className="flex items-start gap-5 animate-pulse">
                     <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand shrink-0">
                        <Bot size={16} />
                     </div>
                     <div className="space-y-2 pt-1">
                        <div className="h-2 w-48 bg-white/10 rounded-full" />
                        <div className="h-2 w-32 bg-white/5 rounded-full" />
                     </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        {/* Input Bar */}
        <div className="px-8 pb-8 pt-2">
           <div className="max-w-3xl mx-auto relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-brand to-cyan rounded-[2rem] blur opacity-20 group-focus-within:opacity-50 transition-opacity" />
              <div className="relative glass border-white/10 bg-ink/80 rounded-[2rem] p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden">
                <div className="flex items-end gap-2 px-2">
                  <button className="mb-2.5 p-2 rounded-xl hover:bg-white/10 text-slate-400 transition-colors shrink-0">
                    <Plus size={20} />
                  </button>
                  
                  <textarea
                    ref={messageRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Veda anything about your career..."
                    className="flex-1 bg-transparent px-2 py-4 text-white text-sm outline-none resize-none max-h-40 min-h-[52px] custom-scrollbar placeholder-slate-500"
                    rows={1}
                  />

                  <button
                    onClick={() => void handleSendMessage()}
                    disabled={!draft.trim() || sending}
                    className={cn(
                      "mb-2.5 p-3 rounded-2xl transition-all disabled:opacity-50 disabled:scale-100 active:scale-95 shrink-0",
                      draft.trim() ? "bg-brand text-white shadow-glow hover:scale-105" : "bg-white/5 text-slate-500"
                    )}
                  >
                    {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                  </button>
                </div>
              </div>
              <p className="mt-3 text-center text-[9px] text-slate-600 font-black uppercase tracking-[0.3em]">
                Veda AI Insight Engine • Career OS
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ message }: { message: any }) {
  const isUser = message.role === "user";

  return (
    <div className={cn(
      "flex gap-6 animate-slide-up",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      <div className={cn(
        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg",
        isUser 
          ? "bg-white text-obsidian" 
          : "bg-brand/10 border border-brand/20 text-brand"
      )}>
        {isUser ? <UserRound size={18} /> : <Bot size={18} />}
      </div>

      <div className={cn(
        "flex flex-col gap-2 max-w-[85%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "px-6 py-4 rounded-[1.8rem] text-sm leading-relaxed shadow-2xl backdrop-blur-xl transition-all border",
          isUser 
            ? "bg-gradient-to-br from-brand to-purple-600 border-white/20 text-white rounded-tr-none shadow-[0_10px_40px_rgba(124,92,255,0.25)]" 
            : "glass border-white/10 bg-white/[0.05] text-slate-100 rounded-tl-none shadow-black/20"
        )}>
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>
        <div className="flex items-center gap-2 px-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {isUser ? "You" : "Veda"}
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-700" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {formatTime(message.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
