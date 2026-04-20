import { useState, useEffect } from "react";
import { getRoadmap, generateRoadmapFromGaps } from "../../lib/api/roadmaps";
import { RoadmapViewer } from "./RoadmapViewer";
import type { Roadmap } from "@personal-notes-ai/shared";

/** Main roadmap workspace component. */
export function RoadmapPlaceholder() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRoadmap = async () => {
    try {
      setLoading(true);
      const roadmapData = await getRoadmap();
      setRoadmap(roadmapData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load roadmap");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoadmap();
  }, []);

  const handleGenerateRoadmap = async () => {
    try {
      setGenerating(true);
      setError(null);
      const newRoadmap = await generateRoadmapFromGaps(12); // 12 weeks default
      setRoadmap(newRoadmap);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate roadmap");
    } finally {
      setGenerating(false);
    }
  };

  const handleRoadmapUpdate = () => {
    loadRoadmap();
  };

  if (loading) {
    return <div className="text-slate-400">Loading roadmap...</div>;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-red-400">{error}</div>
        <button
          onClick={handleGenerateRoadmap}
          disabled={generating}
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90 disabled:opacity-50"
        >
          {generating ? "Generating..." : "Generate Roadmap"}
        </button>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="text-center space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-white">No Roadmap Yet</h2>
          <p className="text-slate-400">
            Generate a personalized learning roadmap based on your skill gaps and career goals.
          </p>
        </div>
        <button
          onClick={handleGenerateRoadmap}
          disabled={generating}
          className="rounded-md bg-brand px-6 py-3 text-sm font-medium text-white hover:bg-brand/90 disabled:opacity-50"
        >
          {generating ? "Generating Roadmap..." : "Generate My Roadmap"}
        </button>
        <div className="text-sm text-slate-500">
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
          <p className="text-slate-400">Track your progress and stay on path to your career goals.</p>
        </div>
        <button
          onClick={handleGenerateRoadmap}
          disabled={generating}
          className="rounded-md border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
        >
          {generating ? "Regenerating..." : "Regenerate"}
        </button>
      </div>
      <RoadmapViewer roadmap={roadmap} onUpdate={handleRoadmapUpdate} />
    </div>
  );
}
