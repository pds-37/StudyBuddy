import { EmptyState } from "../components/feedback/EmptyState";
import { Link } from "react-router-dom";
import { useAppStore } from "../store/app-store";

/** Shows the protected dashboard placeholder until features are added. */
export function DashboardPage() {
  const user = useAppStore((state) => state.user);
  const clearSession = useAppStore((state) => state.clearSession);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.38em] text-cyan">Dashboard</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Welcome{user?.name ? `, ${user.name}` : ""}</h1>
        </div>
        <button
          className="rounded-full border border-white/10 px-5 py-2 text-sm text-slate-300 transition hover:border-red-400/50 hover:text-white"
          onClick={clearSession}
          type="button"
        >
          Logout
        </button>
      </div>
      <EmptyState
        title={user?.onboardingCompleted ? "Profile is ready" : "Finish profile setup"}
        description={
          user?.onboardingCompleted
            ? `Target role: ${user.targetRole}. Skills tracked: ${user.currentSkills.length}.`
            : "Add your target role and current skills so StudyBuddy can personalize your roadmap."
        }
      />
      <div className="flex flex-wrap gap-3">
        <Link
          to="/onboarding"
          className="inline-flex rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/15"
        >
          {user?.onboardingCompleted ? "Edit profile" : "Complete onboarding"}
        </Link>
        {user?.onboardingCompleted ? (
          <>
            <Link
              to="/skill-gap"
              className="inline-flex rounded-full bg-gradient-to-r from-brand to-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.01]"
            >
              Analyze skill gap
            </Link>
            <Link
              to="/roadmap"
              className="inline-flex rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/15"
            >
              View roadmap
            </Link>
            <Link
              to="/notes"
              className="inline-flex rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/15"
            >
              View notes
            </Link>
            <Link
              to="/jobs"
              className="inline-flex rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/15"
            >
              Find jobs
            </Link>
          </>
        ) : null}
      </div>
    </section>
  );
}
