import { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { skillsApi } from "../../features/skills/api";
import type { SkillSuggestion } from "../../features/skills/types";

/* ═══════════ Shared Types ═══════════ */
export type OnboardingData = {
  /* Step 1 — Target Role */
  targetRoles: string[];
  /* Step 2 — Experience */
  experienceLevel: "beginner" | "intermediate" | "advanced";
  /* Step 3 — Current Skills */
  currentSkills: string[];
  /* Step 4 — Daily Study Time */
  dailyStudyHours: number;
  /* Step 5 — Target Timeline */
  targetTimeline: string;
  /* Step 6 — Learning Style */
  learningStyle: string;
  /* Step 7 — Biggest Struggle */
  primaryStruggle: string;
  /* Step 8 — Career Interests */
  careerInterests: string[];
  /* Step 9 — Preferred Languages per Domain */
  preferredLanguages?: {
    dsa?: string;
    backend?: string;
    frontend?: string;
    aiml?: string;
  };
  /* Meta */
  name: string;
};

export const defaultData: OnboardingData = {
  targetRoles: [],
  experienceLevel: "beginner",
  currentSkills: [],
  dailyStudyHours: 2,
  targetTimeline: "",
  learningStyle: "",
  primaryStruggle: "",
  careerInterests: [],
  preferredLanguages: {
    dsa: "C++",
    backend: "Node.js (TypeScript)",
    frontend: "TypeScript",
    aiml: "Python"
  },
  name: "",
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
          ? "border-cyan-400/40 bg-cyan-400/10 text-white text-white shadow-[0_0_20px_rgba(34,211,238,0.08)]"
          : "border-white/[0.06] bg-white/[0.02] text-slate-500 text-slate-500 text-slate-400 hover:border-white/[0.12] hover:text-white text-white"
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
      className="text-xl font-semibold text-white text-white mb-6 leading-relaxed"
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Motion.h3>
  );
}

/* ═══════════ STEP 1 — Target Role ═══════════ */
const roles = ["Software Engineer", "AI / ML Engineer", "Full Stack Developer", "Frontend Developer", "Backend Developer", "Data Scientist", "Cybersecurity", "DevOps / Cloud", "Product Manager", "Mobile Developer"];

export function Step1Role({ data, update }: StepProps) {
  const [roleInput, setRoleInput] = useState("");
  const toggleRole = (r: string) => {
    const next = data.targetRoles.includes(r) ? data.targetRoles.filter(x => x !== r) : [...data.targetRoles, r];
    update({ targetRoles: next });
  };
  const addCustom = () => { if (roleInput.trim()) { toggleRole(roleInput.trim()); setRoleInput(""); } };

  return (
    <Motion.div {...fadeSlide} className="space-y-8">
      <div>
        <SectionLabel>Target Role</SectionLabel>
        <Prompt>What do you want to become?</Prompt>
        <div className="flex flex-wrap gap-2">
          {roles.map((r, i) => <Chip key={r} label={r} selected={data.targetRoles.includes(r)} onClick={() => toggleRole(r)} delay={i} />)}
        </div>
        <div className="mt-4 flex gap-2">
          <input value={roleInput} onChange={e => setRoleInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
            placeholder="Or type your own..." className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white text-white placeholder-slate-600 outline-none focus:border-cyan-400/30 transition" />
          <button type="button" onClick={addCustom} className="rounded-xl bg-white/[0.04] px-5 py-2 text-xs font-bold uppercase text-slate-500 hover:text-white text-white transition">Add</button>
        </div>
      </div>
    </Motion.div>
  );
}

/* ═══════════ STEP 2 — Experience Level ═══════════ */
const expLevels = [
  { value: "beginner", label: "Beginner", desc: "Just starting my journey", icon: "🌱" },
  { value: "intermediate", label: "Intermediate", desc: "Know the basics, need depth", icon: "🚀" },
  { value: "advanced", label: "Advanced", desc: "Refining mastery", icon: "💎" },
];

export function Step2Experience({ data, update }: StepProps) {
  return (
    <Motion.div {...fadeSlide} className="space-y-8">
      <div>
        <SectionLabel>Journey State</SectionLabel>
        <Prompt>Where are you currently in your journey?</Prompt>
        <div className="grid gap-3">
          {expLevels.map((lvl, i) => (
            <Motion.button key={lvl.value} type="button" onClick={() => update({ experienceLevel: lvl.value as any })}
              className={`rounded-2xl border p-5 flex items-center gap-5 text-left transition-all ${
                data.experienceLevel === lvl.value ? "border-cyan-400/30 bg-cyan-400/5 text-white text-white" : "border-white/[0.06] bg-white/[0.02] text-slate-500 hover:text-white text-white"
              }`}
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 * i }} whileHover={{ scale: 1.02, x: 4 }}>
              <span className="text-3xl">{lvl.icon}</span>
              <div>
                <span className="text-sm font-bold block">{lvl.label}</span>
                <span className="text-xs text-slate-500">{lvl.desc}</span>
              </div>
              {data.experienceLevel === lvl.value && <div className="ml-auto w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />}
            </Motion.button>
          ))}
        </div>
      </div>
    </Motion.div>
  );
}

