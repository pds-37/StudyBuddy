import { Router } from "express";
import { z } from "zod";

import { requireAuth } from "../middleware/requireAuth";
import { store } from "../data/store";
import { chatWithBuddy, generateRoadmap } from "../services/gemini";

const router = Router();

const chatSchema = z.object({
  message: z.string().min(2),
  history: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string()
    })
  )
});

const roadmapSchema = z.object({
  goal: z.string().min(10),
  subjectHint: z.string().optional(),
  timeline: z.string().optional()
});

const roadmapStatusSchema = z.enum(["upcoming", "in_progress", "completed"]);

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function timelineToDays(value?: string) {
  switch (value) {
    case "2_weeks":
      return 14;
    case "1_month":
      return 30;
    case "3_months":
      return 90;
    case "semester":
      return 120;
    default:
      return 45;
  }
}

function inferSubject(goal: string, subjectHint?: string) {
  if (subjectHint?.trim()) {
    return subjectHint.trim();
  }

  const match = goal.match(/for\s+([a-zA-Z0-9 &-]{3,40})/i);
  if (match?.[1]) {
    return match[1].trim();
  }

  return "General Studies";
}

function buildFallbackRoadmap(goal: string, subjectHint?: string, timeline?: string) {
  const subject = inferSubject(goal, subjectHint);
  const targetDate = addDays(new Date(), timelineToDays(timeline)).toISOString();
  const topics = [
    "Foundations",
    "Core concepts",
    "Problem solving",
    "Revision sprint"
  ];

  return {
    goalTitle: goal.length > 48 ? `${goal.slice(0, 45)}...` : goal,
    subject,
    targetDate,
    milestones: topics.map((topic, index) => ({
      topic: `${subject} ${topic}`,
      description:
        index === 0
          ? `Build a reliable understanding of the basics in ${subject}.`
          : index === topics.length - 1
            ? `Consolidate the strongest and weakest parts of ${subject} before the target date.`
            : `Push forward through ${subject} with focused practice and notes.`,
      orderIndex: index + 1,
      status: "upcoming" as const,
      estimatedNotes: index === 0 ? 2 : 3,
      actualNotes: 0
    }))
  };
}

function normalizeTargetDate(value: unknown, timeline?: string) {
  if (typeof value === "string" && !Number.isNaN(Date.parse(value))) {
    return new Date(value).toISOString();
  }

  return addDays(new Date(), timelineToDays(timeline)).toISOString();
}

function normalizeInteger(value: unknown, fallback: number, minimum = 0) {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseInt(value, 10)
        : Number.NaN;

  if (Number.isFinite(parsed) && parsed >= minimum) {
    return parsed;
  }

  return fallback;
}

function normalizeRoadmapDraft(
  draft: unknown,
  goal: string,
  subjectHint?: string,
  timeline?: string
) {
  if (!draft || typeof draft !== "object") {
    return buildFallbackRoadmap(goal, subjectHint, timeline);
  }

  const candidate = draft as Record<string, unknown>;
  const subject =
    (typeof candidate.subject === "string" && candidate.subject.trim()) || inferSubject(goal, subjectHint);

  const rawMilestones = Array.isArray(candidate.milestones) ? candidate.milestones : [];
  const milestones = rawMilestones
    .map((milestone, index) => {
      if (!milestone || typeof milestone !== "object") {
        return null;
      }

      const entry = milestone as Record<string, unknown>;
      const topic =
        (typeof entry.topic === "string" && entry.topic.trim()) ||
        (typeof entry.name === "string" && entry.name.trim()) ||
        "";

      if (!topic) {
        return null;
      }

      const statusValue =
        typeof entry.status === "string" && roadmapStatusSchema.safeParse(entry.status).success ? entry.status : "upcoming";

      return {
        topic,
        description:
          (typeof entry.description === "string" && entry.description.trim()) ||
          `Study ${topic} with focused notes and revision.`,
        orderIndex: normalizeInteger(entry.orderIndex, index + 1, 1),
        status: statusValue as z.infer<typeof roadmapStatusSchema>,
        estimatedNotes: normalizeInteger(entry.estimatedNotes, 2, 1),
        actualNotes: normalizeInteger(entry.actualNotes, 0, 0)
      };
    })
    .filter((milestone): milestone is NonNullable<typeof milestone> => Boolean(milestone));

  if (!milestones.length) {
    return buildFallbackRoadmap(goal, subjectHint, timeline);
  }

  return {
    goalTitle:
      (typeof candidate.goalTitle === "string" && candidate.goalTitle.trim()) ||
      (typeof candidate.goal_title === "string" && candidate.goal_title.trim()) ||
      goal.slice(0, 64),
    subject,
    targetDate: normalizeTargetDate(candidate.targetDate ?? candidate.target_date, timeline),
    milestones
  };
}

router.use(requireAuth);

router.post("/chat", async (request, response) => {
  const parsed = chatSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ message: "Send a proper question to Buddy." });
    return;
  }

  try {
    const notes = await store.listNotes(request.user!.id);
    const reply = await chatWithBuddy(parsed.data.message, parsed.data.history, notes);
    response.json({ reply });
  } catch {
    response.json({
      reply:
        "I couldn't reach Gemini right now, but your study space is still here. Try again in a moment and keep the momentum going."
    });
  }
});

router.post("/roadmap", async (request, response) => {
  const parsed = roadmapSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ message: "Describe the roadmap goal in a bit more detail." });
    return;
  }

  try {
    const prompt = [
      parsed.data.goal,
      parsed.data.subjectHint ? `Subject: ${parsed.data.subjectHint}` : "",
      parsed.data.timeline ? `Timeline: ${parsed.data.timeline}` : ""
    ]
      .filter(Boolean)
      .join("\n");

    const draft = await generateRoadmap(prompt);
    const roadmap = normalizeRoadmapDraft(draft, parsed.data.goal, parsed.data.subjectHint, parsed.data.timeline);
    response.json({ roadmap });
  } catch {
    response.json({
      roadmap: buildFallbackRoadmap(parsed.data.goal, parsed.data.subjectHint, parsed.data.timeline),
      warning: "Gemini roadmap generation is unavailable right now, so Buddy created a local draft."
    });
  }
});

export default router;
