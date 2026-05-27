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
  X
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
    <div className="flex h-[calc(100vh-96px)] min-h-[620px] overflow-hidden rounded-lg border border-white/[0.06] bg-[#0f1117]">
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

      <main className="flex min-w-0 flex-1 flex-col bg-[#141820]">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.06] px-4 sm:px-5">
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
              <h1 className="truncate text-sm font-semibold text-white">Veda</h1>
              <p className="truncate text-xs text-slate-500">Your study and career copilot</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleNewChat}
            className="inline-flex items-center gap-2 rounded-md border border-white/[0.08] px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/[0.05] hover:text-white"
          >
            <Plus size={14} />
            New chat
          </button>
        </header>

        {error && (
          <div className="mx-auto mt-4 flex w-[min(860px,calc(100%-32px))] items-center gap-2 rounded-md border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">
            <span className="min-w-0 flex-1">{error}</span>
            <button type="button" onClick={clearError} className="rounded p-1 hover:bg-white/10" aria-label="Dismiss error">
              <X size={14} />
            </button>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto">
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
    <div className="shrink-0 bg-[#141820] px-4 pb-4 pt-3 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end gap-2 rounded-xl border border-white/[0.1] bg-[#1c212b] p-2 shadow-lg shadow-black/15 focus-within:border-white/20">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Message Veda"
            className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-3 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-500"
          />
          <button
            type="button"
            onClick={onSend}
            disabled={!draft.trim() || sending}
            className={cn(
              "mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
              draft.trim() && !sending
                ? "bg-transparent text-slate-950 hover:bg-slate-200"
                : "bg-white/[0.08] text-slate-400"
            )}
            aria-label="Send message"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-slate-400">Veda can make mistakes. Check important details.</p>
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
      className={cn("flex gap-4", isUser && "justify-end")}
    >
      {!isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-slate-200">
          <Bot size={15} />
        </div>
      )}

      <div className={cn("min-w-0 max-w-[min(720px,88%)]", isUser && "flex flex-col items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-6",
            isUser ? "bg-[#2f3440] text-white" : "text-slate-100"
          )}
        >
          <div className="whitespace-pre-wrap">{message.content}</div>
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
