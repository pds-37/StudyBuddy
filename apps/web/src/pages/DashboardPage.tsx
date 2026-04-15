import { useMemo } from "react";
import { Bot, CalendarClock, ChevronRight, NotebookText, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import LoadingScreen from "@/components/LoadingScreen";
import SurfaceCard from "@/components/SurfaceCard";
import { apiRequest } from "@/lib/api";
import { useSession } from "@/hooks/useSession";
import type { DashboardPayload, ReminderItem, RoadmapItem, StudyNote } from "@shared";

type DashboardResponse = {
  dashboard: DashboardPayload;
  notes: StudyNote[];
  reminders: ReminderItem[];
  roadmap: RoadmapItem | null;
};

function toDayKey(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return [date.getFullYear(), `${date.getMonth() + 1}`.padStart(2, "0"), `${date.getDate()}`.padStart(2, "0")].join("-");
}

function greetingForHour(hour: number) {
  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}

export default function DashboardPage() {
  const session = useSession();
  const dashboardQuery = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => apiRequest<DashboardResponse>("/dashboard")
  });

  const weekOverview = useMemo(() => {
    const notes = dashboardQuery.data?.notes ?? [];
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);

    const activeDays = new Set(
      notes
        .filter((note) => new Date(note.createdAt) >= monday)
        .map((note) => toDayKey(note.createdAt))
    );

    const slots = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);

      return {
        key: toDayKey(date),
        label: new Intl.DateTimeFormat("en-US", { weekday: "narrow" }).format(date),
        active: activeDays.has(toDayKey(date)),
        isToday: toDayKey(date) === toDayKey(now)
      };
    });

    return {
      sessions: activeDays.size,
      notesCreated: notes.filter((note) => new Date(note.createdAt) >= monday).length,
      slots
    };
  }, [dashboardQuery.data?.notes]);

  if (dashboardQuery.isLoading) {
    return <LoadingScreen message="Loading dashboard..." />;
  }

  const data = dashboardQuery.data;
  if (!data) {
    return null;
  }

  const now = new Date();
  const plan = data.dashboard.todayPlan;
  const revisionQueue = data.dashboard.revisionQueue.slice(0, 3);
  const weakTopic = data.dashboard.weakTopicAlert;
  const nextReminder = data.reminders
    .filter((item) => !item.isReviewed && new Date(item.scheduledAt) > now)
    .sort((left, right) => new Date(left.scheduledAt).getTime() - new Date(right.scheduledAt).getTime())[0] ?? null;
  const nextRoadmap = data.roadmap?.milestones.find((milestone) => milestone.status !== "completed") ?? null;
  const roadmapTotal = data.roadmap?.milestones.length ?? 0;
  const roadmapCompleted = data.roadmap?.milestones.filter((milestone) => milestone.status === "completed").length ?? 0;
  const roadmapProgress = roadmapTotal ? Math.round((roadmapCompleted / roadmapTotal) * 100) : 0;
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(now);
  const userName = session.data?.user?.name ?? "there";
  const greeting = `${formattedDate} · ${greetingForHour(now.getHours())}, ${userName}`;

  return (
    <div className="dashboard-home">
      <section className="dashboard-home__hero">
        <div className="dashboard-home__hero-main">
          <p className="eyebrow">Study Buddy</p>
          <h1>What to study today</h1>
          <p>{greeting}</p>
        </div>

        <div className="dashboard-home__metric-stack">
          <div className="dashboard-home__metric">
            <span>Plan</span>
            <strong>{plan.length}</strong>
          </div>
          <div className="dashboard-home__metric">
            <span>Due</span>
            <strong>{data.dashboard.dueToday}</strong>
          </div>
          <div className="dashboard-home__metric dashboard-home__metric--accent">
            <span>Streak</span>
            <strong>{data.dashboard.streak}d</strong>
          </div>
        </div>
      </section>

      <section className="dashboard-home__actions">
        <Link className="dashboard-action-card" to="/notes">
          <div className="dashboard-action-card__icon">
            <Plus size={18} />
          </div>
          <div>
            <strong>Add to plan</strong>
            <p>Schedule a block</p>
          </div>
          <ChevronRight size={16} />
        </Link>

        <Link className="dashboard-action-card" to="/reminders">
          <div className="dashboard-action-card__icon dashboard-action-card__icon--success">
            <CalendarClock size={18} />
          </div>
          <div>
            <strong>Start revision</strong>
            <p>Review flashcards</p>
          </div>
          <ChevronRight size={16} />
        </Link>

        <Link className="dashboard-action-card" to="/buddy">
          <div className="dashboard-action-card__icon dashboard-action-card__icon--muted">
            <Bot size={18} />
          </div>
          <div>
            <strong>Ask Buddy</strong>
            <p>{weakTopic ? `Review ${weakTopic.topic}` : "Get study help"}</p>
          </div>
          <ChevronRight size={16} />
        </Link>
      </section>

      <section className="dashboard-home__content">
        <SurfaceCard
          className="dashboard-home__panel dashboard-home__panel--wide"
          title="Today's plan"
          action={
            <Link className="surface-link" to="/notes">
              + New note
            </Link>
          }
        >
          {plan.length ? (
            <div className="stack-list">
              {plan.slice(0, 4).map((block) => (
                <div key={block.id} className="dashboard-home__row">
                  <div className="dashboard-home__row-icon">
                    <NotebookText size={16} />
                  </div>
                  <div className="dashboard-home__row-copy">
                    <strong>{block.topic}</strong>
                    <p>{block.subject}</p>
                  </div>
                  <span className="badge badge--secondary">{block.minutes}m</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="dashboard-home__empty">
              <div className="dashboard-home__row-icon">
                <NotebookText size={16} />
              </div>
              <div>
                <strong>No plan yet</strong>
                <p>{nextRoadmap ? `Start with ${nextRoadmap.topic}` : "Add a note or set a roadmap to begin your day"}</p>
              </div>
            </div>
          )}
        </SurfaceCard>

        <SurfaceCard
          className="dashboard-home__panel"
          title="Revision"
          action={
            <Link className="surface-link" to="/reminders">
              Review
            </Link>
          }
        >
          {revisionQueue.length ? (
            <div className="stack-list">
              {revisionQueue.map((item) => (
                <div key={item.id} className="dashboard-home__row">
                  <div className="dashboard-home__row-icon dashboard-home__row-icon--muted">
                    <CalendarClock size={16} />
                  </div>
                  <div className="dashboard-home__row-copy">
                    <strong>{item.topic}</strong>
                    <p>{item.subject}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="dashboard-home__empty">
              <div className="dashboard-home__row-icon dashboard-home__row-icon--muted">
                <CalendarClock size={16} />
              </div>
              <div>
                <strong>Queue clear</strong>
                <p>Nothing due for review right now</p>
              </div>
            </div>
          )}
        </SurfaceCard>
      </section>

      <section className="dashboard-home__stats">
        <SurfaceCard className="dashboard-home__stat-card" title="This week">
          <div className="dashboard-home__stat-value">{weekOverview.sessions} sessions</div>
          <div className="dashboard-home__week-row">
            {weekOverview.slots.map((slot) => (
              <span
                key={slot.key}
                className={`dashboard-home__week-pill ${slot.active ? "is-active" : ""} ${slot.isToday ? "is-today" : ""}`}
              >
                {slot.label}
              </span>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard className="dashboard-home__stat-card" title="Notes">
          <div className="dashboard-home__stat-value">{weekOverview.notesCreated} created</div>
          <span className="badge badge--secondary">{weekOverview.notesCreated ? "Active this week" : "No activity yet"}</span>
        </SurfaceCard>

        <SurfaceCard className="dashboard-home__stat-card" title="Roadmap">
          <div className="dashboard-home__stat-value">{data.roadmap ? `${roadmapProgress}%` : "No plan"}</div>
          <p className="dashboard-home__stat-copy">
            {nextRoadmap
              ? `${nextRoadmap.topic} is your next milestone`
              : data.roadmap
                ? "All milestones are covered"
                : nextReminder
                  ? nextReminder.title
                  : "Create a roadmap to guide your next step"}
          </p>
        </SurfaceCard>
      </section>
    </div>
  );
}