/* ═══════════ STEP 3 — Current Skills ═══════════ */
export function Step3Skills({ data, update }: StepProps) {
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

  return (
    <Motion.div {...fadeSlide} className="space-y-8">
      <div>
        <SectionLabel>Skill Graph</SectionLabel>
        <Prompt>What skills are you already comfortable with?</Prompt>
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {data.currentSkills.map(s => (
              <button key={s} type="button" onClick={() => update({ currentSkills: data.currentSkills.filter(x => x !== s) })}
                className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-1.5 text-xs font-semibold text-white text-white hover:bg-red-500/15 transition">{s} ×</button>
            ))}
            {data.currentSkills.length === 0 && <span className="text-xs text-slate-400 italic">No skills added yet...</span>}
          </div>
          <div className="flex gap-2">
            <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); } }}
              placeholder="Type a skill (e.g. React, Python)..." className="flex-1 bg-transparent px-2 py-2 text-sm text-white text-white outline-none placeholder-slate-600" />
            <button type="button" onClick={() => addSkill(skillInput)} className="text-xs font-bold uppercase text-cyan-400 hover:text-white hover:text-white px-3 transition">Add</button>
          </div>
        </div>
        {suggestions.length > 0 && (
          <div className="mt-3 rounded-xl border border-white/[0.06] bg-black/40 p-1 max-h-48 overflow-y-auto backdrop-blur-md">
            {suggestions.map(s => (
              <button key={s.id} type="button" onClick={() => addSkill(s.name)}
                className="w-full flex justify-between rounded-lg px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-white/[0.06] hover:text-white transition">
                <span>{s.name}</span><span className="text-[10px] uppercase opacity-50 tracking-wider">{s.category}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </Motion.div>
  );
}

/* ═══════════ STEP 4 — Daily Study Time ═══════════ */
const hourOptions = [
  { value: 1, label: "1 Hour", desc: "Casual learning" },
  { value: 2, label: "2 Hours", desc: "Steady progress" },
  { value: 4, label: "4 Hours", desc: "High intensity" },
  { value: 6, label: "6+ Hours", desc: "Immersion mode" },
];

export function Step4Hours({ data, update }: StepProps) {
  return (
    <Motion.div {...fadeSlide} className="space-y-8">
      <div>
        <SectionLabel>Commitment</SectionLabel>
        <Prompt>How much time can you realistically study daily?</Prompt>
        <div className="grid grid-cols-2 gap-3">
          {hourOptions.map((opt, i) => (
            <Motion.button key={opt.value} type="button" onClick={() => update({ dailyStudyHours: opt.value })}
              className={`rounded-2xl border p-5 text-left transition-all ${
                data.dailyStudyHours === opt.value ? "border-cyan-400/30 bg-cyan-400/5 text-white text-white" : "border-white/[0.06] bg-white/[0.02] text-slate-500 hover:text-white text-white"
              }`}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i }}>
              <span className="text-lg font-bold block">{opt.label}</span>
              <span className="text-[11px] text-slate-500">{opt.desc}</span>
            </Motion.button>
          ))}
        </div>
      </div>
    </Motion.div>
  );
}

/* ═══════════ STEP 5 — Target Timeline ═══════════ */
const timelines = ["3 Months", "6 Months", "1 Year", "Flexible"];

export function Step5Timeline({ data, update }: StepProps) {
  return (
    <Motion.div {...fadeSlide} className="space-y-8">
      <div>
        <SectionLabel>Trajectory</SectionLabel>
        <Prompt>When do you want to become job-ready?</Prompt>
        <div className="flex flex-wrap gap-3">
          {timelines.map((t, i) => <Chip key={t} label={t} selected={data.targetTimeline === t} onClick={() => update({ targetTimeline: t })} delay={i} />)}
        </div>
      </div>
    </Motion.div>
  );
}

/* ═══════════ STEP 6 — Learning Style ═══════════ */
const styles = [
  { value: "visual", label: "Visual Learning", icon: "👁️" },
  { value: "project-first", label: "Project-first", icon: "🏗️" },
  { value: "theory-first", label: "Theory-first", icon: "📖" },
  { value: "coding-first", label: "Coding-first", icon: "⌨️" },
  { value: "interactive", label: "Interactive Practice", icon: "🎮" },
];

export function Step6Style({ data, update }: StepProps) {
  return (
    <Motion.div {...fadeSlide} className="space-y-8">
      <div>
        <SectionLabel>Cognitive Preference</SectionLabel>
        <Prompt>How do you learn best?</Prompt>
        <div className="grid gap-3">
          {styles.map((s, i) => (
            <Motion.button key={s.value} type="button" onClick={() => update({ learningStyle: s.value })}
              className={`rounded-2xl border p-5 flex items-center gap-5 text-left transition-all ${
                data.learningStyle === s.value ? "border-cyan-400/30 bg-cyan-400/5 text-white text-white" : "border-white/[0.06] bg-white/[0.02] text-slate-500 hover:text-white text-white"
              }`}
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 * i }}>
              <span className="text-2xl">{s.icon}</span>
              <span className="text-sm font-bold">{s.label}</span>
            </Motion.button>
          ))}
        </div>
      </div>
    </Motion.div>
  );
}

