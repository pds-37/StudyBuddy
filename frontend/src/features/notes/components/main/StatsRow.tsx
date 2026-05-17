import { Brain, Flame, Layers, RefreshCw, type LucideIcon } from "lucide-react";
import { useNotesStore } from "../../store/notesStore";

type Metric = {
  label: string;
  value: string | number;
  sub: string;
  icon: LucideIcon;
  color: string;
};

export function StatsRow() {
  const stats = useNotesStore((state) => state.stats);

  const metrics: Metric[] = [
    {
      label: "Concepts",
      value: stats.totalConcepts,
      sub: "4 added this week",
      icon: Layers,
      color: "text-purple-400"
    },
    {
      label: "Retention",
      value: `${stats.retention}%`,
      sub: "Accelerating",
      icon: Brain,
      color: "text-teal-400"
    },
    {
      label: "Due today",
      value: stats.dueToday,
      sub: `~${stats.dueToday * 3} min total`,
      icon: RefreshCw,
      color: "text-amber-400"
    },
    {
      label: "Streak",
      value: `${stats.streakDays}d`,
      sub: `${stats.streakCompletedToday}/${stats.streakGoalToday} today`,
      icon: Flame,
      color: "text-red-400"
    }
  ];

  return (
    <div className="grid shrink-0 grid-cols-2 gap-2 p-5 pb-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;

        return (
          <article key={metric.label} className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 dark:bg-zinc-900">
            <p className="flex items-center gap-1 text-[11px] text-zinc-500">
              <Icon size={13} className={metric.color} />
              {metric.label}
            </p>
            <p className="mt-1 font-mono text-xl font-medium text-zinc-100">{metric.value}</p>
            <p className="mt-0.5 text-[11px] text-zinc-600">{metric.sub}</p>
          </article>
        );
      })}
    </div>
  );
}
