import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion as Motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ShieldCheck, ListChecks, TerminalSquare } from "lucide-react";

/* ─────────────────── Types ─────────────────── */
type Node = { id: number; x: number; y: number; r: number; delay: number };
type Edge = { from: number; to: number };

/* ─────────────────── Constants ─────────────────── */
const NODE_COUNT = 14;
const EDGE_PROBABILITY = 0.18;

/* ─────────────────── Helpers ─────────────────── */
function generateGraph(): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = Array.from({ length: NODE_COUNT }, (_, i) => ({
    id: i,
    x: 10 + Math.random() * 80,
    y: 10 + Math.random() * 80,
    r: 2 + Math.random() * 3,
    delay: Math.random() * 6,
  }));

  const edges: Edge[] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 35 && Math.random() < EDGE_PROBABILITY) {
        edges.push({ from: i, to: j });
      }
    }
  }
  return { nodes, edges };
}

/* ─────────────────── Animated Counter ─────────────────── */
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let frame: number;
    const duration = 1800;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return <>{count}{suffix}</>;
}

/* ─────────────────── Typing Dots ─────────────────── */
function TypingDots() {
  return (
    <span className="inline-flex items-center gap-[3px] ml-1">
      {[0, 1, 2].map((i) => (
        <Motion.span
          key={i}
          className="block w-[4px] h-[4px] rounded-full bg-cyan-400"
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.25, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}

/* ─────────────────── Neural Canvas (SVG) ─────────────────── */
function NeuralCanvas() {
  const { nodes, edges } = useMemo(() => generateGraph(), []);

  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <radialGradient id="node-glow">
          <stop offset="0%" stopColor="rgba(34,211,238,0.6)" />
          <stop offset="100%" stopColor="rgba(34,211,238,0)" />
        </radialGradient>
        <filter id="blur-sm">
          <feGaussianBlur stdDeviation="0.5" />
        </filter>
      </defs>

      {/* Edges */}
      {edges.map((edge, i) => {
        const a = nodes[edge.from];
        const b = nodes[edge.to];
        return (
          <g key={`edge-${i}`}>
            <line
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke="rgba(34,211,238,0.08)"
              strokeWidth="0.15"
            />
            {/* Pulse travelling along the edge */}
            <Motion.circle
              r="0.6"
              fill="rgba(34,211,238,0.5)"
              filter="url(#blur-sm)"
              animate={{
                cx: [a.x, b.x],
                cy: [a.y, b.y],
                opacity: [0, 0.7, 0],
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 8,
                ease: "easeInOut",
              }}
            />
          </g>
        );
      })}

      {/* Nodes */}
      {nodes.map((node) => (
        <g key={`node-${node.id}`}>
          {/* Outer glow — static r, animate opacity only */}
          <Motion.circle
            cx={node.x} cy={node.y} r={node.r * 2.5}
            fill="url(#node-glow)"
            animate={{ opacity: [0.1, 0.35, 0.1] }}
            transition={{ duration: 5 + Math.random() * 3, repeat: Infinity, delay: node.delay, ease: "easeInOut" }}
          />
          {/* Core dot */}
          <Motion.circle
            cx={node.x} cy={node.y} r={node.r * 0.4}
            fill="rgba(34,211,238,0.7)"
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 4, repeat: Infinity, delay: node.delay, ease: "easeInOut" }}
          />
        </g>
      ))}
    </svg>
  );
}

/* ─────────────────── Recall Orbit Rings ─────────────────── */
function RecallOrbits() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {[
        { size: "68%", dur: 45, opacity: 0.04, dash: "4 8" },
        { size: "48%", dur: 35, opacity: 0.06, dash: "2 6" },
        { size: "28%", dur: 25, opacity: 0.08, dash: "1 4" },
      ].map((ring, i) => (
        <Motion.div
          key={i}
          className="absolute rounded-full border"
          style={{
            width: ring.size,
            height: ring.size,
            borderColor: `rgba(34,211,238,${ring.opacity})`,
            borderStyle: "dashed",
            borderWidth: "1px",
          }}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ duration: ring.dur, repeat: Infinity, ease: "linear" }}
        />
      ))}

      {/* Orbiting dot */}
      <Motion.div
        className="absolute w-[6px] h-[6px] rounded-full bg-cyan-400/60 shadow-[0_0_8px_rgba(34,211,238,0.5)]"
        style={{ top: "16%", left: "50%" }}
        animate={{
          rotate: 360,
          // Use transform origin at center of the parent
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

/* ─────────────────── Floating Card ─────────────────── */
function FloatingCard({
  children,
  className = "",
  floatDelay = 0,
  parallaxX,
  parallaxY,
  depth = 1,
}: {
  children: React.ReactNode;
  className?: string;
  floatDelay?: number;
  parallaxX: ReturnType<typeof useSpring>;
  parallaxY: ReturnType<typeof useSpring>;
  depth?: number;
}) {
  const x = useTransform(parallaxX, (v) => v * depth);
  const y = useTransform(parallaxY, (v) => v * depth);

  return (
    <Motion.div
      className={`absolute backdrop-blur-xl rounded-xl border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.5)] ${className}`}
      style={{ x, y }}
      animate={{ translateY: [0, -8, 0] }}
      transition={{
        translateY: { duration: 6, repeat: Infinity, delay: floatDelay, ease: "easeInOut" },
      }}
      whileHover={{ scale: 1.04, borderColor: "rgba(34,211,238,0.25)" }}
    >
      {/* Shimmer border glow */}
      <Motion.div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(34,211,238,0.08), transparent, rgba(124,92,255,0.06))",
          backgroundSize: "200% 200%",
        }}
        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative z-10">{children}</div>
    </Motion.div>
  );
}

