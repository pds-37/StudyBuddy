import { useEffect, useMemo, useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";

type Props = { step: number; totalSteps: number; messages: string[][] };

/* ─── Mini Neural SVG ─── */
function NeuralBackground() {
  const nodes = useMemo(() => Array.from({ length: 10 }, (_, i) => ({
    x: 15 + Math.random() * 70, y: 15 + Math.random() * 70, r: 1.5 + Math.random() * 2, d: Math.random() * 5,
  })), []);

  const edges = useMemo(() => {
    const e: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i < nodes.length; i++)
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 38 && Math.random() < 0.3)
          e.push({ x1: nodes[i].x, y1: nodes[i].y, x2: nodes[j].x, y2: nodes[j].y });
      }
    return e;
  }, [nodes]);

  return (
    <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none">
      {edges.map((e, i) => (
        <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke="rgba(34,211,238,0.08)" strokeWidth="0.2" />
      ))}
      {nodes.map((n, i) => (
        <Motion.circle key={i} cx={n.x} cy={n.y} r={n.r * 0.5} fill="rgba(34,211,238,0.5)"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, delay: n.d, ease: "easeInOut" }} />
      ))}
    </svg>
  );
}

/* ─── Pulse Rings ─── */
function PulseRings() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {[0.5, 0.35, 0.22].map((size, i) => (
        <Motion.div key={i} className="absolute rounded-full border border-cyan-400/[0.04]"
          style={{ width: `${size * 100}%`, height: `${size * 100}%` }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 6 + i * 2, repeat: Infinity, ease: "easeInOut", delay: i * 1.5 }} />
      ))}
    </div>
  );
}

/* ─── Rotating AI Messages ─── */
function AIMessageRotator({ messages }: { messages: string[] }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex(i => (i + 1) % messages.length), 3000);
    return () => clearInterval(timer);
  }, [messages.length]);

  return (
    <div className="h-6 overflow-hidden">
      <AnimatePresence mode="wait">
        <Motion.p key={index} className="text-sm text-cyan-400/70 font-medium"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4 }}>
          {messages[index]}
        </Motion.p>
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Left Panel ─── */
export function OnboardingLeftPanel({ step, totalSteps, messages }: Props) {
  const stepMessages = messages[step] ?? messages[0];

  return (
    <div className="relative h-full rounded-[2rem] border border-white/[0.06] bg-white/[0.02] overflow-hidden flex flex-col justify-between p-8">
      {/* Background layers */}
      <Motion.div className="absolute inset-0 rounded-[2rem]"
        style={{
          background: "radial-gradient(ellipse at 50% 40%, rgba(124,92,255,0.12), transparent 60%), radial-gradient(ellipse at 30% 80%, rgba(34,211,238,0.08), transparent 50%)",
          backgroundSize: "200% 200%",
        }}
        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} />
      <NeuralBackground />
      <PulseRings />

      {/* Content */}
      <div className="relative z-10">
        <Motion.div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-400/[0.08] border border-cyan-400/[0.15] mb-6"
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="relative w-2 h-2">
            <Motion.div className="absolute inset-0 rounded-full bg-cyan-400/40"
              animate={{ scale: [1, 2, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity }} />
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400">Veda AI</span>
        </Motion.div>

        <AnimatePresence mode="wait">
          <Motion.div key={step}>
            <Motion.h2 className="text-3xl font-bold text-slate-900 dark:text-slate-900 dark:text-white leading-tight mb-3"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
              {["Where do you want to go?", "Where are you now?", "How do you work?", "How do you learn?", "How should I guide you?"][step]}
            </Motion.h2>
            <Motion.p className="text-sm text-slate-500 dark:text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mb-6"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}>
              {["I'll map your career direction and motivation.", "Let me understand your academic profile and skills.", "Understanding your behavior helps me adapt.", "Your learning style shapes how I'll teach you.", "Choose how your AI mentor should interact with you."][step]}
            </Motion.p>
          </Motion.div>
        </AnimatePresence>

        <AIMessageRotator messages={stepMessages} />
      </div>

      {/* Bottom: Progress + step dots */}
      <div className="relative z-10 space-y-4">
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <Motion.div key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${i <= step ? "bg-cyan-400" : "bg-white/[0.06]"}`}
              style={{ flex: i === step ? 2 : 1 }}
              layout transition={{ type: "spring", stiffness: 300, damping: 30 }} />
          ))}
        </div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-600">
          Step {step + 1} of {totalSteps}
        </p>
      </div>
    </div>
  );
}
