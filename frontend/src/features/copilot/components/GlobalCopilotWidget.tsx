import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Bot, Loader2, MessageSquare, Send, Volume2, VolumeX, X, Sparkles, UserRound } from "lucide-react";
import { cn } from "../../../lib/utils/cn";
import { useCopilotStore } from "../../../store/copilot-store";
import { useSpeechSynthesis } from "../../../hooks/useSpeechSynthesis";
import { useAppStore } from "../../../store/app-store";
import type { CopilotMessage } from "@studybuddy/shared";

/** Floating AI Mentor Widget */
export function GlobalCopilotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  
  const {
    currentConversation,
    loading,
    sending,
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
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-brand to-cyan shadow-[0_0_40px_rgba(34,211,238,0.3)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_60px_rgba(34,211,238,0.5)]",
          isOpen && "rotate-90 scale-0 opacity-0"
        )}
      >
        <Sparkles className="h-6 w-6 text-white" />
      </button>

      {/* AI Chat Drawer / Popover */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 flex w-[min(calc(100vw-48px),400px)] flex-col overflow-hidden rounded-[2rem] border border-white/[0.08] bg-panel/95 shadow-[0_20px_80px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-2xl transition-all duration-500",
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
              <h3 className="text-sm font-semibold text-white">Veda AI</h3>
              <div className="flex items-center gap-1.5">
                <p className="text-[11px] text-slate-400">{isAuthenticated ? `Mentor for ${user?.name || "you"}` : "Guest Mode"}</p>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-brand/10 border border-brand/20 text-brand font-bold uppercase tracking-tighter">Llama 3.1</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="grid h-8 w-8 place-items-center rounded-full text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
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
              <p className="text-sm font-medium text-white">How can I help you today?</p>
              <p className="mt-1 text-xs text-slate-500 max-w-[240px]">Ask me anything about your career roadmap, interview prep, or daily tasks.</p>
            </div>
          ) : (
            visibleMessages.map((msg, i) => (
              <div key={msg.id || i} className={cn("flex flex-col gap-1", msg.role === "user" ? "items-end" : "items-start")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                    msg.role === "user"
                      ? "rounded-tr-sm bg-gradient-to-br from-brand to-cyan text-white"
                      : "rounded-tl-sm border border-white/[0.04] bg-white/[0.02] text-slate-200"
                  )}
                >
                  {msg.content}
                </div>
                {msg.role === "assistant" && supported && (
                  <div className="flex items-center gap-2 px-1">
                    <button
                      onClick={() => isSpeaking ? stop() : speak(msg.content)}
                      className="text-[10px] flex items-center gap-1 text-slate-500 hover:text-cyan transition-colors"
                    >
                      {isSpeaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                      {isSpeaking ? "Stop" : "Listen"}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
          {sending && (
            <div className="flex justify-start">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/[0.04] bg-white/[0.02] px-4 py-2 text-xs text-slate-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan" />
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-white/[0.04] bg-white/[0.01] p-3">
          <div className="flex items-end gap-2 rounded-xl border border-white/[0.06] bg-black/40 p-1.5 focus-within:border-cyan/50 focus-within:ring-1 focus-within:ring-cyan/50 transition-all">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Veda..."
              className="max-h-32 min-h-[40px] w-full resize-none bg-transparent px-3 py-2 text-sm text-white placeholder-slate-500 outline-none"
              rows={1}
            />
            <button
              onClick={() => void handleSendMessage()}
              disabled={!draft.trim() || sending}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-cyan text-slate-950 transition hover:bg-cyan/90 disabled:opacity-50 disabled:hover:bg-cyan"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
