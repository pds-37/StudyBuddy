import { useEffect } from "react";
import { RefreshCw, Target, Clock, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useRoadmapsStore } from "../../../store/roadmaps-store";
import { useAppStore } from "../../../store/app-store";
import { RoadmapViewer } from "./RoadmapViewer";

/** Main roadmap workspace component. */
export function RoadmapWorkspace() {
  const {
    currentRoadmap,
    loading,
    generating,
    error,
    fetchRoadmaps,
    generateRoadmap,
    clearError
  } = useRoadmapsStore();
  const user = useAppStore((state) => state.user);
  const needsOnboarding = Boolean(user && !user.onboardingCompleted);

  useEffect(() => {
    fetchRoadmaps();
  }, [fetchRoadmaps]);

  const handleGenerateRoadmap = async () => {
    await generateRoadmap(12); // 12 weeks default
  };

  const handleRoadmapUpdate = () => {
    fetchRoadmaps();
  };

  const handleRefresh = () => {
    fetchRoadmaps(true);
  };

  const handleClearError = () => {
    clearError();
  };

  if (loading && !currentRoadmap) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-brand mx-auto mb-4" />
          <p className="text-slate-400">Loading your roadmap...</p>
        </div>
      </div>
    );
  }

  if (needsOnboarding && !currentRoadmap) {
    return (
      <div className="rounded-lg border border-amber-400/20 bg-amber-500/10 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-medium text-amber-200">Finish your setup before generating a roadmap</h3>
            <p className="mt-2 max-w-2xl text-sm text-amber-100/85">
              Add your target role and current skills in onboarding so StudyBuddy can build a roadmap that actually fits you.
            </p>
          </div>
          <Link
            to="/onboarding"
            className="inline-flex items-center justify-center rounded-md bg-amber-300 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-amber-200"
          >
            Complete setup
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="mb-2 text-lg font-medium text-red-400">
              {currentRoadmap ? "Failed to refresh roadmap" : "Failed to load roadmap"}
            </h3>
            <p className="text-red-300">{error}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleClearError}
              className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-md transition"
            >
              Dismiss
            </button>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 text-sm bg-brand hover:bg-brand/90 text-white rounded-md transition flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentRoadmap) {
    return (
      <div className="text-center space-y-6 py-12">
        <div>
          <Target className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">Create Your Learning Roadmap</h2>
          <p className="text-slate-400 max-w-md mx-auto">
            Generate a personalized learning roadmap based on your skill gaps and career goals.
          </p>
        </div>
        <button
          onClick={handleGenerateRoadmap}
          disabled={generating}
          className="rounded-md bg-brand px-8 py-3 text-sm font-medium text-white hover:bg-brand/90 disabled:opacity-50 transition flex items-center gap-2 mx-auto"
        >
          {generating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Generating Roadmap...
            </>
          ) : (
            <>
              <BookOpen className="w-4 h-4" />
              Generate My Roadmap
            </>
          )}
        </button>
        <div className="text-sm text-slate-500 max-w-lg mx-auto">
          This will analyze your current skills, target role, and learning notes to create a customized 12-week plan.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Your Learning Roadmap</h2>
          <p className="text-slate-400 flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              Target: {currentRoadmap.targetRole}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {currentRoadmap.timelineWeeks} weeks
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-md transition disabled:opacity-50"
            title="Refresh roadmap"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleGenerateRoadmap}
            disabled={generating}
            className="rounded-md border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 disabled:opacity-50 transition"
          >
            {generating ? "Regenerating..." : "Regenerate"}
          </button>
        </div>
      </div>
      <RoadmapViewer roadmap={currentRoadmap} onUpdate={handleRoadmapUpdate} />
    </div>
  );
}