/* ═══════════ STEP 7 — Biggest Struggle ═══════════ */
const struggles = ["Consistency", "Forgetting concepts", "Roadmap confusion", "Procrastination", "Interview anxiety", "Lack of guidance"];

export function Step7Struggle({ data, update }: StepProps) {
  return (
    <Motion.div {...fadeSlide} className="space-y-8">
      <div>
        <SectionLabel>Friction Zone</SectionLabel>
        <Prompt>What slows your learning the most?</Prompt>
        <div className="grid grid-cols-2 gap-3">
          {struggles.map((s, i) => (
            <Motion.button key={s} type="button" onClick={() => update({ primaryStruggle: s })}
              className={`rounded-2xl border p-5 text-center transition-all ${
                data.primaryStruggle === s ? "border-cyan-400/30 bg-cyan-400/5 text-white text-white" : "border-white/[0.06] bg-white/[0.02] text-slate-500 hover:text-white text-white"
              }`}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.08 * i }}>
              <span className="text-sm font-medium">{s}</span>
            </Motion.button>
          ))}
        </div>
      </div>
    </Motion.div>
  );
}

/* ═══════════ STEP 8 — Career Interests ═══════════ */
const interests = ["AI", "Startups", "Open Source", "Freelancing", "Remote Jobs", "FAANG", "Product Building"];

export function Step8Interests({ data, update }: StepProps) {
  return (
    <Motion.div {...fadeSlide} className="space-y-8">
      <div>
        <SectionLabel>Career Pulse</SectionLabel>
        <Prompt>What excites you most?</Prompt>
        <div className="flex flex-wrap gap-2">
          {interests.map((r, i) => (
            <Chip key={r} label={r} 
              selected={data.careerInterests.includes(r)} 
              onClick={() => {
                const next = data.careerInterests.includes(r) ? data.careerInterests.filter(x => x !== r) : [...data.careerInterests, r];
                update({ careerInterests: next });
              }} 
              delay={i} 
            />
          ))}
        </div>
      </div>
    </Motion.div>
  );
}

