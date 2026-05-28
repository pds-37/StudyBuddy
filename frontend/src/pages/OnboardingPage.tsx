import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { profileApi } from "../features/profile/api";
import { useAppStore } from "../store/app-store";
import { OnboardingLeftPanel } from "./onboarding/OnboardingLeftPanel";
import { OnboardingProfile } from "./onboarding/OnboardingProfile";
import {
  Sparkles,
  AlertCircle
} from "lucide-react";
import {
  type OnboardingData,
  defaultData,
  isStepComplete,
  STEP_TITLES,
  STEP_AI_MESSAGES,
  Step1Role,
  Step2Experience,
  Step3Skills,
  Step4Hours,
  Step5Timeline,
  Step6Style,
  Step7Struggle,
  Step8Interests,
  Step9Languages,
} from "./onboarding/OnboardingSteps";

const TOTAL_STEPS = 9;

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
        // Additional intelligence OS fields
        dailyStudyHours: data.dailyStudyHours,
        targetTimeline: data.targetTimeline,
        learningStyle: data.learningStyle,
        primaryStruggle: data.primaryStruggle,
        careerInterests: data.careerInterests,
        preferredLanguages: data.preferredLanguages,
      } as any);
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
    <Step1Role key="s1" data={data} update={update} />,
    <Step2Experience key="s2" data={data} update={update} />,
    <Step3Skills key="s3" data={data} update={update} />,
    <Step4Hours key="s4" data={data} update={update} />,
    <Step5Timeline key="s5" data={data} update={update} />,
    <Step6Style key="s6" data={data} update={update} />,
    <Step7Struggle key="s7" data={data} update={update} />,
    <Step8Interests key="s8" data={data} update={update} />,
    <Step9Languages key="s9" data={data} update={update} />,
  ];

  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 py-6 sm:py-8 lg:grid-cols-[0.85fr_1.15fr] min-h-[calc(100vh-4rem)]">
      {/* ── Left Panel ── */}
      <div className="hidden lg:block">
        <OnboardingLeftPanel step={showProfile ? TOTAL_STEPS : step} totalSteps={TOTAL_STEPS} messages={STEP_AI_MESSAGES} />
      </div>

      {/* ── Right Panel ── */}
      <div className="flex flex-col rounded-3xl sm:rounded-[2.5rem] border border-white/[0.08] bg-[#0c1017] p-5 sm:p-8 lg:p-12 shadow-[0_80px_150px_-30px_rgba(0,0,0,0.5)] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
          <Sparkles size={300} className="text-brand" />
        </div>

        {/* Mobile progress bar */}
        <div className="lg:hidden flex gap-2 mb-10">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${i <= step ? "bg-brand shadow-[0_0_10px_rgba(124,92,255,0.5)]" : "bg-white/[0.06]"}`} />
          ))}
        </div>

        {/* Step content */}
        <div className="relative z-10 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <AnimatePresence mode="wait">
            {showProfile ? (
              <OnboardingProfile key="profile" data={data} onComplete={handleComplete} isSubmitting={isSubmitting} />
            ) : (
              <Motion.div key={`step-${step}`}
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }} 
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
                <div className="mb-10">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand mb-2 block">Step {step + 1} of {TOTAL_STEPS}</span>
                  <h2 className="text-4xl font-black text-white tracking-tight leading-tight">{STEP_TITLES[step]}</h2>
                </div>
                {stepComponents[step]}
              </Motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <Motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6"
            >
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-200 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            </Motion.div>
          )}
        </AnimatePresence>

        {/* Navigation buttons */}
        {!showProfile && (
          <div className="relative z-10 flex items-center justify-between mt-12 pt-8 border-t border-white/[0.06]">
            <button 
              type="button" 
              onClick={handleBack} 
              disabled={step === 0}
              className="group flex items-center gap-2 px-6 py-3 text-sm font-bold text-slate-500 hover:text-white transition-all disabled:opacity-0 disabled:pointer-events-none"
            >
              <Motion.span animate={{ x: [0, -4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>←</Motion.span>
              Previous
            </button>
            <button 
              type="button" 
              onClick={handleNext} 
              disabled={!canAdvance}
              className="group relative overflow-hidden rounded-2xl bg-white px-10 py-4 text-sm font-black text-slate-950 transition-all hover:bg-brand hover:text-white hover:shadow-[0_20px_40px_rgba(124,92,255,0.3)] disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center gap-3">
                {step === TOTAL_STEPS - 1 ? "Initialize Profile" : "Continue"} 
                <Motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</Motion.span>
              </span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
