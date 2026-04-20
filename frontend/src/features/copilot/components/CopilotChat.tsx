import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
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
  UserRound
} from "lucide-react";
import { cn } from "../../../lib/utils/cn";
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

/** Formats timestamps for message metadata. */
function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

/** Formats dates for the conversation list. */
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString([], {
    month: "short",
    day: "numeric"
  });
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
    <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] shadow-[0_34px_120px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
      <div className="grid min-h-[720px] lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="flex min-h-[320px] flex-col border-b border-white/10 bg-black/20 lg:border-b-0 lg:border-r">
          <div className="border-b border-white/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cyan">Conversations</p>
                <p className="mt-1 text-sm text-slate-500">{conversations.length} saved threads</p>
              </div>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-cyan/30 hover:bg-cyan/10 hover:text-cyan disabled:opacity-50"
                title="Refresh conversations"
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => void handleNewConversation()}
              disabled={loading || sending}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_44px_rgba(34,211,238,0.18)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              New chat
            </button>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {loading && conversations.length === 0 ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-2xl border border-white/8 bg-white/[0.035]" />
              ))
            ) : conversations.length > 0 ? (
              conversations.map((conversation) => {
                const isActive = currentConversation?._id === conversation._id;
                const title = getConversationTitle(conversation.messages);
                const messageCount = conversation.messages.filter((message) => message.role !== "system").length;

                return (
                  <button
                    key={conversation._id}
                    type="button"
                    onClick={() => selectConversation(conversation._id)}
                    className={cn(
                      "group w-full rounded-2xl border p-3 text-left transition",
                      isActive
                        ? "border-cyan/25 bg-cyan/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                        : "border-white/8 bg-white/[0.025] hover:border-white/15 hover:bg-white/[0.05]"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "grid h-9 w-9 flex-shrink-0 place-items-center rounded-2xl transition",
                          isActive ? "bg-cyan/15 text-cyan" : "bg-white/[0.04] text-slate-500 group-hover:text-slate-200"
                        )}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-white">{title}</span>
                        <span className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                          <Clock3 className="h-3 w-3" />
                          {formatDate(conversation.updatedAt)}
                          <span className="h-1 w-1 rounded-full bg-slate-700" />
                          {messageCount} msg
                        </span>
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4 text-sm leading-6 text-slate-400">
                No conversations yet. Start one and your threads will appear here.
              </div>
            )}
          </div>
        </aside>

        <div className="relative flex min-w-0 flex-col bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.08),transparent_22rem)]">
          <div className="flex flex-col gap-4 border-b border-white/10 bg-black/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl border border-cyan/20 bg-cyan/10 text-cyan shadow-[0_0_34px_rgba(34,211,238,0.12)]">
                <Bot className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-white">{activeTitle}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {currentConversation ? `${totalMessages} visible messages` : "Create a thread to begin"}
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 text-xs text-slate-400">
              <span className={cn("h-2 w-2 rounded-full", sending ? "bg-amber-400" : "bg-emerald-400")} />
              {sending ? "Thinking" : "Ready"}
            </div>
          </div>

          {error ? (
            <div className="mx-4 mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-100">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="inline-flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-300" />
                  {error}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={clearError}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/10"
                  >
                    Dismiss
                  </button>
                  <button
                    type="button"
                    onClick={handleRefresh}
                    className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-slate-100"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex-1 overflow-y-auto px-4 py-5">
            {currentConversation && visibleMessages.length > 0 ? (
              <div className="mx-auto flex max-w-3xl flex-col gap-4">
                {visibleMessages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}

                {sending ? (
                  <div className="flex justify-start">
                    <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-sm text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                      <Loader2 className="h-4 w-4 animate-spin text-cyan" />
                      Copilot is reading your context...
                    </div>
                  </div>
                ) : null}

                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="grid h-full min-h-[380px] place-items-center">
                <div className="max-w-xl text-center">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-[1.4rem] border border-cyan/20 bg-cyan/10 text-cyan shadow-[0_0_44px_rgba(34,211,238,0.14)]">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <h3 className="mt-6 text-2xl font-bold tracking-tight text-white">Start with a career question.</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    Ask about your roadmap, weak spots, job matches, portfolio proof points, or the next best study sprint.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {suggestedPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => setDraft(prompt)}
                        className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs text-slate-300 transition hover:border-cyan/25 hover:bg-cyan/10 hover:text-white"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-white/10 bg-black/20 p-4">
            <div className="mx-auto max-w-3xl">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
                <textarea
                  ref={messageRef}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your skills, roadmap, jobs, or next study sprint..."
                  className="max-h-40 min-h-[76px] w-full resize-none bg-transparent px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-500"
                  rows={2}
                  disabled={loading || sending}
                />
                <div className="flex flex-col gap-3 border-t border-white/8 px-2 pb-1 pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-500">Press Enter to send. Shift + Enter for a new line.</p>
                  <button
                    type="button"
                    onClick={() => void handleSendMessage()}
                    disabled={!draft.trim() || sending}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan to-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_44px_rgba(34,211,238,0.2)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type ChatMessageProps = {
  message: CopilotMessage;
};

/** Renders one chat message with role-specific SaaS styling. */
function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser ? (
        <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-2xl border border-cyan/20 bg-cyan/10 text-cyan">
          <Bot className="h-4 w-4" />
        </div>
      ) : null}

      <div
        className={cn(
          "max-w-[min(78%,680px)] rounded-[1.35rem] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
          isUser
            ? "rounded-tr-md bg-gradient-to-br from-blue-500 to-cyan text-white"
            : "rounded-tl-md border border-white/10 bg-white/[0.055] text-slate-100 backdrop-blur-xl"
        )}
      >
        <div className="whitespace-pre-wrap text-sm leading-7">{message.content}</div>
        <div className={cn("mt-2 flex items-center gap-2 text-[11px]", isUser ? "text-blue-100" : "text-slate-500")}>
          {isUser ? <UserRound className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
          {isUser ? "You" : "Copilot"}
          <span className="h-1 w-1 rounded-full bg-current opacity-50" />
          {formatTime(message.createdAt)}
        </div>
      </div>

      {isUser ? (
        <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] text-slate-300">
          <UserRound className="h-4 w-4" />
        </div>
      ) : null}
    </div>
  );
}