/* ═══════════ Step validation ═══════════ */
/* ═══════════ STEP 9 — Domain Languages ═══════════ */
export function Step9Languages({ data, update }: StepProps) {
  const selectLanguage = (domain: "dsa" | "backend" | "frontend" | "aiml", val: string) => {
    const nextLang = { ...data.preferredLanguages, [domain]: val };
    update({ preferredLanguages: nextLang });
  };

  const dsaOptions = ["C++", "Java", "Python", "JavaScript"];
  const backendOptions = ["Node.js (TypeScript)", "Go", "Python", "Java"];
  const frontendOptions = ["TypeScript", "JavaScript"];
  const aimlOptions = ["Python", "R", "C++"];

  return (
    <Motion.div {...fadeSlide} className="space-y-6">
      <div>
        <SectionLabel>Domain Languages</SectionLabel>
        <Prompt>Select your preferred language for each domain:</Prompt>
        
        <div className="space-y-4">
          {/* DSA */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4.5">
            <label className="block text-[10px] font-bold uppercase text-cyan font-mono mb-2">DSA / LeetCode</label>
            <div className="flex flex-wrap gap-2">
              {dsaOptions.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => selectLanguage("dsa", opt)}
                  className={`rounded-xl border px-4 py-2 text-xs font-semibold transition duration-200 ${
                    data.preferredLanguages?.dsa === opt
                      ? "border-cyan-400/40 bg-cyan-400/10 text-white shadow-[0_0_15px_rgba(34,211,238,0.15)]"
                      : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-white"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Backend */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4.5">
            <label className="block text-[10px] font-bold uppercase text-cyan font-mono mb-2">Backend Development</label>
            <div className="flex flex-wrap gap-2">
              {backendOptions.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => selectLanguage("backend", opt)}
                  className={`rounded-xl border px-4 py-2 text-xs font-semibold transition duration-200 ${
                    data.preferredLanguages?.backend === opt
                      ? "border-cyan-400/40 bg-cyan-400/10 text-white shadow-[0_0_15px_rgba(34,211,238,0.15)]"
                      : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-white"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Frontend */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4.5">
            <label className="block text-[10px] font-bold uppercase text-cyan font-mono mb-2">Frontend UI React</label>
            <div className="flex flex-wrap gap-2">
              {frontendOptions.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => selectLanguage("frontend", opt)}
                  className={`rounded-xl border px-4 py-2 text-xs font-semibold transition duration-200 ${
                    data.preferredLanguages?.frontend === opt
                      ? "border-cyan-400/40 bg-cyan-400/10 text-white shadow-[0_0_15px_rgba(34,211,238,0.15)]"
                      : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-white"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* AI/ML */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4.5">
            <label className="block text-[10px] font-bold uppercase text-cyan font-mono mb-2">AI / ML Models</label>
            <div className="flex flex-wrap gap-2">
              {aimlOptions.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => selectLanguage("aiml", opt)}
                  className={`rounded-xl border px-4 py-2 text-xs font-semibold transition duration-200 ${
                    data.preferredLanguages?.aiml === opt
                      ? "border-cyan-400/40 bg-cyan-400/10 text-white shadow-[0_0_15px_rgba(34,211,238,0.15)]"
                      : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-white"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Motion.div>
  );
}

/* ═══════════ Step validation ═══════════ */
export function isStepComplete(step: number, data: OnboardingData): boolean {
  switch (step) {
    case 0: return data.targetRoles.length > 0;
    case 1: return !!data.experienceLevel;
    case 2: return data.currentSkills.length > 0;
    case 3: return !!data.dailyStudyHours;
    case 4: return !!data.targetTimeline;
    case 5: return !!data.learningStyle;
    case 6: return !!data.primaryStruggle;
    case 7: return data.careerInterests.length > 0;
    case 8: return !!data.preferredLanguages && !!data.preferredLanguages.dsa && !!data.preferredLanguages.backend && !!data.preferredLanguages.frontend && !!data.preferredLanguages.aiml;
    default: return false;
  }
}

export const STEP_TITLES = ["Target Role", "Experience", "Current Skills", "Study Time", "Timeline", "Learning Style", "Biggest Struggle", "Career Interests", "Domain Languages"];
export const STEP_AI_MESSAGES: string[][] = [
  ["Mapping your career path...", "Decomposing roles...", "Analyzing skill dependencies..."],
  ["Calibrating difficulty...", "Setting your pace...", "Optimizing terminology..."],
  ["Scanning knowledge graph...", "Identifying skill foundations...", "Mapping existing mastery..."],
  ["Measuring bandwidth...", "Scheduling milestones...", "Balancing cognitive load..."],
  ["Calculating trajectory...", "Prioritizing outcomes...", "Defining job-ready date..."],
  ["Adapting resource engine...", "Personalizing teaching style...", "Optimizing content delivery..."],
  ["Configuring mentor tone...", "Designing interventions...", "Addressing friction points..."],
  ["Analyzing interests...", "Selecting projects...", "Personalizing opportunities..."],
  ["Configuring domain languages...", "Matching language runtimes...", "Tailoring task syntax..."]
];
