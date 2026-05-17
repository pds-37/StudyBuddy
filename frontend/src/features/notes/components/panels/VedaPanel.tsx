import { useState } from "react";
import { AlertTriangle, Briefcase, GitBranch, Send, Sparkles, X } from "lucide-react";
import type { VedaNudge } from "../../types/notes.types";
import { useNotesStore } from "../../store/notesStore";

function getNudgeMeta(nudge: VedaNudge) {
  if (nudge.type === "recall-warning") {
    return { label: "Recall warning", icon: AlertTriangle, color: "text-amber-400" };
  }
  if (nudge.type === "connection") {
    return { label: "Connection", icon: GitBranch, color: "text-purple-400" };
  }
  return { label: "Job context", icon: Briefcase, color: "text-blue-400" };
}

export function VedaPanel() {
  const [prompt, setPrompt] = useState("");
  const vedaNudges = useNotesStore((state) => state.vedaNudges);
  const dismissNudge = useNotesStore((state) => state.dismissNudge);

  return (
    <div className="flex min-h-full flex-col gap-3 text-[13px] text-zinc-300">
      <div className="space-y-3">
        {vedaNudges.map((nudge) => {
          const meta = getNudgeMeta(nudge);
          const Icon = meta.icon;

          return (
            <article key={nudge.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 transition-colors duration-150">
              <div className="flex items-start gap-2">
                <div className={`flex min-w-0 flex-1 items-center gap-1.5 ${meta.color}`}>
                  <Icon size={14} />
                  <span className="text-[10.5px] font-medium uppercase tracking-widest">{meta.label}</span>
                </div>
                <button
                  type="button"
                  onClick={() => dismissNudge(nudge.id)}
                  className="flex h-6 w-6 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300"
                  aria-label={`Dismiss ${nudge.title}`}
                >
                  <X size={13} />
                </button>
              </div>
              <h4 className="mt-2 text-[13px] font-medium text-zinc-100">{nudge.title}</h4>
              <p className="mt-1 text-[11.5px] leading-5 text-zinc-500">{nudge.body}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setPrompt(nudge.actionPrompt)}
                  className="rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 px-3 py-1.5 text-[12px] flex items-center gap-1.5 active:scale-[0.98] transition-transform duration-75"
                >
                  <Sparkles size={12} />
                  {nudge.actionLabel}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="sticky bottom-0 mt-auto border-t border-zinc-800 bg-zinc-950 pt-3">
        <div className="flex items-center gap-2">
          <input
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Ask VEDA..."
            className="min-w-0 flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-[12px] text-zinc-100 outline-none focus:border-zinc-600"
          />
          <button
            type="button"
            className="rounded-lg border border-purple-700 bg-purple-700 px-2 py-1.5 text-white hover:bg-purple-600 active:scale-[0.98] transition-transform duration-75"
            aria-label="Send to VEDA"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
