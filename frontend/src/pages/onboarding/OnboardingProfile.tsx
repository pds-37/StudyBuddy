import { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import type { OnboardingData } from "./OnboardingSteps";

type Props = { data: OnboardingData; onComplete: () => void; isSubmitting: boolean };

type ProfileCard = { label: string; value: string; color: string };

function deriveProfile(d: OnboardingData): ProfileCard[] {
  return [
    { label: "Target Path", value: d.targetRoles[0] || "Generalist", color: "text-cyan-400" },
    { label: "Experience", value: d.experienceLevel.charAt(0).toUpperCase() + d.experienceLevel.slice(1), color: "text-emerald-400" },
    { label: "Study Capacity", value: `${d.dailyStudyHours}h / day`, color: "text-blue-400" },
    { label: "Timeline", value: d.targetTimeline || "Flexible", color: "text-purple-400" },
    { label: "Learning Style", value: d.learningStyle ? d.learningStyle.charAt(0).toUpperCase() + d.learningStyle.slice(1) : "—", color: "text-amber-400" },
    { label: "Core Struggle", value: d.primaryStruggle || "—", color: "text-rose-400" },
  ];
}

export function OnboardingProfile({ data, onComplete, isSubmitting }: Props) {
  const [phase, setPhase] = useState<"analyzing" | "reveal">("analyzing");
  const cards = deriveProfile(data);

  useEffect(() => {
    const t = setTimeout(() => setPhase("reveal"), 2200);
    return () => clearTimeout(t);
  }, []);

  if (phase === "analyzing") {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Motion.div className="relative w-20 h-20 mb-8"
          animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
          <div className="absolute inset-0 rounded-full border-2 border-t-cyan-400 border-r-purple-500/30 border-b-transparent border-l-transparent" />
          <div className="absolute inset-2 rounded-full border border-t-transparent border-r-transparent border-b-cyan-400/30 border-l-purple-400/20" />
        </Motion.div>
        <Motion.p className="text-lg font-semibold text-slate-900 dark:text-white mb-2"
          animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
          Building your learning profile...
        </Motion.p>
        <p className="text-sm text-slate-500">Analyzing {data.currentSkills.length} skills, {data.targetRoles.length} goals</p>
      </div>
    );
  }

  return (
    <Motion.div initial={{ opacity: 0, filter: "blur(8px)" }} animate={{ opacity: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.6 }} className="space-y-8">
      <div className="text-center mb-8">
        <Motion.p className="text-[10px] font-bold uppercase tracking-[0.35em] text-cyan-400 mb-2"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          Profile Ready
        </Motion.p>
        <Motion.h2 className="text-2xl font-bold text-slate-900 dark:text-white"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          Your Learning DNA
        </Motion.h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {cards.map((card, i) => (
          <Motion.div key={card.label}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 backdrop-blur-sm"
            initial={{ opacity: 0, y: 16, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.1 * i, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 mb-1">{card.label}</p>
            <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
          </Motion.div>
        ))}
      </div>

      <Motion.div className="pt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
        <button type="button" onClick={onComplete} disabled={isSubmitting}
          className="w-full rounded-2xl bg-gradient-to-r from-cyan to-blue-600 px-6 py-4 text-sm font-bold text-[#05070A] transition-all hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(40,176,243,0.3)] disabled:opacity-50 disabled:cursor-not-allowed">
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Motion.span className="w-4 h-4 border-2 border-[#05070A]/30 border-t-[#05070A] rounded-full inline-block"
                animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
              Generating your adaptive roadmap...
            </span>
          ) : "Launch my workspace →"}
        </button>
      </Motion.div>
    </Motion.div>
  );
}