/* ─────────────────── Main Component ─────────────────── */
export function HeroVisualization() {
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── Mouse parallax ── */
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const parallaxX = useSpring(rawX, { stiffness: 40, damping: 20 });
  const parallaxY = useSpring(rawY, { stiffness: 40, damping: 20 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      rawX.set((e.clientX - cx) / 30);
      rawY.set((e.clientY - cy) / 30);
    },
    [rawX, rawY]
  );

  const handleMouseLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  return (
    <Motion.div
      ref={containerRef}
      className="landing-hero__visual"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* ── Layer 1: Breathing gradient ── */}
      <Motion.div
        className="absolute inset-0 rounded-[2.5rem]"
        style={{
          background:
            "radial-gradient(ellipse at 60% 30%, rgba(124,92,255,0.18), transparent 55%), " +
            "radial-gradient(ellipse at 35% 75%, rgba(34,211,238,0.12), transparent 55%), " +
            "radial-gradient(ellipse at 80% 80%, rgba(59,130,246,0.08), transparent 50%)",
          backgroundSize: "200% 200%",
        }}
        animate={{
          backgroundPosition: ["0% 0%", "50% 100%", "100% 0%", "0% 0%"],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Layer 2: Neural network ── */}
      <NeuralCanvas />

      {/* ── Layer 3: Recall orbits ── */}
      <RecallOrbits />

      {/* ── Layer 4: Floating cards ── */}

      {/* Card: Readiness */}
      <FloatingCard
        className="top-[12%] left-[8%] w-[15rem] p-5 bg-[rgba(10,14,22,0.75)]"
        floatDelay={0}
        parallaxX={parallaxX}
        parallaxY={parallaxY}
        depth={1.2}
      >
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold tracking-wide">
          <ShieldCheck size={14} />
          Ready for role
        </div>
        <strong className="block mt-3 text-[1.35rem] text-white font-bold tracking-tight">
          <AnimatedCounter target={72} suffix="%" /> Readiness
        </strong>
        <Motion.span
          className="block mt-2 text-slate-400 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          +18 points this month
        </Motion.span>
        {/* Mini progress bar */}
        <div className="mt-3 h-[3px] w-full rounded-full bg-white/[0.06] overflow-hidden">
          <Motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
            initial={{ width: "0%" }}
            animate={{ width: "72%" }}
            transition={{ duration: 2, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </FloatingCard>

      {/* Card: Recall tasks */}
      <FloatingCard
        className="top-[22%] right-[8%] p-4 bg-[rgba(10,14,22,0.75)]"
        floatDelay={2}
        parallaxX={parallaxX}
        parallaxY={parallaxY}
        depth={0.8}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-400">
            <ListChecks size={16} />
          </div>
          <div>
            <strong className="text-white text-sm font-semibold">
              <AnimatedCounter target={6} /> Recall tasks due
            </strong>
            <Motion.div
              className="flex gap-1 mt-1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: i <= 2 ? "rgba(168,85,247,0.7)" : "rgba(255,255,255,0.1)" }}
                  animate={{ opacity: i <= 2 ? [0.5, 1, 0.5] : 1 }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
                />
              ))}
            </Motion.div>
          </div>
        </div>
      </FloatingCard>

      {/* Card: Sync */}
      <FloatingCard
        className="bottom-[14%] right-[12%] p-4 bg-[rgba(10,14,22,0.75)]"
        floatDelay={4}
        parallaxX={parallaxX}
        parallaxY={parallaxY}
        depth={1}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400">
            <TerminalSquare size={16} />
          </div>
          <div>
            <strong className="text-white text-sm font-semibold">
              Sync: <AnimatedCounter target={12} /> notes added
            </strong>
            <Motion.div
              className="mt-1.5 flex items-center gap-1 text-[10px] text-emerald-400/70 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5 }}
            >
              <Motion.div
                className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              Connected
            </Motion.div>
          </div>
        </div>
      </FloatingCard>

      {/* ── Layer 5: AI Presence Indicator ── */}
      <Motion.div
        className="absolute bottom-[6%] left-[8%] flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgba(10,14,22,0.6)] backdrop-blur-lg border border-white/[0.06]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Pulse indicator */}
        <div className="relative flex items-center justify-center w-5 h-5">
          <Motion.div
            className="absolute w-5 h-5 rounded-full bg-cyan-400/20"
            animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)]" />
        </div>
        <span className="text-[11px] text-slate-400 font-medium">
          Veda AI analyzing progress
        </span>
        <TypingDots />
      </Motion.div>

      {/* ── Layer 6: Subtle data-flow lines (top-right, bottom-left accents) ── */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Faint timeline path */}
        <Motion.path
          d="M 5 92 Q 25 80, 50 65 T 95 30"
          fill="none"
          stroke="rgba(34,211,238,0.04)"
          strokeWidth="0.2"
          strokeDasharray="2 3"
          animate={{ strokeDashoffset: [0, -20] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <Motion.path
          d="M 8 95 Q 30 78, 55 62 T 92 25"
          fill="none"
          stroke="rgba(124,92,255,0.03)"
          strokeWidth="0.15"
          strokeDasharray="1 4"
          animate={{ strokeDashoffset: [0, -15] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </svg>
    </Motion.div>
  );
}
