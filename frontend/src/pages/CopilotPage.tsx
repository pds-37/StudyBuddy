import { Bot, Command, MessageSquareText, Sparkles } from "lucide-react";
import { CopilotChat } from "../features/copilot/components/CopilotChat";

/** Page for AI career copilot chat interface. */
export function CopilotPage() {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-glow backdrop-blur-xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan/20 bg-cyan/10 px-3 py-1.5 text-xs font-medium text-cyan">
              <Bot className="h-3.5 w-3.5" />
              AI Career Copilot
            </div>
            <h1 className="mt-4 max-w-3xl font-display text-3xl font-black tracking-[-0.04em] text-white md:text-5xl">
              Ask smarter. Apply faster.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
              Chat with a context-aware assistant that uses your skills, roadmap, notes, and jobs to keep career prep moving.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[430px]">
            {[
              { label: "Context", value: "Profile", icon: Sparkles },
              { label: "Mode", value: "Career", icon: MessageSquareText },
              { label: "Shortcut", value: "Cmd K", icon: Command }
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <Icon className="h-4 w-4 text-cyan" />
                  <p className="mt-3 text-xs text-slate-500">{item.label}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{item.value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <CopilotChat />
    </div>
  );
}
