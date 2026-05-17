import { Play, RefreshCw } from "lucide-react";
import type { RecallCard as RecallCardType, RecallDifficulty } from "../../types/notes.types";
import { useNotesStore } from "../../store/notesStore";

function daysSince(date: Date | null) {
  if (!date) return "Never reviewed";
  const days = Math.max(0, Math.round((Date.now() - new Date(date).getTime()) / 86400000));
  return `${days}d ago`;
}

function priorityClass(priority: RecallCardType["priority"]) {
  if (priority === "critical") return "bg-red-900/40 text-red-400";
  if (priority === "medium") return "bg-amber-900/40 text-amber-400";
  return "bg-zinc-800 text-zinc-400";
}

function scoreColor(score: number) {
  if (score >= 70) return "bg-teal-400";
  if (score >= 40) return "bg-amber-400";
  return "bg-red-400";
}

function RecallCard({ card }: { card: RecallCardType }) {
  const submitRecall = useNotesStore((state) => state.submitRecall);
  const buttons: { label: string; difficulty: RecallDifficulty; className: string }[] = [
    { label: "Easy", difficulty: "easy", className: "hover:bg-green-900/30 hover:text-green-400" },
    { label: "Hard", difficulty: "hard", className: "hover:bg-amber-900/30 hover:text-amber-400" },
    { label: "Forgot", difficulty: "forgot", className: "hover:bg-red-900/30 hover:text-red-400" }
  ];

  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 transition-colors duration-150">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-[13px] font-medium text-zinc-100">{card.conceptTitle}</h4>
        <span className={`text-[10.5px] px-1.5 py-0.5 rounded-full ml-auto ${priorityClass(card.priority)}`}>{card.priority}</span>
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-zinc-800">
        <span className={`block h-full ${scoreColor(card.recallScore)}`} style={{ width: `${card.recallScore}%` }} />
      </div>
      <p className="mt-2 text-[11.5px] text-zinc-500">
        <span className="font-mono">{card.recallScore}%</span> recall · {daysSince(card.lastReviewed)}
      </p>
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {buttons.map((button) => (
          <button
            key={button.difficulty}
            type="button"
            onClick={() => void submitRecall(card.conceptId, button.difficulty)}
            className={`rounded-lg border border-zinc-700 px-2 py-1.5 text-[11.5px] text-zinc-300 active:scale-[0.98] transition-transform duration-75 ${button.className}`}
          >
            {button.label}
          </button>
        ))}
      </div>
    </article>
  );
}

export function ReviewPanel() {
  const stats = useNotesStore((state) => state.stats);
  const recallCards = useNotesStore((state) => state.recallCards);

  return (
    <div className="flex min-h-full flex-col gap-3 text-[13px] text-zinc-300">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
        <div className="flex items-center gap-2 text-amber-400">
          <RefreshCw size={14} />
          <span className="text-[12px] font-medium">{stats.dueToday} concepts due · ~{stats.dueToday * 3} min total</span>
        </div>
      </div>

      <div className="space-y-3">
        {recallCards.map((card) => (
          <RecallCard key={card.conceptId} card={card} />
        ))}
      </div>

      <button type="button" className="mt-auto rounded-lg border border-purple-700 bg-purple-700 px-3 py-2 text-[12px] text-white hover:bg-purple-600 flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform duration-75">
        <Play size={14} />
        Start 10-min session
      </button>
    </div>
  );
}
