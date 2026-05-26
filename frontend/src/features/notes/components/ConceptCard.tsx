import { Brain, Edit3 } from "lucide-react";
import type { Concept } from "../types/notes.types";

type ConceptCardProps = {
  concept: Concept;
};

function healthDotClass(health: Concept["health"]) {
  if (health === "strong") return "bg-green-500";
  if (health === "needs-review") return "bg-amber-400";
  return "bg-red-500";
}

function formatRelative(date: Date | null) {
  if (!date) return null;
  const days = Math.max(0, Math.round((Date.now() - new Date(date).getTime()) / 86400000));
  if (days === 0) return "today";
  return `${days}d ago`;
}

function formatDue(concept: Concept) {
  if (concept.health === "critical") return "recall dropping";
  if (concept.dueDate) {
    const due = new Date(concept.dueDate);
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dueStart = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const dayDelta = Math.round((dueStart.getTime() - start.getTime()) / 86400000);
    if (dayDelta <= 0) return "due today";
    return `due in ${dayDelta}d`;
  }
  return formatRelative(concept.lastReviewed) ?? "new concept";
}

export function ConceptCard({ concept }: ConceptCardProps) {
  const meta = formatDue(concept);
  const isCritical = concept.health === "critical";

  return (
    <article className="concept-card cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900 p-3 transition-colors duration-150 hover:border-zinc-600 first:border-purple-600 bg-zinc-900">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 text-[13px] font-medium text-zinc-100">{concept.title}</h3>
        <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${healthDotClass(concept.health)}`} />
      </div>

      <p className="mt-2 line-clamp-2 text-[11.5px] leading-5 text-zinc-400">{concept.excerpt}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {concept.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10.5px] text-zinc-400">
            {tag}
          </span>
        ))}
        {concept.linkedJobId && (
          <span className="rounded-full bg-purple-900/40 px-1.5 py-0.5 text-[10.5px] text-purple-300">
            {concept.linkedJobTitle}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className={`text-[11.5px] ${isCritical ? "text-red-400" : "text-zinc-500"}`}>{meta}</span>
        <div className="flex items-center gap-1">
          <button type="button" className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100" aria-label={`Recall ${concept.title}`}>
            <Brain size={13} />
          </button>
          <button type="button" className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100" aria-label={`Edit ${concept.title}`}>
            <Edit3 size={13} />
          </button>
        </div>
      </div>
    </article>
  );
}
