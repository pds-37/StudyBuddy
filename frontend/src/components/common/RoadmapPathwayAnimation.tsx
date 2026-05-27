import { motion as Motion } from "framer-motion";
import { BookOpen, Code2, BriefcaseBusiness, TrendingUp, Star } from "lucide-react";

const nodes = [
  { icon: BookOpen, label: "Learning", x: "10%", y: "75%", delay: 0 },
  { icon: Code2, label: "Building", x: "30%", y: "45%", delay: 0.2 },
  { icon: BriefcaseBusiness, label: "Career", x: "55%", y: "65%", delay: 0.4 },
  { icon: TrendingUp, label: "Growth", x: "75%", y: "30%", delay: 0.6 },
  { icon: Star, label: "Success", x: "90%", y: "15%", delay: 0.8 }
];

export function RoadmapPathwayAnimation() {
  return (
    <div className="absolute -left-10 md:left-0 top-1/2 md:top-20 -translate-y-1/2 w-full max-w-[500px] h-[400px] pointer-events-none select-none opacity-80 z-[-1]">
      {/* SVG Path */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 400" preserveAspectRatio="none">
        <Motion.path
          d="M 50 300 C 150 300, 150 180, 275 260 C 400 340, 380 120, 450 60"
          fill="transparent"
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth="3"
          strokeDasharray="8 8"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
        />
        
        {/* Animated glowing line travelling along the path */}
        <Motion.path
          d="M 50 300 C 150 300, 150 180, 275 260 C 400 340, 380 120, 450 60"
          fill="transparent"
          stroke="url(#glowGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 3, ease: "easeInOut", delay: 0.5 }}
        />
        
        <defs>
          <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#67e8f9" stopOpacity="0" />
            <stop offset="50%" stopColor="#818cf8" stopOpacity="1" />
            <stop offset="100%" stopColor="#6ee7b7" stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Floating Nodes */}
      {nodes.map((node, i) => (
        <Motion.div
          key={node.label}
          className="absolute flex items-center justify-center"
          style={{ left: node.x, top: node.y }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 1.5 + node.delay
          }}
        >
          {/* Node Background Glow */}
          <Motion.div
            className="absolute inset-0 rounded-full bg-indigo-500/30 blur-md"
            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, delay: node.delay, ease: "easeInOut" }}
          />
          
          {/* Glassmorphic Node */}
          <div className="relative flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-xl shadow-[0_0_15px_rgba(129,140,248,0.2)]">
            <node.icon className="h-5 w-5 text-indigo-200" />
          </div>
          
          {/* Label */}
          <div className="absolute -bottom-6 w-max text-center">
            <span className="rounded bg-black/40 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-slate-300 backdrop-blur-sm border border-white/5">
              {node.label}
            </span>
          </div>
        </Motion.div>
      ))}
    </div>
  );
}
