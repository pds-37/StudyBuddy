import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Bot, Loader2, MessageSquare, Send, Volume2, VolumeX, X, Sparkles, UserRound } from "lucide-react";
import { cn } from "../../../lib/utils/cn";
import { useCopilotStore } from "../../../store/copilot-store";
import { useSpeechSynthesis } from "../../../hooks/useSpeechSynthesis";
import { useAppStore } from "../../../store/app-store";
import type { CopilotMessage } from "@studybuddy/shared";

/** Floating AI Mentor Widget */
export function GlobalCopilotWidget() {
  const {
    currentConversation,
    loading,
    sending,
    isWidgetOpen: isOpen,
    setIsWidgetOpen: setIsOpen,
    sendMessage: storeSendMessage,
    fetchConversations,
    createNewConversation
  } = useCopilotStore();
  
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const user = useAppStore((state) => state.user);

  const { speak, stop, isSpeaking, supported } = useSpeechSynthesis();

  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      void fetchConversations();
    }
  }, [fetchConversations, isAuthenticated]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, currentConversation?.messages, sending]);

  const visibleMessages = currentConversation?.messages.filter((m) => m.role !== "system") ?? [];

  const handleSendMessage = async () => {
    const messageToSend = draft.trim();
    if (!messageToSend || sending) return;

    if (!isAuthenticated) {
      // For guests, we could either show a login prompt or just simulate a response
      // For now, let's treat the message as a "Quick Start" target if it looks like one
      if (messageToSend.length > 3 && messageToSend.length < 50) {
        localStorage.setItem("studybuddy_pending_target", messageToSend);
      }
      setDraft("");
      // Add a local message so it doesn't look broken
      return;
    }

    if (!currentConversation) {
      await createNewConversation();
    }

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
    <>
      {/* AI Chat Drawer / Popover */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 flex w-[min(calc(100vw-48px),400px)] flex-col overflow-hidden rounded-[2rem] border border-white/[0.08] bg-slate-50 dark:bg-panel bg-slate-50 dark:bg-panel/95 shadow-[0_20px_80px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-2xl transition-all duration-500",
          isOpen ? "h-[600px] max-h-[calc(100vh-96px)] translate-y-0 opacity-100" : "pointer-events-none h-[600px] translate-y-12 opacity-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.04] bg-white/[0.02] p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan/10 text-cyan border border-cyan/20">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-900 dark:text-white">Veda AI</h3>
              <div className="flex items-center gap-1.5">
                <p className="text-[11px] text-slate-500 dark:text-slate-500 dark:text-slate-400">{isAuthenticated ? `Mentor for ${user?.name || "you"}` : "Guest Mode"}</p>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-brand/10 border border-brand/20 text-brand font-bold uppercase tracking-tighter">Llama 3.1</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="grid h-8 w-8 place-items-center rounded-full text-slate-500 dark:text-slate-500 dark:text-slate-400 transition hover:bg-white/[0.06] hover:text-slate-900 dark:text-slate-900 dark:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {visibleMessages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                <MessageSquare className="h-6 w-6 text-slate-500" />
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-900 dark:text-white">How can I help you today?</p>
              <p className="mt-1 text-xs text-slate-500 max-w-[240px]">Ask me anything about your career roadmap, interview prep, or daily tasks.</p>
            </div>
          ) : (
            visibleMessages.map((msg, i) => (
              <div key={msg.id || i} className={cn("flex flex-col gap-1.5", msg.role === "user" ? "items-end" : "items-start")}>
                <div
                  className={cn(
                    "max-w-[90%] rounded-[1.5rem] px-5 py-3 text-[13px] leading-relaxed shadow-xl backdrop-blur-3xl border transition-all",
                    msg.role === "user"
                      ? "rounded-tr-none bg-gradient-to-br from-brand to-purple-600 border-white/20 text-slate-900 font-bold"
                      : "rounded-tl-none border-white/10 bg-white/[0.03] text-slate-100"
                  )}
                >
                  {msg.content}
                </div>
                {msg.role === "assistant" && supported && (
                  <div className="flex items-center gap-3 px-2">
                    <button
                      onClick={() => isSpeaking ? stop() : speak(msg.content)}
                      className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 text-slate-500 hover:text-brand transition-colors"
                    >
                      {isSpeaking ? <VolumeX size={10} /> : <Volume2 size={10} />}
                      {isSpeaking ? "Stop" : "Listen"}
                    </button>
                    <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">{new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
              </div>
            ))
          )}
          {sending && (
            <div className="flex justify-start">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/[0.04] bg-white/[0.02] px-4 py-2 text-xs text-slate-500 dark:text-slate-500 dark:text-slate-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan" />
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-obsidian/50 border-t border-white/[0.04]">
          <div className="relative group">
             <div className="absolute -inset-0.5 bg-gradient-to-r from-brand to-purple-600 rounded-2xl blur opacity-0 group-focus-within:opacity-20 transition-opacity" />
             <div className="relative flex items-end gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-1.5 focus-within:border-brand/40 transition-all">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Veda anything..."
                  className="max-h-32 min-h-[44px] w-full resize-none bg-transparent px-4 py-2.5 text-[13px] text-white placeholder-slate-600 outline-none"
                  rows={1}
                />
                <button
                  onClick={() => void handleSendMessage()}
                  disabled={!draft.trim() || sending}
                  className={cn(
                    "grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-all",
                    draft.trim() ? "bg-brand text-slate-900 shadow-glow" : "bg-white/5 text-slate-600"
                  )}
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 fill-current" />}
                </button>
             </div>
          </div>
        </div>
      </div>
    </>
  );
}
