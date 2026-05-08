import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { profileApi } from "../features/profile/api";
import { useAppStore } from "../store/app-store";
import { OnboardingLeftPanel } from "./onboarding/OnboardingLeftPanel";
import { OnboardingProfile } from "./onboarding/OnboardingProfile";
import {
  type OnboardingData,
  defaultData,
  isStepComplete,
  STEP_TITLES,
  STEP_AI_MESSAGES,
  Step1Career,
  Step2Academic,
  Step3Behavior,
  Step4Learning,
  Step5Mentor,
} from "./onboarding/OnboardingSteps";

const TOTAL_STEPS = 5;

function getProfileErrorMessage(error: unknown) {
  if (isAxiosError<{ message?: string; errors?: any }>(error)) {
    const data = error.response?.data;
    if (data?.errors && Array.isArray(data.errors))
      return data.errors.map((err: any) => err.message).join(" | ");
    return data?.message ?? "Unable to save your profile right now.";
  }
  return error instanceof Error ? error.message : "Unable to save your profile right now.";
}

/** Multi-step conversational onboarding flow. */
export function OnboardingPage() {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);

  const [step, setStep] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const [data, setData] = useState<OnboardingData>(() => ({
    ...defaultData,
    name: user?.name ?? "",
    targetRoles: user?.targetRoles ?? [],
    currentSkills: user?.currentSkills ?? [],
    experienceLevel: user?.experienceLevel ?? "beginner",
  }));
  const [error, setError] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);

  // Pick up pending target from localStorage (from landing page)
  useEffect(() => {
    const pending = localStorage.getItem("studybuddy_pending_target");
    if (pending) {
      setData((d) => ({
        ...d,
        targetRoles: d.targetRoles.includes(pending) ? d.targetRoles : [...d.targetRoles, pending],
      }));
      localStorage.removeItem("studybuddy_pending_target");
    }
  }, []);

  const update = useCallback(
    (partial: Partial<OnboardingData>) => setData((prev) => ({ ...prev, ...partial })),
    []
  );

  const canAdvance = isStepComplete(step, data);

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1);
    else setShowProfile(true);
  };

  const handleBack = () => {
    if (showProfile) setShowProfile(false);
    else if (step > 0) setStep((s) => s - 1);
  };

  const handleComplete = async () => {
    setError("");
    setSubmitting(true);

    // Derive a name if not provided yet
    const finalName = data.name.trim() || user?.name || "Student";

    try {
      const profile = await profileApi.updateProfile({
        name: finalName,
        targetRoles: data.targetRoles,
        currentSkills: data.currentSkills,
        experienceLevel: data.experienceLevel,
      });
      setUser(profile);
      
      // Automatically trigger roadmap generation after onboarding
      try {
        const { generateRoadmapFromGaps } = await import("../lib/api/roadmaps");
        await generateRoadmapFromGaps(12); // Generate 12-week roadmap
      } catch (genErr) {
        console.error("Failed to auto-generate roadmap:", genErr);
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(getProfileErrorMessage(err));
      setSubmitting(false);
    }
  };

  /* Step components */
  const stepComponents = [
    <Step1Career key="s1" data={data} update={update} />,
    <Step2Academic key="s2" data={data} update={update} />,
    <Step3Behavior key="s3" data={data} update={update} />,
    <Step4Learning key="s4" data={data} update={update} />,
    <Step5Mentor key="s5" data={data} update={update} />,
  ];

  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[0.85fr_1.15fr] min-h-[calc(100vh-4rem)]">
      {/* ── Left Panel ── */}
      <div className="hidden lg:block">
        <OnboardingLeftPanel step={showProfile ? TOTAL_STEPS : step} totalSteps={TOTAL_STEPS} messages={STEP_AI_MESSAGES} />
      </div>

      {/* ── Right Panel ── */}
      <div className="flex flex-col rounded-[2rem] border border-white/[0.06] bg-white/[0.015] p-6 lg:p-8 shadow-[0_40px_100px_rgba(0,0,0,0.3)]">
        {/* Mobile progress bar */}
        <div className="lg:hidden flex gap-1.5 mb-6">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? "bg-cyan-400" : "bg-white/[0.06]"}`} />
          ))}
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin">
          <AnimatePresence mode="wait">
            {showProfile ? (
              <OnboardingProfile key="profile" data={data} onComplete={handleComplete} isSubmitting={isSubmitting} />
            ) : (
              <Motion.div key={`step-${step}`}
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
                {stepComponents[step]}
              </Motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error */}
        {error && (
          <Motion.p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            {error}
          </Motion.p>
        )}

        {/* Navigation buttons */}
        {!showProfile && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/[0.04]">
            <button type="button" onClick={handleBack} disabled={step === 0}
              className="px-5 py-2.5 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-900 dark:text-white transition disabled:opacity-30 disabled:cursor-not-allowed">
              ← Back
            </button>
            <button type="button" onClick={handleNext} disabled={!canAdvance}
              className="rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-slate-950 transition-all hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white">
              {step === TOTAL_STEPS - 1 ? "See my profile →" : "Continue →"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
