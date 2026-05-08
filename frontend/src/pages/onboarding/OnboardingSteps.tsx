import { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { skillsApi } from "../../features/skills/api";
import type { SkillSuggestion } from "../../features/skills/types";

/* ═══════════ Shared Types ═══════════ */
export type OnboardingData = {
  /* Step 1 — Career */
  targetRoles: string[];
  whyField: string;
  careerConfidence: string;
  /* Step 2 — Academic */
  currentYear: string;
  strongestArea: string;
  biggestStruggle: string;
  currentSkills: string[];
  /* Step 3 — Behavior */
  dailyHours: number;
  productiveTime: string;
  consistencyBreaker: string;
  abandonFrequency: string;
  /* Step 4 — Learning */
  learningMethod: string;
  revisionConsistency: string;
  memoryRetention: string;
  /* Step 5 — Mentor */
  mentorStyle: string;
  /* Meta */
  name: string;
  experienceLevel: "beginner" | "intermediate" | "advanced";
};

export const defaultData: OnboardingData = {
  targetRoles: [], whyField: "", careerConfidence: "",
  currentYear: "", strongestArea: "", biggestStruggle: "", currentSkills: [],
  dailyHours: 3, productiveTime: "", consistencyBreaker: "", abandonFrequency: "",
  learningMethod: "", revisionConsistency: "", memoryRetention: "",
  mentorStyle: "", name: "", experienceLevel: "beginner",
};

type StepProps = { data: OnboardingData; update: (d: Partial<OnboardingData>) => void };

/* ═══════════ Animations ═══════════ */
const fadeSlide = {
  initial: { opacity: 0, y: 24, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -16, filter: "blur(4px)" },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
};

const stagger = (i: number) => ({ transition: { ...fadeSlide.transition, delay: 0.06 * i } });

/* ═══════════ Primitives ═══════════ */
function Chip({ label, selected, onClick, delay = 0 }: { label: string; selected: boolean; onClick: () => void; delay?: number }) {
  return (
    <Motion.button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
        selected
          ? "border-cyan-400/40 bg-cyan-400/10 text-slate-900 dark:text-slate-900 dark:text-white shadow-[0_0_20px_rgba(34,211,238,0.08)]"
          : "border-white/[0.06] bg-white/[0.02] text-slate-500 dark:text-slate-500 dark:text-slate-400 hover:border-white/[0.12] hover:text-slate-900 dark:text-slate-900 dark:text-white"
      }`}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay: delay * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      {label}
    </Motion.button>
  );
}

function SectionLabel({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <Motion.p
      className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-3"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      transition={{ delay: delay * 0.1, duration: 0.4 }}
    >
      {children}
    </Motion.p>
  );
}

function Prompt({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <Motion.h3
      className="text-xl font-semibold text-slate-900 dark:text-slate-900 dark:text-white mb-6 leading-relaxed"
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Motion.h3>
  );
}

/* ═══════════ STEP 1 — Career Direction ═══════════ */
const roles = ["Software Engineer", "AI / ML Engineer", "Full Stack Developer", "Frontend Developer", "Backend Developer", "Data Scientist", "Cybersecurity", "DevOps / Cloud", "Product Manager", "Mobile Developer"];
const whyOptions = ["Passion", "High salary", "Placement", "Startup dream", "Exploration", "Family expectations"];
const confidenceLevels = [
  { value: "confused", label: "Completely confused", emoji: "😵‍💫" },
  { value: "clear", label: "Somewhat clear", emoji: "🤔" },
  { value: "confident", label: "Very confident", emoji: "🎯" },
];

export function Step1Career({ data, update }: StepProps) {
  const [roleInput, setRoleInput] = useState("");
  const toggleRole = (r: string) => {
    const next = data.targetRoles.includes(r) ? data.targetRoles.filter(x => x !== r) : [...data.targetRoles, r];
    update({ targetRoles: next });
  };
  const addCustom = () => { if (roleInput.trim()) { toggleRole(roleInput.trim()); setRoleInput(""); } };

  return (
    <Motion.div {...fadeSlide} className="space-y-8">
      <div>
        <SectionLabel>Career Direction</SectionLabel>
        <Prompt>What roles are you targeting?</Prompt>
        <div className="flex flex-wrap gap-2">
          {roles.map((r, i) => <Chip key={r} label={r} selected={data.targetRoles.includes(r)} onClick={() => toggleRole(r)} delay={i} />)}
        </div>
        <div className="mt-3 flex gap-2">
          <input value={roleInput} onChange={e => setRoleInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
            placeholder="Or type your own..." className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-sm text-slate-900 dark:text-slate-900 dark:text-white placeholder-slate-600 outline-none focus:border-cyan-400/30 transition" />
          <button type="button" onClick={addCustom} className="rounded-xl bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase text-slate-500 hover:text-slate-900 dark:text-slate-900 dark:text-white transition">Add</button>
        </div>
      </div>

      {data.targetRoles.length > 0 && (
        <Motion.div {...fadeSlide}>
          <SectionLabel delay={1}>Motivation</SectionLabel>
          <Prompt delay={1}>Why this field?</Prompt>
          <div className="flex flex-wrap gap-2">
            {whyOptions.map((w, i) => <Chip key={w} label={w} selected={data.whyField === w} onClick={() => update({ whyField: w })} delay={i} />)}
          </div>
        </Motion.div>
      )}

      {data.whyField && (
        <Motion.div {...fadeSlide}>
          <SectionLabel delay={2}>Confidence</SectionLabel>
          <Prompt delay={2}>How clear are you about your career path?</Prompt>
          <div className="grid grid-cols-3 gap-3">
            {confidenceLevels.map((c, i) => (
              <Motion.button key={c.value} type="button" onClick={() => update({ careerConfidence: c.value })}
                className={`rounded-2xl border p-4 text-center transition-all ${
                  data.careerConfidence === c.value ? "border-cyan-400/30 bg-cyan-400/5 text-slate-900 dark:text-slate-900 dark:text-white" : "border-white/[0.06] bg-white/[0.02] text-slate-500 dark:text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-900 dark:text-white"
                }`}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i, duration: 0.4 }}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              >
                <span className="text-2xl block mb-2">{c.emoji}</span>
                <span className="text-xs font-medium">{c.label}</span>
              </Motion.button>
            ))}
          </div>
        </Motion.div>
      )}
    </Motion.div>
  );
}

/* ═══════════ STEP 2 — Academic + Skills ═══════════ */
const years = ["1st year", "2nd year", "3rd year", "4th year", "Graduate"];
const strengths = ["DSA", "Development", "Communication", "AI / ML", "Problem Solving", "System Design", "Databases"];
const struggles = ["Consistency", "Time management", "DSA", "Revision", "Focus", "Procrastination", "Confidence", "Interview prep"];

export function Step2Academic({ data, update }: StepProps) {
  const [skillInput, setSkillInput] = useState("");
  const [suggestions, setSuggestions] = useState<SkillSuggestion[]>([]);

  useEffect(() => {
    if (!skillInput.trim()) { setSuggestions([]); return; }
    const t = setTimeout(() => { skillsApi.search(skillInput).then(setSuggestions).catch(() => setSuggestions([])); }, 250);
    return () => clearTimeout(t);
  }, [skillInput]);

  const addSkill = (s: string) => {
    const n = s.trim();
    if (!n || data.currentSkills.some(x => x.toLowerCase() === n.toLowerCase())) return;
    update({ currentSkills: [...data.currentSkills, n] }); setSkillInput(""); setSuggestions([]);
  };

  const expMap: Record<string, "beginner" | "intermediate" | "advanced"> = {
    "1st year": "beginner", "2nd year": "beginner", "3rd year": "intermediate", "4th year": "advanced", "Graduate": "advanced",
  };

  return (
    <Motion.div {...fadeSlide} className="space-y-8">
      <div>
        <SectionLabel>Academic Profile</SectionLabel>
        <Prompt>What year are you in?</Prompt>
        <div className="flex flex-wrap gap-2">
          {years.map((y, i) => <Chip key={y} label={y} selected={data.currentYear === y} onClick={() => update({ currentYear: y, experienceLevel: expMap[y] ?? "beginner" })} delay={i} />)}
        </div>
      </div>

      {data.currentYear && (
        <Motion.div {...fadeSlide}>
          <SectionLabel delay={1}>Strength</SectionLabel>
          <Prompt delay={1}>What's your strongest area?</Prompt>
          <div className="flex flex-wrap gap-2">
            {strengths.map((s, i) => <Chip key={s} label={s} selected={data.strongestArea === s} onClick={() => update({ strongestArea: s })} delay={i} />)}
          </div>
        </Motion.div>
      )}

      {data.strongestArea && (
        <Motion.div {...fadeSlide}>
          <SectionLabel delay={2}>Challenge</SectionLabel>
          <Prompt delay={2}>What do you struggle with the most?</Prompt>
          <div className="flex flex-wrap gap-2">
            {struggles.map((s, i) => <Chip key={s} label={s} selected={data.biggestStruggle === s} onClick={() => update({ biggestStruggle: s })} delay={i} />)}
          </div>
        </Motion.div>
      )}

      {data.biggestStruggle && (
        <Motion.div {...fadeSlide}>
          <SectionLabel delay={3}>Current Skills</SectionLabel>
          <Prompt delay={3}>Add your existing skills</Prompt>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            {data.currentSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {data.currentSkills.map(s => (
                  <button key={s} type="button" onClick={() => update({ currentSkills: data.currentSkills.filter(x => x !== s) })}
                    className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-slate-900 dark:text-slate-900 dark:text-white hover:bg-red-500/15 hover:border-red-400/25 transition">{s} ×</button>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); } }}
                placeholder="Search or type a skill..." className="flex-1 bg-transparent px-2 py-2 text-sm text-slate-900 dark:text-slate-900 dark:text-white outline-none placeholder-slate-600" />
              <button type="button" onClick={() => addSkill(skillInput)} className="text-xs font-bold uppercase text-slate-500 hover:text-slate-900 dark:text-slate-900 dark:text-white px-3 transition">Add</button>
            </div>
          </div>
          {suggestions.length > 0 && (
            <div className="mt-2 rounded-xl border border-white/[0.06] bg-black/40 p-1 max-h-40 overflow-y-auto">
              {suggestions.map(s => (
                <button key={s.id} type="button" onClick={() => addSkill(s.name)}
                  className="w-full flex justify-between rounded-lg px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-700 dark:text-slate-300 hover:bg-white/[0.06] hover:text-slate-900 dark:text-slate-900 dark:text-white transition">
                  <span>{s.name}</span><span className="text-xs text-slate-600">{s.category}</span>
                </button>
              ))}
            </div>
          )}
        </Motion.div>
      )}
    </Motion.div>
  );
}

/* ═══════════ STEP 3 — Behavior ═══════════ */
const productiveTimes = [
  { value: "morning", label: "Morning", icon: "🌅" },
  { value: "afternoon", label: "Afternoon", icon: "☀️" },
  { value: "night", label: "Night", icon: "🌙" },
];
const breakers = ["Social media", "Burnout", "Confusion", "Fear of failure", "Overplanning", "Lack of motivation"];
const abandonOptions = ["Never started", "After a week", "After a month", "I finish most"];

export function Step3Behavior({ data, update }: StepProps) {
  return (
    <Motion.div {...fadeSlide} className="space-y-8">
      <div>
        <SectionLabel>Behavior Profile</SectionLabel>
        <Prompt>How many hours can you study daily?</Prompt>
        <div className="flex items-center gap-6">
          <input type="range" min={1} max={10} value={data.dailyHours} onChange={e => update({ dailyHours: Number(e.target.value) })}
            className="flex-1 h-1.5 rounded-full appearance-none bg-white/[0.06] accent-cyan-400 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(34,211,238,0.4)]" />
          <Motion.span key={data.dailyHours} className="text-2xl font-bold text-slate-900 dark:text-slate-900 dark:text-white min-w-[3rem] text-center"
            initial={{ scale: 1.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
            {data.dailyHours}h
          </Motion.span>
        </div>
      </div>

      <div>
        <SectionLabel delay={1}>Peak Time</SectionLabel>
        <Prompt delay={1}>When are you most productive?</Prompt>
        <div className="grid grid-cols-3 gap-3">
          {productiveTimes.map((t, i) => (
            <Motion.button key={t.value} type="button" onClick={() => update({ productiveTime: t.value })}
              className={`rounded-2xl border p-5 text-center transition-all ${data.productiveTime === t.value ? "border-cyan-400/30 bg-cyan-400/5 text-slate-900 dark:text-slate-900 dark:text-white" : "border-white/[0.06] bg-white/[0.02] text-slate-500 dark:text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-900 dark:text-white"}`}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i }}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <span className="text-2xl block mb-2">{t.icon}</span>
              <span className="text-xs font-medium">{t.label}</span>
            </Motion.button>
          ))}
        </div>
      </div>

      {data.productiveTime && (
        <Motion.div {...fadeSlide}>
          <SectionLabel delay={2}>Consistency Blocker</SectionLabel>
          <Prompt delay={2}>What breaks your consistency most?</Prompt>
          <div className="flex flex-wrap gap-2">
            {breakers.map((b, i) => <Chip key={b} label={b} selected={data.consistencyBreaker === b} onClick={() => update({ consistencyBreaker: b })} delay={i} />)}
          </div>
        </Motion.div>
      )}

      {data.consistencyBreaker && (
        <Motion.div {...fadeSlide}>
          <SectionLabel delay={3}>Roadmap History</SectionLabel>
          <Prompt delay={3}>How far do you usually get with learning plans?</Prompt>
          <div className="flex flex-wrap gap-2">
            {abandonOptions.map((a, i) => <Chip key={a} label={a} selected={data.abandonFrequency === a} onClick={() => update({ abandonFrequency: a })} delay={i} />)}
          </div>
        </Motion.div>
      )}
    </Motion.div>
  );
}

/* ═══════════ STEP 4 — Learning Style ═══════════ */
const methods = ["Visual (videos)", "Writing notes", "Hands-on practice", "Spaced repetition", "Teaching others"];
const revisionLevels = [
  { value: "consistent", label: "Consistent", desc: "I revise regularly" },
  { value: "sometimes", label: "Sometimes", desc: "When exams come" },
  { value: "rarely", label: "Rarely", desc: "I usually forget" },
];
const retentionLevels = [
  { value: "strong", label: "Strong memory", emoji: "🧠" },
  { value: "partial", label: "Forget partially", emoji: "🤷" },
  { value: "weak", label: "Forget quickly", emoji: "😅" },
];

export function Step4Learning({ data, update }: StepProps) {
  return (
    <Motion.div {...fadeSlide} className="space-y-8">
      <div>
        <SectionLabel>Learning Profile</SectionLabel>
        <Prompt>How do you learn best?</Prompt>
        <div className="flex flex-wrap gap-2">
          {methods.map((m, i) => <Chip key={m} label={m} selected={data.learningMethod === m} onClick={() => update({ learningMethod: m })} delay={i} />)}
        </div>
      </div>

      {data.learningMethod && (
        <Motion.div {...fadeSlide}>
          <SectionLabel delay={1}>Revision</SectionLabel>
          <Prompt delay={1}>How consistent is your revision?</Prompt>
          <div className="grid grid-cols-3 gap-3">
            {revisionLevels.map((r, i) => (
              <Motion.button key={r.value} type="button" onClick={() => update({ revisionConsistency: r.value })}
                className={`rounded-2xl border p-4 text-center transition-all ${data.revisionConsistency === r.value ? "border-cyan-400/30 bg-cyan-400/5 text-slate-900 dark:text-slate-900 dark:text-white" : "border-white/[0.06] bg-white/[0.02] text-slate-500 dark:text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-900 dark:text-white"}`}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i }}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <span className="text-sm font-semibold block">{r.label}</span>
                <span className="text-[11px] text-slate-500 mt-1 block">{r.desc}</span>
              </Motion.button>
            ))}
          </div>
        </Motion.div>
      )}

      {data.revisionConsistency && (
        <Motion.div {...fadeSlide}>
          <SectionLabel delay={2}>Memory</SectionLabel>
          <Prompt delay={2}>How well do you retain what you learn?</Prompt>
          <div className="grid grid-cols-3 gap-3">
            {retentionLevels.map((r, i) => (
              <Motion.button key={r.value} type="button" onClick={() => update({ memoryRetention: r.value })}
                className={`rounded-2xl border p-5 text-center transition-all ${data.memoryRetention === r.value ? "border-cyan-400/30 bg-cyan-400/5 text-slate-900 dark:text-slate-900 dark:text-white" : "border-white/[0.06] bg-white/[0.02] text-slate-500 dark:text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-900 dark:text-white"}`}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i }}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <span className="text-2xl block mb-2">{r.emoji}</span>
                <span className="text-xs font-medium">{r.label}</span>
              </Motion.button>
            ))}
          </div>
        </Motion.div>
      )}
    </Motion.div>
  );
}

/* ═══════════ STEP 5 — Mentor Style ═══════════ */
const mentorStyles = [
  { value: "strict", label: "Strict Mentor", desc: "Push me hard, no excuses", icon: "🎯" },
  { value: "friendly", label: "Friendly Coach", desc: "Supportive and patient", icon: "🤝" },
  { value: "motivational", label: "Motivational", desc: "Keep me inspired", icon: "🔥" },
  { value: "minimal", label: "Minimal Guidance", desc: "Just nudge me occasionally", icon: "🧘" },
  { value: "technical", label: "Deep Technical", desc: "Explain everything in detail", icon: "🧠" },
];

export function Step5Mentor({ data, update }: StepProps) {
  return (
    <Motion.div {...fadeSlide} className="space-y-8">
      <div>
        <SectionLabel>AI Mentor</SectionLabel>
        <Prompt>How should Veda guide you?</Prompt>
        <div className="grid gap-3">
          {mentorStyles.map((m, i) => (
            <Motion.button key={m.value} type="button" onClick={() => update({ mentorStyle: m.value })}
              className={`rounded-2xl border p-5 flex items-center gap-5 text-left transition-all ${
                data.mentorStyle === m.value ? "border-cyan-400/30 bg-cyan-400/5 text-slate-900 dark:text-slate-900 dark:text-white" : "border-white/[0.06] bg-white/[0.02] text-slate-500 dark:text-slate-500 dark:text-slate-400 hover:border-white/[0.12] hover:text-slate-900 dark:text-slate-900 dark:text-white"
              }`}
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 * i, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.98 }}>
              <span className="text-3xl">{m.icon}</span>
              <div>
                <span className="text-sm font-semibold block text-slate-900 dark:text-slate-900 dark:text-white">{m.label}</span>
                <span className="text-xs text-slate-500">{m.desc}</span>
              </div>
              {data.mentorStyle === m.value && (
                <Motion.div className="ml-auto w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} />
              )}
            </Motion.button>
          ))}
        </div>
      </div>
    </Motion.div>
  );
}

/* ═══════════ Step validation ═══════════ */
export function isStepComplete(step: number, data: OnboardingData): boolean {
  switch (step) {
    case 0: return data.targetRoles.length > 0 && !!data.whyField && !!data.careerConfidence;
    case 1: return !!data.currentYear && !!data.strongestArea && !!data.biggestStruggle && data.currentSkills.length > 0;
    case 2: return data.dailyHours > 0 && !!data.productiveTime && !!data.consistencyBreaker && !!data.abandonFrequency;
    case 3: return !!data.learningMethod && !!data.revisionConsistency && !!data.memoryRetention;
    case 4: return !!data.mentorStyle;
    default: return false;
  }
}

export const STEP_TITLES = ["Career Direction", "Academic Reality", "Behavior Profile", "Learning Style", "AI Mentor"];
export const STEP_AI_MESSAGES: string[][] = [
  ["Understanding your career direction...", "Mapping role requirements...", "Analyzing industry landscape..."],
  ["Evaluating your academic profile...", "Identifying skill foundations...", "Scanning knowledge gaps..."],
  ["Profiling your study behavior...", "Measuring consistency patterns...", "Estimating focus capacity..."],
  ["Analyzing your learning style...", "Calibrating memory model...", "Optimizing recall schedule..."],
  ["Configuring your AI mentor...", "Personalizing guidance style...", "Building your learning DNA..."],
];
