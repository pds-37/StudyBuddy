import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Bot, Loader2, MessageSquare, Send, Volume2, VolumeX, X } from "lucide-react";
import { cn } from "../../../lib/utils/cn";
import { useCopilotStore } from "../../../store/copilot-store";
import { useSpeechSynthesis } from "../../../hooks/useSpeechSynthesis";
import { useAppStore } from "../../../store/app-store";
import type { CopilotMessage } from "@studybuddy/shared";
import { MarkdownContent } from "./CopilotChat";

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
  const isDemoMode = useAppStore((state) => state.isDemoMode);
  const user = useAppStore((state) => state.user);

  const { speak, stop, isSpeaking, supported } = useSpeechSynthesis();

  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated && !isDemoMode) {
      void fetchConversations();
    }
  }, [fetchConversations, isAuthenticated, isDemoMode]);

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
          "fixed bottom-5 right-5 z-50 flex w-[min(calc(100vw-32px),360px)] flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-[#10141c] shadow-2xl shadow-black/40 transition-all duration-300",
          isOpen ? "h-[520px] max-h-[calc(100vh-80px)] translate-y-0 opacity-100" : "pointer-events-none h-[520px] translate-y-6 opacity-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg border border-cyan/20 bg-cyan/10 text-cyan">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Veda (Your AI Dost)</h3>
              <div className="flex items-center gap-1.5">
                <p className="text-[11px] text-slate-500">{isAuthenticated ? `Mentor Dost for ${user?.name || "you"}` : "Guest Mode"}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="grid h-8 w-8 place-items-center rounded-md text-slate-500 transition hover:bg-white/[0.06] hover:text-white"
            aria-label="Close Veda chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4 custom-scrollbar">
          {visibleMessages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl border border-white/[0.06] bg-white/[0.03]">
                <MessageSquare className="h-6 w-6 text-slate-500" />
              </div>
              <p className="text-sm font-medium text-white">Hey there! How can I help?</p>
              <p className="mt-1 max-w-[240px] text-xs leading-5 text-slate-500">Ask your dost about roadmap, recall, projects, resume, or jobs.</p>
            </div>
          ) : (
            visibleMessages.map((msg, i) => (
              <div key={msg.id || i} className={cn("flex flex-col gap-1.5", msg.role === "user" ? "items-end" : "items-start")}>
                <div
                  className={cn(
                    "max-w-[90%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed",
                    msg.role === "user"
                      ? "bg-[#2f3440] text-white"
                      : "border border-white/[0.07] bg-white/[0.035] text-slate-100"
                  )}
                >
                  {msg.role === "assistant" ? <MarkdownContent content={msg.content} compact /> : msg.content}
                </div>
                {msg.role === "assistant" && supported && (
                  <div className="flex items-center gap-3 px-2">
                    <button
                      onClick={() => isSpeaking ? stop() : speak(msg.content)}
                      className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-cyan"
                    >
                      {isSpeaking ? <VolumeX size={10} /> : <Volume2 size={10} />}
                      {isSpeaking ? "Stop" : "Listen"}
                    </button>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300">{new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
              </div>
            ))
          )}
          {sending && (
            <div className="flex justify-start">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-xs text-slate-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan" />
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-white/[0.06] p-3">
          <div className="relative">
             <div className="flex items-end gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1.5 transition-all focus-within:border-white/20">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message your Dost..."
                  className="max-h-24 min-h-[40px] w-full resize-none bg-transparent px-3 py-2.5 text-[13px] text-white outline-none placeholder:text-slate-400"
                  rows={1}
                />
                <button
                  onClick={() => void handleSendMessage()}
                  disabled={!draft.trim() || sending}
                  className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-all",
                    draft.trim() ? "bg-transparent text-slate-950" : "bg-white/[0.06] text-slate-400"
                  )}
                  aria-label="Send message"
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
