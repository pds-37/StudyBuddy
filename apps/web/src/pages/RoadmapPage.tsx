import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, CalendarDays, Compass, ListTodo, Sparkles, Target } from "lucide-react";

import LoadingScreen from "@/components/LoadingScreen";
import SurfaceCard from "@/components/SurfaceCard";
import { ApiError, apiRequest } from "@/lib/api";
import { useUiStore } from "@/lib/ui-store";
import type { MilestoneItem, RoadmapItem } from "@shared";

type RoadmapResponse = {
  roadmap: RoadmapItem | null;
};

type DraftResponse = {
  roadmap: Omit<RoadmapItem, "id" | "userId" | "createdAt" | "isActive">;
  warning?: string;
};

type PersistedRoadmapResponse = {
  roadmap: RoadmapItem;
};

const timelineOptions = [
  { value: "2_weeks", label: "2 weeks" },
  { value: "1_month", label: "1 month" },
  { value: "3_months", label: "3 months" },
  { value: "semester", label: "Semester" }
];

const filterOptions = [
  { value: "all", label: "All milestones" },
  { value: "upcoming", label: "Upcoming" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" }
] as const;

function statusLabel(status: MilestoneItem["status"]) {
  if (status === "in_progress") {
    return "In progress";
  }

  if (status === "completed") {
    return "Completed";
  }

  return "Upcoming";
}

function formatDateLabel(value: string | null) {
  if (!value) {
    return "No target date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export default function RoadmapPage() {
  const queryClient = useQueryClient();
  const { openComposer } = useUiStore();
  const [goal, setGoal] = useState("");
  const [subjectHint, setSubjectHint] = useState("");
  const [timeline, setTimeline] = useState("1_month");
  const [milestoneFilter, setMilestoneFilter] = useState<(typeof filterOptions)[number]["value"]>("all");
  const [resourceTopic, setResourceTopic] = useState("auto");
  const [showBuilder, setShowBuilder] = useState(false);
  const [feedback, setFeedback] = useState("");

  const roadmapQuery = useQuery({
    queryKey: ["roadmap"],
    queryFn: () => apiRequest<RoadmapResponse>("/roadmap/active")
  });

  const roadmap = roadmapQuery.data?.roadmap ?? null;

  const completion = useMemo(() => {
    const milestones = roadmap?.milestones ?? [];
    if (!milestones.length) {
      return 0;
    }

    const done = milestones.filter((milestone) => milestone.status === "completed").length;
    return Math.round((done / milestones.length) * 100);
  }, [roadmap?.milestones]);

  const visibleMilestones = useMemo(() => {
    const milestones = roadmap?.milestones ?? [];
    if (milestoneFilter === "all") {
      return milestones;
    }

    return milestones.filter((milestone) => milestone.status === milestoneFilter);
  }, [milestoneFilter, roadmap?.milestones]);

  const featuredMilestone = useMemo(() => {
    const milestones = roadmap?.milestones ?? [];
    return milestones.find((milestone) => milestone.status !== "completed") ?? milestones[0] ?? null;
  }, [roadmap?.milestones]);

  const selectedResourceTopic = useMemo(() => {
    if (!roadmap?.milestones.length || resourceTopic === "auto") {
      return featuredMilestone;
    }

    return roadmap.milestones.find((milestone) => milestone.id === resourceTopic) ?? featuredMilestone;
  }, [featuredMilestone, resourceTopic, roadmap?.milestones]);

  const progressStats = useMemo(() => {
    const milestones = roadmap?.milestones ?? [];
    const completed = milestones.filter((milestone) => milestone.status === "completed").length;
    const active = milestones.filter((milestone) => milestone.status === "in_progress").length;
    const totalTargetNotes = milestones.reduce((sum, milestone) => sum + milestone.estimatedNotes, 0);
    const totalActualNotes = milestones.reduce((sum, milestone) => sum + milestone.actualNotes, 0);

    return {
      total: milestones.length,
      completed,
      active,
      targetNotes: totalTargetNotes,
      actualNotes: totalActualNotes
    };
  }, [roadmap?.milestones]);

  const resourceLinks = useMemo(() => {
    const topic = selectedResourceTopic?.topic ?? subjectHint ?? "study topic";
    const subject = roadmap?.subject ?? subjectHint ?? "subject";
    const query = encodeURIComponent(`${subject} ${topic}`);

    return [
      {
        label: "Video",
        description: "Best explainer",
        href: `https://www.youtube.com/results?search_query=${query}+explained`
      },
      {
        label: "Notes",
        description: "Concise reference",
        href: `https://www.google.com/search?q=${query}+notes+pdf`
      },
      {
        label: "Practice",
        description: "Questions set",
        href: `https://www.google.com/search?q=${query}+practice+questions`
      }
    ];
  }, [roadmap?.subject, selectedResourceTopic?.topic, subjectHint]);

  const openMilestoneComposer = (topic: string) => {
    openComposer({
      subjectHint: roadmap?.subject ?? subjectHint,
      content: `Topic: ${topic}\nGoal: ${roadmap?.goalTitle ?? goal}\n\nWhat I studied:\n- \n\nKey idea to remember:\n- `
    });
  };

  const draftMutation = useMutation({
    mutationFn: async () => {
      const payload = await apiRequest<DraftResponse>("/ai/roadmap", {
        method: "POST",
        json: {
          goal,
          subjectHint,
          timeline
        }
      });

      const saved = await apiRequest<PersistedRoadmapResponse>("/roadmap", {
        method: "POST",
        json: payload.roadmap
      });

      return {
        roadmap: saved.roadmap,
        warning: payload.warning
      };
    },
    onSuccess: async (payload) => {
      setFeedback(payload.warning ? `${payload.warning} Saved to your roadmap.` : "Roadmap ready.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["roadmap"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      ]);
      setGoal("");
      setShowBuilder(false);
      setResourceTopic("auto");
    },
    onError: (error) => {
      setFeedback(error instanceof ApiError ? error.message : "Could not generate roadmap.");
    }
  });

  const resetMutation = useMutation({
    mutationFn: () => apiRequest("/roadmap/active", { method: "DELETE" }),
    onSuccess: async () => {
      setFeedback("Roadmap cleared.");
      setResourceTopic("auto");
      setShowBuilder(true);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["roadmap"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      ]);
    },
    onError: () => {
      setFeedback("Could not clear the roadmap right now.");
    }
  });

  if (roadmapQuery.isLoading) {
    return <LoadingScreen message="Loading roadmap..." />;
  }

  const builderVisible = showBuilder || !roadmap;

  return (
    <div className="roadmap-page roadmap-page--premium">
      <section className="roadmap-hero roadmap-hero--premium">
        <div className="roadmap-hero__copy">
          <p className="eyebrow">Study Buddy</p>
          <h1>Roadmap</h1>
          <p>{roadmap ? "A clean execution board for your goal, milestones, and next study move." : "Turn one goal into a premium study sequence."}</p>
        </div>

        <div className="roadmap-hero__controls">
          <label className="roadmap-select roadmap-select--ghost">
            <span>View</span>
            <select value={milestoneFilter} onChange={(event) => setMilestoneFilter(event.target.value as typeof milestoneFilter)}>
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <button className="surface-link-button roadmap-hero__button" onClick={() => setShowBuilder((current) => !current)}>
            {builderVisible ? "Hide draft" : "New draft"}
          </button>

          {roadmap ? (
            <button className="surface-link-button roadmap-hero__button" onClick={() => resetMutation.mutate()} disabled={resetMutation.isPending}>
              {resetMutation.isPending ? "Resetting..." : "Reset"}
            </button>
          ) : null}
        </div>
      </section>

      <div className="roadmap-layout roadmap-layout--premium">
        <div className="roadmap-layout__main roadmap-layout__main--premium">
          {roadmap ? (
            <>
              <section className="roadmap-showcase">
                <div className="roadmap-showcase__hero">
                  <div className="roadmap-showcase__copy">
                    <span className="roadmap-showcase__pill">{roadmap.subject || "Custom subject"}</span>
                    <h2>{roadmap.goalTitle}</h2>
                    <p>Buddy keeps this plan adaptive. Save notes against a topic and the milestone status updates automatically.</p>
                  </div>

                  <div className="roadmap-showcase__metrics">
                    <div className="roadmap-showcase__metric">
                      <span>Progress</span>
                      <strong>{completion}%</strong>
                    </div>
                    <div className="roadmap-showcase__metric">
                      <span>Target</span>
                      <strong>{formatDateLabel(roadmap.targetDate)}</strong>
                    </div>
                    <div className="roadmap-showcase__metric">
                      <span>Milestones</span>
                      <strong>
                        {progressStats.completed}/{progressStats.total}
                      </strong>
                    </div>
                    <div className="roadmap-showcase__metric">
                      <span>Study notes</span>
                      <strong>
                        {progressStats.actualNotes}/{progressStats.targetNotes}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="roadmap-showcase__progress">
                  <div className="roadmap-progress roadmap-progress--hero">
                    <div>
                      <strong>{featuredMilestone ? featuredMilestone.topic : "Plan synced"}</strong>
                      <p>{featuredMilestone ? featuredMilestone.description : "Every milestone is already covered."}</p>
                    </div>
                    <div className="roadmap-progress__bar">
                      <div style={{ width: `${completion}%` }} />
                    </div>
                  </div>
                </div>
              </section>

              <SurfaceCard
                className="roadmap-sequence"
                title="Milestone sequence"
                subtitle={`${visibleMilestones.length} visible of ${progressStats.total}`}
              >
                <div className="roadmap-sequence__list">
                  {visibleMilestones.length ? (
                    visibleMilestones.map((milestone, index) => (
                      <article key={milestone.id} className={`roadmap-sequence__item roadmap-sequence__item--${milestone.status}`}>
                        <div className="roadmap-sequence__index">{index + 1}</div>

                        <div className="roadmap-sequence__content">
                          <div className="roadmap-sequence__head">
                            <div>
                              <strong>{milestone.topic}</strong>
                              <p>{milestone.description}</p>
                            </div>
                            <span className={`roadmap-status-chip roadmap-status-chip--${milestone.status}`}>{statusLabel(milestone.status)}</span>
                          </div>

                          <div className="roadmap-sequence__meta">
                            <span className="badge badge--secondary">
                              {milestone.actualNotes}/{milestone.estimatedNotes} notes
                            </span>
                            <button className="surface-link-button roadmap-inline-button" onClick={() => openMilestoneComposer(milestone.topic)}>
                              Study this
                            </button>
                          </div>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="dashboard-empty-panel">
                      <strong>No milestones in this filter</strong>
                      <p>Switch the filter to review another stage of the roadmap.</p>
                    </div>
                  )}
                </div>
              </SurfaceCard>
            </>
          ) : (
            <SurfaceCard className="roadmap-sequence roadmap-sequence--empty" title="Roadmap" subtitle="Create a clean plan">
              <div className="roadmap-builder roadmap-builder--empty">
                <strong>No roadmap yet</strong>
                <p>Start with one goal and Buddy will turn it into a clean sequence of milestones.</p>
              </div>
            </SurfaceCard>
          )}
        </div>

        <div className="roadmap-layout__side roadmap-layout__side--premium">
          {builderVisible ? (
            <SurfaceCard title={roadmap ? "New draft" : "Create roadmap"} subtitle="Goal to execution">
              <div className="roadmap-builder">
                <textarea
                  className="chat-input roadmap-builder__goal"
                  value={goal}
                  onChange={(event) => setGoal(event.target.value)}
                  placeholder="I want to finish my mid-sem revision in 4 weeks..."
                />

                <div className="roadmap-builder__controls">
                  <label className="roadmap-select">
                    <span>Subject</span>
                    <input value={subjectHint} onChange={(event) => setSubjectHint(event.target.value)} placeholder="Optional subject" />
                  </label>

                  <label className="roadmap-select">
                    <span>Timeline</span>
                    <select value={timeline} onChange={(event) => setTimeline(event.target.value)}>
                      {timelineOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <p className="form-feedback">{feedback || "Buddy will generate a roadmap even if Gemini is unavailable."}</p>

                <button className="primary-button" onClick={() => draftMutation.mutate()} disabled={!goal.trim() || draftMutation.isPending}>
                  {draftMutation.isPending ? "Generating..." : "Generate roadmap"}
                </button>
              </div>
            </SurfaceCard>
          ) : null}

          <SurfaceCard title="Focus now" subtitle={featuredMilestone?.topic ?? "No roadmap yet"}>
            {featuredMilestone ? (
              <div className="roadmap-focus-card roadmap-focus-card--premium">
                <div className="roadmap-focus-card__icon">
                  <Target size={18} />
                </div>
                <strong>{featuredMilestone.topic}</strong>
                <p>{featuredMilestone.description}</p>
                <span className="badge badge--secondary">
                  {featuredMilestone.actualNotes}/{featuredMilestone.estimatedNotes} notes
                </span>
                <div className="roadmap-focus-card__actions">
                  <button className="primary-button" onClick={() => openMilestoneComposer(featuredMilestone.topic)}>
                    Study this
                  </button>
                  <a className="surface-link-button" href={resourceLinks[0].href} target="_blank" rel="noreferrer">
                    Open video
                  </a>
                </div>
              </div>
            ) : (
              <div className="dashboard-empty-panel">
                <strong>No active topic</strong>
                <p>Generate a roadmap to get your next topic.</p>
              </div>
            )}
          </SurfaceCard>

          {roadmap ? (
            <SurfaceCard title="Roadmap signals" subtitle="At a glance">
              <div className="roadmap-signals">
                <div className="roadmap-signals__item">
                  <div className="roadmap-signals__icon">
                    <Compass size={16} />
                  </div>
                  <div>
                    <strong>{progressStats.active} active now</strong>
                    <p>Milestones already in progress</p>
                  </div>
                </div>

                <div className="roadmap-signals__item">
                  <div className="roadmap-signals__icon">
                    <ListTodo size={16} />
                  </div>
                  <div>
                    <strong>{progressStats.total - progressStats.completed} remaining</strong>
                    <p>Topics left before the goal is complete</p>
                  </div>
                </div>

                <div className="roadmap-signals__item">
                  <div className="roadmap-signals__icon">
                    <CalendarDays size={16} />
                  </div>
                  <div>
                    <strong>{formatDateLabel(roadmap.targetDate)}</strong>
                    <p>Planned target date</p>
                  </div>
                </div>
              </div>
            </SurfaceCard>
          ) : null}

          <SurfaceCard
            title="Resources"
            subtitle={selectedResourceTopic?.topic ?? "Suggested from your roadmap"}
            action={
              roadmap?.milestones.length ? (
                <label className="roadmap-select roadmap-select--compact">
                  <span>Topic</span>
                  <select value={resourceTopic} onChange={(event) => setResourceTopic(event.target.value)}>
                    <option value="auto">Auto</option>
                    {roadmap.milestones.map((milestone) => (
                      <option key={milestone.id} value={milestone.id}>
                        {milestone.topic}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null
            }
          >
            <div className="resource-list">
              {resourceLinks.map((resource) => (
                <a key={resource.label} className="resource-row resource-row--premium" href={resource.href} target="_blank" rel="noreferrer">
                  <div>
                    <strong>{resource.label}</strong>
                    <p>{resource.description}</p>
                  </div>
                  <span className="surface-link">
                    Open
                    <ArrowUpRight size={14} />
                  </span>
                </a>
              ))}
            </div>
          </SurfaceCard>
        </div>
      </div>
    </div>
  );
}
