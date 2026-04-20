import { type FormEvent, useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { skillsApi } from "../features/skills/api";
import { type SkillSuggestion } from "../features/skills/types";
import { profileApi } from "../features/profile/api";
import { useAppStore } from "../store/app-store";

const experienceLevels = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" }
] as const;

/** Converts profile API errors into readable form feedback. */
function getProfileErrorMessage(error: unknown) {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "Unable to save your profile right now.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to save your profile right now.";
}

/** Collects target role and skills after signup so the app can personalize guidance. */
export function OnboardingPage() {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);
  const [name, setName] = useState(user?.name ?? "");
  const [targetRole, setTargetRole] = useState(user?.targetRole ?? "");
  const [experienceLevel, setExperienceLevel] = useState(user?.experienceLevel ?? "beginner");
  const [currentSkills, setCurrentSkills] = useState<string[]>(user?.currentSkills ?? []);
  const [skillInput, setSkillInput] = useState("");
  const [suggestions, setSuggestions] = useState<SkillSuggestion[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(
    () => name.trim().length >= 2 && targetRole.trim().length >= 2 && currentSkills.length > 0,
    [currentSkills.length, name, targetRole]
  );

  useEffect(() => {
    if (!skillInput.trim()) {
      setSuggestions([]);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void skillsApi.search(skillInput).then(setSuggestions).catch(() => setSuggestions([]));
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [skillInput]);

  /** Adds a selected or custom skill to the current profile draft. */
  function addSkill(skill: string) {
    const normalizedSkill = skill.trim();

    if (!normalizedSkill) {
      return;
    }

    setCurrentSkills((existingSkills) => {
      if (existingSkills.some((existingSkill) => existingSkill.toLowerCase() === normalizedSkill.toLowerCase())) {
        return existingSkills;
      }

      return [...existingSkills, normalizedSkill];
    });
    setSkillInput("");
    setSuggestions([]);
  }

  /** Removes a skill chip from the current profile draft. */
  function removeSkill(skill: string) {
    setCurrentSkills((existingSkills) => existingSkills.filter((existingSkill) => existingSkill !== skill));
  }

  /** Saves onboarding profile data and moves the user into the dashboard. */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!canSubmit) {
      setError("Add your name, target role, and at least one skill.");
      return;
    }

    setSubmitting(true);

    try {
      const profile = await profileApi.updateProfile({
        name,
        targetRole,
        currentSkills,
        experienceLevel
      });
      setUser(profile);
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(getProfileErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-glow">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-cyan">Profile setup</p>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white">Tell StudyBuddy where you want to go.</h1>
        <p className="mt-5 text-sm leading-7 text-slate-400">
          This creates the base context for skill gaps, AI roadmaps, job matching, and career chat.
        </p>
        <div className="mt-8 grid gap-3 text-sm text-slate-300">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">1. Target role</div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">2. Current skill set</div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">3. Experience level</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/10 bg-panel p-6 shadow-glow">
        <div className="grid gap-5">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-sm text-white outline-none transition focus:border-brand"
              placeholder="Your name"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Target role</span>
            <input
              value={targetRole}
              onChange={(event) => setTargetRole(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-sm text-white outline-none transition focus:border-brand"
              placeholder="Frontend Developer, Data Analyst, AI Engineer..."
            />
          </label>

          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Experience</span>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {experienceLevels.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setExperienceLevel(level.value)}
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    experienceLevel === level.value
                      ? "border-brand bg-brand/20 text-white"
                      : "border-white/10 bg-black/20 text-slate-400 hover:text-white"
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Current skills</span>
            <div className="mt-2 rounded-2xl border border-white/10 bg-black/30 p-3">
              <div className="flex flex-wrap gap-2">
                {currentSkills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="rounded-full border border-brand/30 bg-brand/15 px-3 py-1 text-xs font-semibold text-slate-100"
                  >
                    {skill} x
                  </button>
                ))}
              </div>
              <input
                value={skillInput}
                onChange={(event) => setSkillInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addSkill(skillInput);
                  }
                }}
                className="mt-3 w-full bg-transparent px-1 py-2 text-sm text-white outline-none"
                placeholder="Search O*NET skills or press Enter to add your own"
              />
            </div>

            {suggestions.length > 0 ? (
              <div className="mt-3 grid gap-2 rounded-2xl border border-white/10 bg-black/30 p-2">
                {suggestions.map((skill) => (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => addSkill(skill.name)}
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                  >
                    <span>{skill.name}</span>
                    <span className="text-xs text-slate-500">{skill.category}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {error ? <p className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}

        <button
          disabled={isSubmitting || !canSubmit}
          className="mt-7 w-full rounded-2xl bg-gradient-to-r from-brand to-blue-500 px-5 py-4 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
          type="submit"
        >
          {isSubmitting ? "Saving profile..." : "Continue to dashboard"}
        </button>
      </form>
    </section>
  );
}
