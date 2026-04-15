import type { Milestone, Note, RoadmapWithMilestones } from "@/lib/types";

const normalize = (value: string | null | undefined) =>
  (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const includesEitherWay = (left: string, right: string) => {
  if (!left || !right) {
    return false;
  }

  return left.includes(right) || right.includes(left);
};

const noteMatchesMilestone = (note: Note, milestone: Milestone, roadmapSubject?: string) => {
  const milestoneTopic = normalize(milestone.topic);
  const noteSubject = normalize(note.subject);
  const noteCategory = normalize(note.category);
  const roadmapTopic = normalize(note.roadmapTopic);

  if (roadmapSubject && noteSubject && !includesEitherWay(noteSubject, normalize(roadmapSubject))) {
    return false;
  }

  if (includesEitherWay(roadmapTopic, milestoneTopic)) {
    return true;
  }

  if (includesEitherWay(noteCategory, milestoneTopic)) {
    return true;
  }

  return note.keyConcepts.some((concept) => includesEitherWay(normalize(concept), milestoneTopic));
};

export const syncRoadmapWithNotes = (roadmapWithMilestones: RoadmapWithMilestones | null, notes: Note[]) => {
  if (!roadmapWithMilestones) {
    return {
      milestones: [] as Milestone[],
      completedNow: [] as Milestone[]
    };
  }

  const completedNow: Milestone[] = [];
  const milestones = roadmapWithMilestones.milestones.map((milestone) => {
    const matchingNotes = notes.filter((note) =>
      noteMatchesMilestone(note, milestone, roadmapWithMilestones.roadmap.subject)
    );
    const actualNotes = matchingNotes.length;
    const nextStatus = actualNotes >= milestone.estimatedNotes
      ? "completed"
      : actualNotes > 0
        ? "in_progress"
        : "upcoming";

    const updated = {
      ...milestone,
      actualNotes,
      status: nextStatus
    } satisfies Milestone;

    if (milestone.status !== "completed" && updated.status === "completed") {
      completedNow.push(updated);
    }

    return updated;
  });

  return {
    milestones,
    completedNow
  };
};
