import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUp,
  BookOpenText,
  Brain,
  CalendarClock,
  ChevronDown,
  Clock3,
  MessageSquareText,
  Mic,
  MicOff,
  NotebookPen,
  Plus,
  Sparkles
} from "lucide-react";

import LoadingScreen from "@/components/LoadingScreen";
import { useSession } from "@/hooks/useSession";
import { apiRequest } from "@/lib/api";
import { useUiStore } from "@/lib/ui-store";
import type { BuddyChatTurn, DashboardPayload, StudyNote } from "@shared";

type NotesResponse = {
  notes: StudyNote[];
};

type DashboardResponse = {
  dashboard: DashboardPayload;
};

type ChatResponse = {
  reply: string;
};

type UiMessage = BuddyChatTurn & {
  id: string;
  pending?: boolean;
};

type QuickAction = {
  label: string;
  prompt: string;
};

type SidebarAction = {
  id: "chat" | "notes" | "revision" | "weak";
  label: string;
  icon: LucideIcon;
};

type SpotlightItem = {
  title: string;
  subtitle: string;
  prompt: string;
  icon: LucideIcon;
};

type SpeechRecognitionAlternativeLike = {
  transcript: string;
};

type SpeechRecognitionResultLike = {
  0: SpeechRecognitionAlternativeLike;
  isFinal?: boolean;
  length: number;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
};

type SpeechRecognitionConstructorLike = new () => SpeechRecognitionLike;

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  });
}

