import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ServerWakeUpLoaderProps = {
  isReady?: boolean;
  onComplete?: () => void;
};

type LoadingPhase = {
  pct: number;
  main: string;
  sub: string;
  dur: number;
};

const PHASES: LoadingPhase[] = [
  { pct: 18, main: "Waking up VEDA", sub: "Connecting to neural servers…", dur: 5000 },
  { pct: 42, main: "Loading the brain", sub: "Spinning up AI engines…", dur: 8000 },
  { pct: 68, main: "Remembering you", sub: "Loading your knowledge base…", dur: 6000 },
  { pct: 88, main: "Almost there", sub: "Personalising your experience…", dur: 4000 },
  { pct: 100, main: "VEDA is ready", sub: "Opening your dashboard…", dur: 1500 },
];

export function ServerWakeUpLoader({ isReady = false, onComplete }: ServerWakeUpLoaderProps) {
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const ringCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Progression states
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Active texts shown to user
  const [displayText, setDisplayText] = useState({
    main: PHASES[0].main,
    sub: PHASES[0].sub
  });

  const isReadyRef = useRef(isReady);
  useEffect(() => {
    isReadyRef.current = isReady;
  }, [isReady]);

  // 1. Text & Percentage Progression Engine
  useEffect(() => {
    let active = true;
    let animationFrameId: number;

    const runProgress = async () => {
      let currentPct = 0;

      for (let i = 0; i < PHASES.length; i++) {
        if (!active) return;
        setPhaseIdx(i);

        const phase = PHASES[i];
        
        // Dynamic text transition
        setDisplayText({ main: phase.main, sub: phase.sub });

        // If the server is ready, we accelerate to 100% instantly
        const isLastPhase = i === PHASES.length - 1;
        const targetDuration = isReadyRef.current 
          ? 600 
          : phase.dur;

        const startPct = currentPct;
        const endPct = isLastPhase ? 100 : phase.pct;
        const startTime = performance.now();

        await new Promise<void>((resolve) => {
          const step = (now: number) => {
            if (!active) {
              resolve();
              return;
            }

            const elapsed = now - startTime;
            // If the server is ready, speed up progress to 100%
            const isReadyNow = isReadyRef.current;
            const currentDur = isReadyNow ? Math.min(targetDuration, 600) : targetDuration;

            const progressRatio = Math.min(elapsed / currentDur, 1);
            const ease = 1 - Math.pow(1 - progressRatio, 3); // easeOutCubic
            
            const nextPct = Math.round(startPct + (endPct - startPct) * ease);
            currentPct = nextPct;
            setPercentage(nextPct);

            // Hold at 95% if server is not ready yet
            if (nextPct >= 95 && !isReadyNow && !isLastPhase) {
              // Pause here, check again next frame
              animationFrameId = requestAnimationFrame(step);
            } else if (progressRatio < 1) {
              animationFrameId = requestAnimationFrame(step);
            } else {
              resolve();
            }
          };
          animationFrameId = requestAnimationFrame(step);
        });

        if (!active) return;

        // If we just finished 100%, break out
        if (currentPct >= 100) {
          break;
        }

        // Wait brief moment before next phase
        await new Promise((r) => setTimeout(r, 200));
      }

      // Final short delay, then fade out
      if (active) {
        await new Promise((r) => setTimeout(r, 400));
        setIsFadingOut(true);
        await new Promise((r) => setTimeout(r, 600));
        onComplete?.();
      }
    };

    void runProgress();

    return () => {
      active = false;
      cancelAnimationFrame(animationFrameId);
    };
  }, [onComplete]);

  // 2. BG Canvas (Nebula Particles, Connection Webs, and Cyan Sparks)
  useEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    type Dot = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      a: number;
      cyan: boolean;
      phase: number;
      speed: number;
    };

    type Spark = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      decay: number;
      r: number;
    };

    const dots: Dot[] = [];
    const sparks: Spark[] = [];

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      buildDots();
    };

    const buildDots = () => {
      dots.length = 0;
      for (let i = 0; i < 75; i++) {
        dots.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          r: Math.random() * 0.9 + 0.2,
          a: Math.random() * 0.22 + 0.04,
          cyan: Math.random() > 0.6,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.015 + 0.008,
        });
      }
    };

    const spawnSpark = (x: number, y: number) => {
      sparks.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        life: 1,
        decay: Math.random() * 0.03 + 0.02,
        r: Math.random() * 0.9 + 0.3,
      });
    };

    window.addEventListener("resize", resize);
    resize();

    let t = 0;
    let frameId: number;

    const frame = () => {
      t += 0.012;
      ctx.clearRect(0, 0, w, h);

      // Central radial glow matching app theme (obsidian bg, purple and cyan glows)
      const cx = w / 2;
      const cy = h / 2;
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.52);
      gradient.addColorStop(0, "rgba(202, 138, 247, 0.065)"); // Translucent brand purple
      gradient.addColorStop(0.4, "rgba(40, 176, 243, 0.03)"); // Translucent cyan
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // Connections between particles
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.06;
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = dots[i].cyan
              ? `rgba(40, 176, 243, ${alpha})`
              : `rgba(202, 138, 247, ${alpha * 0.7})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      dots.forEach((p) => {
        const pulse = Math.sin(t * p.speed * 60 + p.phase) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (1 + pulse * 0.3), 0, Math.PI * 2);
        ctx.fillStyle = p.cyan
          ? `rgba(40, 176, 243, ${p.a * (0.7 + pulse * 0.3)})`
          : `rgba(202, 138, 247, ${p.a * 0.65 * (0.7 + pulse * 0.3)})`;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
      });

      // Spawn random sparks periodically around the orb
      if (Math.random() < 0.04) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * Math.min(w, h) * 0.35;
        spawnSpark(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
      }

      // Draw active sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(40, 176, 243, ${s.life * 0.6})`;
        ctx.fill();

        s.x += s.vx;
        s.y += s.vy;
        s.life -= s.decay;
        if (s.life <= 0) {
          sparks.splice(i, 1);
        }
      }

      frameId = requestAnimationFrame(frame);
    };

    frame();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameId);
    };
  }, []);

  // 3. Ring Canvas (Animated Elliptical Dashed Rings + Glowing Orbiters)
  useEffect(() => {
    const canvas = ringCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    type Ring = {
      r: number;
      speed: number;
      tilt: number;
      dashLen: number;
      color: string;
      baseA: number;
      phase: number;
    };

    type Orbiter = {
      ringIdx: number;
      angle: number;
      speed: number;
      r: number;
      color: string;
      a: number;
    };

    const rings: Ring[] = [
      { r: 90, speed: 0.004, tilt: 0.55, dashLen: 0.28, color: "rgba(40, 176, 243,", baseA: 0.22, phase: 0 },
      { r: 118, speed: 0.0028, tilt: 0.35, dashLen: 0.18, color: "rgba(202, 138, 247,", baseA: 0.14, phase: 1.1 },
      { r: 145, speed: 0.002, tilt: 0.65, dashLen: 0.12, color: "rgba(40, 176, 243,", baseA: 0.1, phase: 2.4 },
      { r: 172, speed: 0.0015, tilt: 0.25, dashLen: 0.08, color: "rgba(202, 138, 247,", baseA: 0.07, phase: 0.7 },
    ];

    const orbiters: Orbiter[] = [
      { ringIdx: 0, angle: 0, speed: 0.009, r: 3, color: "rgba(40, 176, 243,", a: 0.95 },
      { ringIdx: 0, angle: Math.PI, speed: 0.009, r: 2, color: "rgba(40, 176, 243,", a: 0.6 },
      { ringIdx: 1, angle: 0.8, speed: 0.006, r: 2.5, color: "rgba(202, 138, 247,", a: 0.85 },
      { ringIdx: 2, angle: 2.3, speed: 0.004, r: 2, color: "rgba(40, 176, 243,", a: 0.7 },
      { ringIdx: 3, angle: 4.1, speed: 0.003, r: 1.8, color: "rgba(202, 138, 247,", a: 0.6 },
    ];

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resize);

    let t = 0;
    let frameId: number;

    const frame = () => {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      // Draw Rings
      rings.forEach((ring, ri) => {
        const offsetAngle = t * ring.speed * 100;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(1, ring.tilt); // Tilted effect

        const circumference = 2 * Math.PI * ring.r;
        const dashPx = circumference * ring.dashLen;
        const gapPx = (circumference * (1 - ring.dashLen)) / 2;

        ctx.setLineDash([dashPx, gapPx]);
        ctx.lineDashOffset = -offsetAngle * ring.r;

        const pulse = Math.sin(t * 1.2 + ri) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(0, 0, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = ring.color + (ring.baseA * (0.6 + pulse * 0.4)) + ")";
        ctx.lineWidth = ri === 0 ? 1.2 : 0.8;
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.restore();
      });

      // Draw Orbiters (glowing dots moving along rings)
      orbiters.forEach((ob) => {
        ob.angle += ob.speed;
        const ring = rings[ob.ringIdx];
        const x = cx + Math.cos(ob.angle) * ring.r;
        const y = cy + Math.sin(ob.angle) * ring.r * ring.tilt;

        // Orbiter glow aura
        const glow = ctx.createRadialGradient(x, y, 0, x, y, ob.r * 4);
        glow.addColorStop(0, ob.color + ob.a + ")");
        glow.addColorStop(1, ob.color + "0)");

        ctx.beginPath();
        ctx.arc(x, y, ob.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(x, y, ob.r, 0, Math.PI * 2);
        ctx.fillStyle = ob.color + ob.a + ")";
        ctx.fill();
      });

      frameId = requestAnimationFrame(frame);
    };

    frame();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameId);
    };
  }, []);

  const CIRCUMFERENCE = 2 * Math.PI * 22; // ~138.22
  const progressOffset = CIRCUMFERENCE - (percentage / 100) * CIRCUMFERENCE;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#05070A] overflow-hidden select-none transition-opacity duration-500 ease-in-out ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Background Canvases */}
      <canvas id="bg-canvas" ref={bgCanvasRef} className="absolute inset-0 z-0 pointer-events-none" />
      <canvas id="ring-canvas" ref={ringCanvasRef} className="absolute inset-0 z-10 pointer-events-none" />

      {/* SVG Grain Overlay */}
      <div 
        className="absolute inset-0 z-20 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px",
        }}
      />

      {/* Shell Container */}
      <div className="relative z-30 flex flex-col items-center justify-center">
        
        {/* Core Orb System */}
        <div className="relative w-[220px] h-[220px] flex items-center justify-center mb-10">
          
          {/* Outermost Pulsing Halo */}
          <div className="absolute inset-[-30px] rounded-full bg-[radial-gradient(circle,_rgba(202,138,247,0.07)_0%,_rgba(40,176,243,0.04)_40%,_transparent_70%)] animate-pulse-glow" />

          {/* Central Glass Orb */}
          <div 
            className="relative z-40 w-[110px] h-[110px] rounded-full flex items-center justify-center border border-white/[0.08] shadow-[0_0_40px_rgba(202,138,247,0.25),_inset_0_1px_1px_rgba(255,255,255,0.1)] overflow-hidden"
            style={{
              background: "radial-gradient(circle at 38% 32%, rgba(202, 138, 247, 0.6) 0%, rgba(124, 58, 237, 0.4) 30%, rgba(10, 5, 25, 0.95) 70%, rgba(5, 3, 10, 1) 100%)",
            }}
          >
            {/* Shimmer Sweep Animation Overlay */}
            <div 
              className="absolute inset-[-20%] w-[60%] h-[140%] pointer-events-none rotate-[-30deg] -translate-x-[150%] animate-shimmer"
              style={{
                background: "linear-gradient(135deg, transparent 30%, rgba(255, 255, 255, 0.12) 50%, transparent 70%)",
              }}
            />
            
            {/* Elegant Floating Letter 'V' */}
            <span 
              className="relative z-50 text-[42px] font-normal italic leading-none select-none drop-shadow-[0_0_24px_rgba(202,138,247,0.7)]"
              style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                color: "rgba(240, 230, 255, 0.92)",
                animation: "float 4s ease-in-out infinite",
              }}
            >
              V
            </span>
          </div>
        </div>

        {/* Brand Header */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="text-center mb-9"
        >
          <h2 
            className="text-[28px] font-normal leading-tight text-white tracking-wide"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
          >
            StudyBuddy
          </h2>
          <p className="text-[10px] font-medium tracking-[0.25em] uppercase text-slate-500 mt-1">
            VEDA • AI Mentor
          </p>
        </motion.div>

        {/* Fading Status Message */}
        <div className="text-center h-12 flex flex-col items-center justify-center mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={displayText.main}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <h3 
                className="text-[18px] font-normal italic text-slate-200"
                style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
              >
                {displayText.main}
              </h3>
              <p className="text-[11px] text-slate-500 tracking-[0.02em] mt-0.5">
                {displayText.sub}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Premium SVG Progress Arc */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className="relative w-14 h-14"
        >
          <svg className="block transform rotate-[-90deg] origin-center" width="56" height="56" viewBox="0 0 56 56">
            <defs>
              <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#28b0f3" />   {/* Cyan */}
                <stop offset="50%" stop-color="#7c3aed" />  {/* Violet */}
                <stop offset="100%" stop-color="#ca8af7" /> {/* Brand Lavender */}
              </linearGradient>
            </defs>
            {/* Background ring */}
            <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="2" />
            {/* Active animated progress arc */}
            <circle 
              cx="28" 
              cy="28" 
              r="22" 
              fill="none" 
              stroke="url(#arcGrad)" 
              strokeWidth="2" 
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={progressOffset}
              style={{
                transition: "stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[11px] font-medium text-[#28b0f3] tracking-wide select-none">
            {percentage}%
          </div>
        </motion.div>

      </div>

      {/* Styled OS Footer */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.7 }}
        className="fixed bottom-0 left-0 right-0 py-6 px-10 border-t border-white/[0.03] flex items-center justify-between text-[10px] font-normal tracking-[0.14em] uppercase text-slate-700"
      >
        <span>StudyBuddy Career OS</span>
        <div className="flex gap-1.5 items-center">
          <div className="w-1 h-1 rounded-full bg-slate-700 animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-1 h-1 rounded-full bg-slate-700 animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-1 h-1 rounded-full bg-slate-700 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
        <span>Neural Bridge V1.0</span>
      </motion.div>

      {/* Add custom CSS animations needed for this page */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        @keyframes shimmer {
          0% { transform: rotate(-30deg) translateX(-150%); }
          55%, 100% { transform: rotate(-30deg) translateX(250%); }
        }
        .animate-shimmer {
          animation: shimmer 3.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
