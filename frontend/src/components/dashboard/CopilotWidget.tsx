import { Link } from "react-router-dom";
import { MessageCircle, MessageSquare, Plus, Sparkles } from "lucide-react";
import { Card } from "../ui/Card";
import { useCopilotStore } from "../../store/copilot-store";

/** Dashboard widget showing copilot conversation summary. */
export function CopilotWidget() {
  const { conversations, loading } = useCopilotStore();

  const totalMessages = conversations.reduce((sum, conv) => sum + conv.messages.length, 0);
  const recentConversation = conversations.length > 0 ? conversations[0] : null;

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-500/15 p-3 text-emerald-300">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI copilot</h3>
            <p className="text-sm text-slate-400">Context-aware career guidance</p>
          </div>
        </div>
        <Link
          to="/copilot"
          className="rounded-full border border-white/10 px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-slate-300 transition hover:border-white/20 hover:text-white"
        >
          Open
        </Link>
      </div>

      {loading ? (
        <div className="mt-6 animate-pulse">
          <div className="h-24 rounded-[1.5rem] bg-white/5" />
        </div>
      ) : conversations.length === 0 ? (
        <div className="mt-6 rounded-[1.5rem] border border-white/8 bg-black/20 p-5 text-center">
          <MessageCircle className="mx-auto h-9 w-9 text-slate-500" />
          <p className="mt-4 text-base font-semibold text-white">Start your first copilot thread</p>
          <p className="mt-2 text-sm leading-7 text-slate-400">
            Ask about role readiness, learning plans, job prep, or how to sequence your next week.
          </p>
          <Link
            to="/copilot"
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-white/20 hover:text-white"
          >
            Start chatting
            <Plus className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          <div className="rounded-[1.5rem] border border-white/8 bg-black/20 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Conversation memory</p>
                <p className="mt-3 font-display text-4xl tracking-tight text-white">{conversations.length}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">{totalMessages} total messages</p>
                <p className="mt-1 text-xs text-slate-500">Powered by your notes and roadmap context</p>
              </div>
            </div>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-2 text-sm text-sky-200">
              <MessageSquare className="h-4 w-4" />
              Personalized guidance ready
            </div>
          </div>

          <div className="rounded-[1.35rem] border border-white/8 bg-white/[0.03] p-4">
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Latest thread</p>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {recentConversation?.messages.length && recentConversation.messages.length > 1
                ? recentConversation.messages[1].content.substring(0, 120) + "..."
                : "Open the copilot to continue the latest conversation or start a fresh one."}
            </p>
          </div>

          <Link
            to="/copilot"
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan transition hover:text-white"
          >
            Continue chatting
            <MessageSquare className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </Card>
  );
}