export default function BuddyPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechMessage, setSpeechMessage] = useState("");
  const [activeRail, setActiveRail] = useState<SidebarAction["id"]>("chat");
  const composerInputRef = useRef<HTMLTextAreaElement | null>(null);
  const threadEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const session = useSession();
  const { openComposer } = useUiStore();

  const notesQuery = useQuery({
    queryKey: ["notes"],
    queryFn: () => apiRequest<NotesResponse>("/notes")
  });

  const dashboardQuery = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => apiRequest<DashboardResponse>("/dashboard")
  });

  const quickPrompts = useMemo<QuickAction[]>(() => {
    const latestSubject = notesQuery.data?.notes[0]?.subject ?? "my latest subject";
    const latestCategory = notesQuery.data?.notes[0]?.category ?? "my newest topic";
    const dashboardPrompts = dashboardQuery.data?.dashboard.quickPrompts ?? [];
    const base = [
      `Quiz me on ${latestSubject}`,
      `Explain ${latestCategory} simply`,
      "What should I study today?",
      "Turn my notes into flashcards",
      "Build a 30 minute revision sprint"
    ];
    const combined = [...dashboardPrompts, ...base];
    const unique = Array.from(new Set(combined)).slice(0, 5);

    return unique.map((prompt) => ({
      label: prompt.length > 28 ? `${prompt.slice(0, 27)}...` : prompt,
      prompt
    }));
  }, [dashboardQuery.data?.dashboard.quickPrompts, notesQuery.data?.notes]);

  const railActions = useMemo<SidebarAction[]>(
    () => [
      {
        id: "chat",
        label: "Chat",
        icon: MessageSquareText
      },
      {
        id: "notes",
        label: "Notes",
        icon: NotebookPen
      },
      {
        id: "revision",
        label: "Revision",
        icon: CalendarClock
      },
      {
        id: "weak",
        label: "Weak topic",
        icon: Brain
      }
    ],
    []
  );

  const recentNotes = useMemo(() => (notesQuery.data?.notes ?? []).slice(0, 3), [notesQuery.data?.notes]);

  const spotlightItems = useMemo<SpotlightItem[]>(() => {
    const dashboard = dashboardQuery.data?.dashboard;
    if (!dashboard) {
      return [];
    }

    const items: SpotlightItem[] = [];
    const firstPlan = dashboard.todayPlan[0];
    if (firstPlan) {
      items.push({
        title: `${firstPlan.subject} - ${firstPlan.topic}`,
        subtitle: `${firstPlan.minutes} min block | ${firstPlan.reason}`,
        prompt: `Build a focused ${firstPlan.minutes} minute session for ${firstPlan.subject} on ${firstPlan.topic}.`,
        icon: CalendarClock
      });
    }

    if (dashboard.weakTopicAlert) {
      items.push({
        title: dashboard.weakTopicAlert.topic,
        subtitle: dashboard.weakTopicAlert.warning,
        prompt: `Explain why ${dashboard.weakTopicAlert.topic} is weak and give me a recovery plan.`,
        icon: Brain
      });
    }

    if (dashboard.revisionQueue[0]) {
      items.push({
        title: dashboard.revisionQueue[0].topic,
        subtitle: `Due now | ${dashboard.revisionQueue[0].subject}`,
        prompt: `Quiz me on ${dashboard.revisionQueue[0].topic} with a quick revision round.`,
        icon: Clock3
      });
    }

    if (!items.length) {
      items.push({
        title: "Start a focused study session",
        subtitle: "Buddy can turn your notes into the next best move.",
        prompt: "Give me a focused study plan for today.",
        icon: Sparkles
      });
    }

    return items.slice(0, 3);
  }, [dashboardQuery.data?.dashboard]);

  const chatMutation = useMutation({
    mutationFn: ({
      message,
      history
    }: {
      message: string;
      history: BuddyChatTurn[];
    }) =>
      apiRequest<ChatResponse>("/ai/chat", {
        method: "POST",
        json: {
          message,
          history
        }
      })
  });

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => {
    const speechWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructorLike;
      webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
    };
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

    if (!Recognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onstart = () => {
      setSpeechMessage("Listening...");
      setIsListening(true);
    };
    recognition.onend = () => {
      setIsListening(false);
      setSpeechMessage("");
    };
    recognition.onerror = (event) => {
      setIsListening(false);
      setSpeechMessage(event.error === "not-allowed" ? "Mic permission denied." : "Voice input is unavailable.");
    };
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .slice(event.resultIndex)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();

      if (transcript) {
        setInput((current) => (current ? `${current.trimEnd()} ${transcript}`.trim() : transcript));
        setSpeechMessage("Added from mic.");
      }
    };

    recognitionRef.current = recognition;
    setSpeechSupported(true);

    return () => {
      recognition.abort();
      recognitionRef.current = null;
    };
  }, []);

  if (notesQuery.isLoading || dashboardQuery.isLoading || session.isLoading) {
    return <LoadingScreen message="Loading Buddy..." />;
  }

  const userName = session.data?.user?.name?.trim() || "there";
  const firstName = userName.split(" ")[0] || "there";
  const noteCount = notesQuery.data?.notes.length ?? 0;
  const messagesLabel = messages.length ? `${messages.length} messages active` : `${noteCount} notes in memory`;
  const dueToday = dashboardQuery.data?.dashboard.dueToday ?? 0;
  const revisionPrompt =
    dashboardQuery.data?.dashboard.revisionQueue[0]
      ? `Quiz me on ${dashboardQuery.data.dashboard.revisionQueue[0].topic} and tell me what to revise first.`
      : "What should I revise first today?";
  const weakPrompt = dashboardQuery.data?.dashboard.weakTopicAlert
    ? `Tell me why ${dashboardQuery.data.dashboard.weakTopicAlert.topic} is weak and how to recover it.`
    : "Tell me my weakest topic and how to recover it.";

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      setSpeechMessage("Voice input is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      return;
    }

    try {
      setSpeechMessage("");
      recognitionRef.current.start();
    } catch {
      setSpeechMessage("Mic could not start. Try again.");
    }
  };

  const focusComposer = (nextValue?: string) => {
    setActiveRail("chat");
    if (typeof nextValue === "string") {
      setInput(nextValue);
    }

    window.requestAnimationFrame(() => {
      composerInputRef.current?.focus();
    });
  };

  const sendMessage = (draft: string) => {
    const trimmed = draft.trim();
    if (!trimmed || chatMutation.isPending) {
      return;
    }

    const history = messages
      .filter((message) => !message.pending)
      .map(({ role, content }) => ({ role, content }));

    const userId = crypto.randomUUID();
    const pendingId = crypto.randomUUID();

    setMessages((current) => [
      ...current,
      { id: userId, role: "user", content: trimmed },
      { id: pendingId, role: "assistant", content: "Thinking...", pending: true }
    ]);
    setInput("");

    chatMutation.mutate(
      {
        message: trimmed,
        history
      },
      {
        onSuccess: (payload) => {
          setMessages((current) =>
            current.map((message) =>
              message.id === pendingId
                ? {
                    id: pendingId,
                    role: "assistant",
                    content: payload.reply
                  }
                : message
            )
          );
        },
        onError: () => {
          setMessages((current) =>
            current.map((message) =>
              message.id === pendingId
                ? {
                    id: pendingId,
                    role: "assistant",
                    content: "Buddy could not respond right now. Try again in a moment."
                  }
                : message
            )
          );
        }
      }
    );
  };

  const handleRailAction = (actionId: SidebarAction["id"]) => {
    setActiveRail(actionId);

    if (actionId === "chat") {
      focusComposer();
      return;
    }

    if (actionId === "notes") {
      openComposer();
      return;
    }

    if (actionId === "revision") {
      sendMessage(revisionPrompt);
      return;
    }

    sendMessage(weakPrompt);
  };

  return (
    <div className="buddy-copilot">
      <div className="buddy-copilot__grain" />

      <aside className="buddy-copilot__rail" aria-label="Buddy quick tools">
        <div className="buddy-copilot__rail-group">
          <div className="buddy-copilot__rail-brand">
            <Sparkles size={18} />
          </div>

          {railActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                className={`buddy-copilot__rail-button ${activeRail === action.id || (index === 0 && !activeRail) ? "is-active" : ""}`}
                onClick={() => handleRailAction(action.id)}
                aria-label={action.label}
                title={action.label}
                type="button"
              >
                <Icon size={18} />
              </button>
            );
          })}
        </div>

        <div className="buddy-copilot__rail-avatar">{firstName.slice(0, 1).toUpperCase()}</div>
      </aside>

      <section className="buddy-copilot__workspace">
        <header className="buddy-copilot__hero">
          <div className="buddy-copilot__hero-copy">
            <p className="eyebrow">Buddy AI</p>
            <h1>Hi {firstName}, what should we dive into today?</h1>
            <p>Buddy starts from your notes, roadmap, and revision queue so every answer is grounded in your study context.</p>
          </div>

          <button className="surface-link-button buddy-copilot__new-note" onClick={() => openComposer()}>
            <Plus size={16} />
            <span>New note</span>
          </button>
        </header>

        <section className="buddy-copilot__composer-card">
          <textarea
            ref={composerInputRef}
            className="buddy-copilot__input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder={messages.length ? "Continue the study chat" : "Message Buddy"}
          />

          <div className="buddy-copilot__composer-bar">
            <div className="buddy-copilot__composer-actions">
              <button className="buddy-copilot__icon-button" onClick={() => openComposer()} type="button" aria-label="Create note">
                <Plus size={18} />
              </button>

              <button className="buddy-copilot__mode-chip" type="button">
                <span>{messages.length ? "Focused" : "Smart"}</span>
                <ChevronDown size={14} />
              </button>
            </div>

            <div className="buddy-copilot__composer-actions buddy-copilot__composer-actions--right">
              <span className="buddy-copilot__status">
                {speechMessage || (speechSupported ? messagesLabel : "Voice input works in supported browsers")}
              </span>

              <button
                className={`buddy-copilot__icon-button ${isListening ? "is-listening" : ""}`}
                onClick={toggleVoiceInput}
                disabled={!speechSupported}
                type="button"
                aria-label={isListening ? "Stop voice input" : "Start voice input"}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              <button
                className="buddy-copilot__send"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || chatMutation.isPending}
                aria-label="Send message"
                type="button"
              >
                <ArrowUp size={18} />
              </button>
            </div>
          </div>
        </section>

        <div className="buddy-copilot__chips">
          {quickPrompts.map((prompt) => (
            <button key={prompt.prompt} className="buddy-copilot__chip" onClick={() => setInput(prompt.prompt)} type="button">
              {prompt.label}
            </button>
          ))}
        </div>

        {messages.length ? (
          <section className="buddy-copilot__thread-card">
            <div className="buddy-copilot__thread-meta">
              <span>{messages.length} turns active</span>
              <span>{dueToday} due today</span>
            </div>

            <div className="buddy-copilot__thread">
              {messages.map((message) => (
                <article key={message.id} className={`buddy-copilot__message buddy-copilot__message--${message.role}`}>
                  <div className="buddy-copilot__message-label">{message.role === "user" ? "You" : "Buddy"}</div>
                  <div className={`buddy-copilot__message-bubble buddy-copilot__message-bubble--${message.role}`}>
                    <p>{message.content}</p>
                  </div>
                </article>
              ))}
              <div ref={threadEndRef} />
            </div>
          </section>
        ) : (
          <div className="buddy-copilot__cards">
            <section className="buddy-copilot__card">
              <header className="buddy-copilot__card-head">
                <div>
                  <p>Attach recent note to chat</p>
                  <strong>{noteCount} notes in memory</strong>
                </div>
                <BookOpenText size={18} />
              </header>

              <div className="buddy-copilot__list">
                {recentNotes.length ? (
                  recentNotes.map((note) => (
                    <button
                      key={note.id}
                      className="buddy-copilot__list-row"
                      onClick={() =>
                        sendMessage(`Use my ${note.subject} note on ${note.category} to explain the main idea and give me the next study move.`)
                      }
                      type="button"
                    >
                      <div className="buddy-copilot__list-icon">
                        <NotebookPen size={16} />
                      </div>
                      <div className="buddy-copilot__list-copy">
                        <strong>
                          {note.subject} | {note.category}
                        </strong>
                        <span>{formatShortDate(note.createdAt)}</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="buddy-copilot__empty-card">
                    <strong>No notes yet</strong>
                    <p>Create your first note and Buddy will start using it as context instantly.</p>
                  </div>
                )}
              </div>
            </section>

            <section className="buddy-copilot__card">
              <header className="buddy-copilot__card-head">
                <div>
                  <p>Keep moving with Buddy</p>
                  <strong>Next best study actions</strong>
                </div>
                <Brain size={18} />
              </header>

              <div className="buddy-copilot__list">
                {spotlightItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button key={item.title} className="buddy-copilot__list-row" onClick={() => sendMessage(item.prompt)} type="button">
                      <div className="buddy-copilot__list-icon">
                        <Icon size={16} />
                      </div>
                      <div className="buddy-copilot__list-copy">
                        <strong>{item.title}</strong>
                        <span>{item.subtitle}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
