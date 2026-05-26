import { useMemo, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useNotesStore } from "../../store/notesStore";

const dailyPrompts = [
  "Paste something you struggled with today — VEDA will extract the concept",
  "Drop a code snippet you want to remember",
  "Write one thing you learned from a mock interview today",
  "What concept are you most likely to forget this week?"
];

export function IngestBar() {
  const storePrompt = useNotesStore((state) => state.ingestPrompt);
  const submitIngest = useNotesStore((state) => state.submitIngest);
  const isLoading = useNotesStore((state) => state.isLoading);
  const [text, setText] = useState("");
  const dailyPrompt = useMemo(() => dailyPrompts[new Date().getDay() % dailyPrompts.length] ?? storePrompt, [storePrompt]);

  async function handleSubmit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    await submitIngest(trimmed);
    setText("");
  }

  return (
    <section className="shrink-0 px-5 py-3">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 bg-zinc-900">
        <div className="mb-2 flex items-center gap-1.5 text-[11.5px] text-zinc-500">
          <Sparkles size={13} className="text-purple-400" />
          <span>{dailyPrompt}</span>
        </div>
        <div className="flex items-center gap-2">
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Paste note, snippet, or interview feedback..."
            className="h-9 min-w-0 flex-1 resize-none rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-[13px] text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-zinc-600"
          />
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={!text.trim() || isLoading}
            className="rounded-lg border border-purple-700 bg-purple-700 px-3 py-1.5 text-[12px] text-white hover:bg-purple-600 flex items-center gap-1.5 active:scale-[0.98] transition-transform duration-75 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {isLoading ? "Ingesting..." : "Ingest"}
          </button>
        </div>
      </div>
    </section>
  );
}
