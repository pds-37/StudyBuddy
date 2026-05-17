import { ArrowRight, CircleDot, Network } from "lucide-react";
import type { ConceptHealth } from "../../types/notes.types";
import { useNotesStore } from "../../store/notesStore";

const activity = [0.2, 0.45, 0.75, 0.35, 0.9, 0.6, 0.3, 0.8, 0.55, 0.7, 0.4, 1];

function healthLabel(health: ConceptHealth) {
  if (health === "strong") return "Strong";
  if (health === "needs-review") return "Needs review";
  return "Critical";
}

function healthColor(health: ConceptHealth) {
  if (health === "strong") return "text-teal-400";
  if (health === "needs-review") return "text-amber-400";
  return "text-red-400";
}

export function InsightsPanel() {
  const concepts = useNotesStore((state) => state.concepts);
  const healthRows: ConceptHealth[] = ["strong", "needs-review", "critical"];

  return (
    <div className="flex min-h-full flex-col gap-5 text-[13px] text-zinc-300">
      <section className="space-y-2">
        <h4 className="text-[10.5px] font-medium text-zinc-600 uppercase tracking-widest">Concept health</h4>
        <div className="space-y-2">
          {healthRows.map((health) => (
            <div key={health} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-2">
              <span className={`flex items-center gap-2 text-[12.5px] ${healthColor(health)}`}>
                <CircleDot size={13} />
                {healthLabel(health)}
              </span>
              <span className="font-mono text-[12px] text-zinc-400">{concepts.filter((concept) => concept.health === health).length}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h4 className="text-[10.5px] font-medium text-zinc-600 uppercase tracking-widest">Last 12 weeks</h4>
        <div className="grid grid-cols-6 gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 p-3">
          {activity.map((opacity, index) => (
            <span
              key={`week-${index + 1}`}
              className="h-6 rounded-md bg-purple-500"
              style={{ opacity }}
              aria-label={`Week ${index + 1} activity`}
            />
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h4 className="text-[10.5px] font-medium text-zinc-600 uppercase tracking-widest">Mini concept graph</h4>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-2">
          <svg width="206" height="110" viewBox="0 0 206 110" role="img" aria-label="Concept graph">
            <line x1="103" y1="55" x2="45" y2="26" stroke="#52525b" strokeWidth="1" />
            <line x1="103" y1="55" x2="160" y2="26" stroke="#52525b" strokeWidth="1" />
            <line x1="103" y1="55" x2="54" y2="88" stroke="#52525b" strokeWidth="1" />
            <line x1="103" y1="55" x2="154" y2="88" stroke="#52525b" strokeWidth="1" />
            {[
              { label: "Arrays", x: 103, y: 55, fill: "#7e22ce" },
              { label: "Linked", x: 45, y: 26, fill: "#3f3f46" },
              { label: "Trees", x: 160, y: 26, fill: "#3f3f46" },
              { label: "BFS", x: 54, y: 88, fill: "#991b1b" },
              { label: "Memo", x: 154, y: 88, fill: "#92400e" }
            ].map((node) => (
              <g key={node.label} role="button" tabIndex={0} className="cursor-pointer">
                <circle cx={node.x} cy={node.y} r="16" fill={node.fill} />
                <text x={node.x} y={node.y + 3} textAnchor="middle" fill="#f4f4f5" fontSize="9">
                  {node.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </section>

      <button type="button" className="mt-auto rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 px-3 py-1.5 text-[12px] flex items-center gap-1.5 active:scale-[0.98] transition-transform duration-75">
        <Network size={14} />
        Full graph view
        <ArrowRight size={13} className="ml-auto" />
      </button>
    </div>
  );
}
