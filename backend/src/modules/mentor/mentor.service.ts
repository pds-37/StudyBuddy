import { InterviewModel } from "../interview/interview.model.js";
import { NoteModel } from "../notes/note.model.js";
import { ProjectModel } from "../projects/project.model.js";
import { RoadmapModel, type RoadmapDocument } from "../roadmaps/roadmap.model.js";
import { skillsService } from "../skills/skills.service.js";
import { UserModel, type UserDocument } from "../users/user.model.js";
import { recallService } from "../recall/recall.service.js";
import { ApiError } from "../../utils/api-error.js";
import { MentorDailyPlanModel, type MentorDailyPlanDocument } from "./mentor.model.js";
import type {
  MentorJourneyStage,
  MentorTask,
  MentorTaskStatus,
  MentorTodayPlan,
  SaaSPlan,
  SubscriptionStatus
} from "@studybuddy/shared";

type MentorSignals = MentorTodayPlan["signals"];
type MentorSubscription = MentorTodayPlan["subscription"];
type MentorUser = UserDocument & { save: () => Promise<unknown> };

type SkillGapSnapshot = {
  overallScore: number;
  recommendations: {
    nextSkills: string[];
  };
} | null;

const PLAN_LIMITS: Record<SaaSPlan, MentorSubscription["limits"]> = {
  free: {
    aiMessagesPerMonth: 100,
    notes: 250,
    projects: 2
  },
  pro: {
    aiMessagesPerMonth: 2000,
    notes: 10000,
    projects: 50
  },
  team: {
    aiMessagesPerMonth: 10000,
    notes: 50000,
    projects: 500
  }
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function usageMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 48) || "task";
}

function task(date: string, data: Omit<MentorTask, "id" | "status">): MentorTask {
  return {
    ...data,
    id: `${date}-${data.type}-${slug(data.title)}`,
    status: "pending"
  };
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function roadmapProgress(roadmap: RoadmapDocument | null) {
  if (!roadmap || roadmap.milestones.length === 0) {
    return 0;
  }

  const completed = roadmap.milestones.filter((milestone) => milestone.status === "completed").length;
  return Math.round((completed / roadmap.milestones.length) * 100);
}

function activeMilestoneTitle(roadmap: RoadmapDocument | null) {
  return roadmap?.milestones.find((milestone) => milestone.status !== "completed")?.title;
}

function getPlan(user: MentorUser): SaaSPlan {
  const plan = user.subscription?.plan;
  return plan === "pro" || plan === "team" ? plan : "free";
}

function getSubscriptionStatus(user: MentorUser): SubscriptionStatus {
  const status = user.subscription?.status;
  if (status === "active" || status === "past_due" || status === "canceled") {
    return status;
  }
  return "trialing";
}

async function normalizeMonthlyUsage(user: MentorUser) {
  const month = usageMonthKey();

  if (user.usage?.usageMonth === month) {
    return;
  }

  user.usage = {
    mentorPlansGenerated: user.usage?.mentorPlansGenerated ?? 0,
    aiMessagesThisMonth: 0,
    usageMonth: month
  };
  await user.save();
}

function buildSubscription(user: MentorUser, notesTracked: number): MentorSubscription {
  const plan = getPlan(user);

  return {
    plan,
    status: getSubscriptionStatus(user),
    usage: {
      mentorPlansGenerated: user.usage?.mentorPlansGenerated ?? 0,
      aiMessagesThisMonth: user.usage?.aiMessagesThisMonth ?? 0,
      notesTracked
    },
    limits: PLAN_LIMITS[plan]
  };
}

async function loadSkillGap(userId: string): Promise<SkillGapSnapshot> {
  try {
    return await skillsService.analyzeSkillGap(userId);
  } catch {
    return null;
  }
}

async function loadSignals(userId: string, user: MentorUser): Promise<{
  signals: MentorSignals;
  skillGap: SkillGapSnapshot;
}> {
  const [recallStats, notesCount, roadmap, activeProject, latestInterview, skillGap] = await Promise.all([
    recallService.getStats(userId),
    NoteModel.countDocuments({ userId, deleted: { $ne: true } }),
    RoadmapModel.findOne({ userId }).sort({ createdAt: -1 }),
    ProjectModel.findOne({ userId, status: { $in: ["in_progress", "recommended"] } }).sort({ updatedAt: -1 }),
    InterviewModel.findOne({ userId }).sort({ updatedAt: -1 }),
    loadSkillGap(userId)
  ]);

  return {
    skillGap,
    signals: {
      targetRoles: user.targetRoles,
      totalNotes: notesCount,
      recallDue: recallStats.dueCount,
      averageMemoryStrength: recallStats.averageStrength,
      roadmapProgress: roadmapProgress(roadmap),
      activeMilestone: activeMilestoneTitle(roadmap),
      activeProject: activeProject?.project?.title,
      latestInterviewScore: latestInterview?.overallScore,
      weakTopics: recallStats.weakTopics.map((topic) => ({
        topic: topic.topic,
        averageStrength: topic.averageStrength,
        dueCount: topic.dueCount
      }))
    }
  };
}

function decideStage(user: MentorUser, signals: MentorSignals, skillGap: SkillGapSnapshot): MentorJourneyStage {
  if (!user.onboardingCompleted) {
    return "setup";
  }

  if (!skillGap) {
    return "diagnose";
  }

  if (signals.roadmapProgress === 0 && !signals.activeMilestone) {
    return "plan";
  }

  if (signals.recallDue > 0 || signals.averageMemoryStrength < 0.45) {
    return "recall";
  }

  if (signals.roadmapProgress >= 70) {
    return signals.latestInterviewScore && signals.latestInterviewScore >= 7 ? "job_search" : "interview";
  }

  if (signals.activeProject) {
    return "build";
  }

  return "learn";
}

function readinessScore(signals: MentorSignals, skillGap: SkillGapSnapshot) {
  const skillScore = skillGap?.overallScore ?? 20;
  const memoryScore = clampScore(signals.averageMemoryStrength * 100);
  const roadmapScore = signals.roadmapProgress;
  const interviewScore = signals.latestInterviewScore ? signals.latestInterviewScore * 10 : 30;

  return clampScore(skillScore * 0.35 + memoryScore * 0.25 + roadmapScore * 0.25 + interviewScore * 0.15);
}

function mentorMessage(stage: MentorJourneyStage, signals: MentorSignals) {
  if (stage === "setup") {
    return "Start by telling AI Dost your target role and current skills. The mentor gets sharper once it has your baseline.";
  }

  if (stage === "recall") {
    const topic = signals.weakTopics[0]?.topic;
    return topic
      ? `Today is a retention day. Review ${topic} first so new learning has something solid to attach to.`
      : "Today is a retention day. Clear your due recall before adding too much new material.";
  }

  if (stage === "build") {
    return "You are past passive learning. Move one project task forward and capture what you learn as notes.";
  }

  if (stage === "interview") {
    return "You are close enough to start interview reps. Practice explaining your projects and weak topics out loud.";
  }

  if (stage === "job_search") {
    return "Shift into proof mode: tune your resume, apply selectively, and keep recall active so interviews stay sharp.";
  }

  if (stage === "plan") {
    return "Build the roadmap before studying more. A clear path prevents scattered effort.";
  }

  return "Keep the loop tight today: learn one thing, write one note, test recall, then adjust.";
}

function nextUnlock(stage: MentorJourneyStage) {
  const unlocks: Record<MentorJourneyStage, string> = {
    setup: "Personalized roadmap",
    diagnose: "Skill-gap based plan",
    plan: "Daily guided execution",
    learn: "Project recommendations",
    recall: "Higher memory strength",
    build: "Interview readiness",
    interview: "Job-search mode",
    job_search: "Offer pipeline tracking"
  };

  return unlocks[stage];
}

function focusFor(stage: MentorJourneyStage, signals: MentorSignals, skillGap: SkillGapSnapshot) {
  if (stage === "setup") return "Complete mentor setup";
  if (stage === "diagnose") return "Run skill diagnosis";
  if (stage === "plan") return "Generate your learning roadmap";
  if (stage === "recall") return signals.weakTopics[0]?.topic ?? "Due recall";
  if (stage === "build") return signals.activeProject ?? "Portfolio project";
  if (stage === "interview") return "Interview readiness";
  if (stage === "job_search") return "Targeted job search";
  return skillGap?.recommendations.nextSkills[0] ?? signals.activeMilestone ?? "Focused learning";
}

function buildTasks(date: string, user: MentorUser, signals: MentorSignals, skillGap: SkillGapSnapshot, stage: MentorJourneyStage): MentorTask[] {
  const tasks: MentorTask[] = [];
  const weakTopic = signals.weakTopics[0];
  const nextSkill = skillGap?.recommendations.nextSkills[0];

  if (!user.onboardingCompleted) {
    tasks.push(task(date, {
      type: "onboarding",
      title: "Finish mentor onboarding",
      description: "Set your target role, current skills, and experience level.",
      reason: "AI Dost needs a baseline before it can guide your journey.",
      priority: "high",
      estimatedMinutes: 8,
      href: "/onboarding"
    }));
    return tasks;
  }

  if (!skillGap) {
    tasks.push(task(date, {
      type: "skill_gap",
      title: "Run skill gap diagnosis",
      description: "Compare your current skills with your target role.",
      reason: "The mentor uses this to choose the next skill instead of guessing.",
      priority: "high",
      estimatedMinutes: 5,
      href: "/skill-gap"
    }));
  }

  if (!signals.activeMilestone && signals.roadmapProgress === 0) {
    tasks.push(task(date, {
      type: "roadmap",
      title: "Generate your roadmap",
      description: "Create the first structured path from your target role and skill gaps.",
      reason: "A daily mentor needs a north star to sequence your work.",
      priority: "high",
      estimatedMinutes: 6,
      href: "/roadmap"
    }));
  }

  if (signals.recallDue > 0) {
    tasks.push(task(date, {
      type: "recall",
      title: `Clear ${signals.recallDue} due recall ${signals.recallDue === 1 ? "item" : "items"}`,
      description: "Answer from memory before reading your notes.",
      reason: "Retention is the core signal for whether learning is actually sticking.",
      priority: "high",
      estimatedMinutes: Math.min(30, Math.max(8, signals.recallDue * 4)),
      href: "/recall"
    }));
  }

  if (weakTopic && weakTopic.averageStrength < 0.55) {
    tasks.push(task(date, {
      type: "learn",
      title: `Patch weak topic: ${weakTopic.topic}`,
      description: "Review your note, rewrite the explanation, then test yourself again.",
      reason: `${weakTopic.topic} is currently at ${Math.round(weakTopic.averageStrength * 100)}% strength.`,
      priority: signals.recallDue > 0 ? "medium" : "high",
      estimatedMinutes: 20,
      href: "/notes"
    }));
  } else if (nextSkill) {
    tasks.push(task(date, {
      type: "learn",
      title: `Study next skill: ${nextSkill}`,
      description: "Spend one focused block learning the next high-impact skill.",
      reason: "This is one of the largest gaps for your target role.",
      priority: "high",
      estimatedMinutes: 35,
      href: "/roadmap"
    }));
  }

  if (signals.activeMilestone) {
    tasks.push(task(date, {
      type: "roadmap",
      title: `Advance milestone: ${signals.activeMilestone}`,
      description: "Make concrete progress and mark the milestone when evidence exists.",
      reason: "Roadmap progress converts learning into a visible journey.",
      priority: stage === "recall" ? "medium" : "high",
      estimatedMinutes: 30,
      href: "/roadmap"
    }));
  }

  tasks.push(task(date, {
    type: "note",
    title: "Capture one mentor-grade note",
    description: "Write a short explanation, example, and one recall question.",
    reason: "The AI mentor becomes personal only when your memory base grows.",
    priority: signals.totalNotes < 5 ? "high" : "medium",
    estimatedMinutes: 10,
    href: "/notes"
  }));

  if (!signals.activeProject && signals.roadmapProgress >= 15) {
    tasks.push(task(date, {
      type: "project",
      title: "Choose a portfolio project",
      description: "Pick a project that proves the skills from your current roadmap.",
      reason: "Projects turn knowledge into interview evidence.",
      priority: "medium",
      estimatedMinutes: 12,
      href: "/projects"
    }));
  } else if (signals.activeProject) {
    tasks.push(task(date, {
      type: "project",
      title: `Move project forward: ${signals.activeProject}`,
      description: "Ship one small, demonstrable improvement today.",
      reason: "A mentor should push you toward proof, not only study.",
      priority: stage === "build" ? "high" : "medium",
      estimatedMinutes: 45,
      href: "/projects"
    }));
  }

  if (signals.roadmapProgress >= 55 || stage === "interview") {
    tasks.push(task(date, {
      type: "interview",
      title: "Practice one interview round",
      description: "Answer one technical or project question and review the feedback.",
      reason: "Interview skill improves through reps, not only knowledge.",
      priority: stage === "interview" ? "high" : "medium",
      estimatedMinutes: 20,
      href: "/interview"
    }));
  }

  return tasks
    .sort((left, right) => {
      const weight = { high: 0, medium: 1, low: 2 };
      return weight[left.priority] - weight[right.priority];
    })
    .slice(0, 5);
}

function applyPreviousStatuses(nextTasks: MentorTask[], previous?: MentorDailyPlanDocument | null) {
  if (!previous) {
    return nextTasks;
  }

  const previousById = new Map(previous.tasks.map((item) => [item.id, item]));

  return nextTasks.map((item) => {
    const old = previousById.get(item.id);
    return {
      ...item,
      status: (old?.status as MentorTaskStatus | undefined) ?? item.status
    };
  });
}

function toTodayPlan(doc: MentorDailyPlanDocument): MentorTodayPlan {
  return {
    id: String(doc._id),
    date: doc.date,
    focus: doc.focus,
    mentorMessage: doc.mentorMessage,
    journeyStage: doc.journeyStage as MentorJourneyStage,
    readinessScore: doc.readinessScore,
    nextUnlock: doc.nextUnlock,
    tasks: doc.tasks.map((item) => ({
      id: item.id,
      type: item.type as MentorTask["type"],
      title: item.title,
      description: item.description,
      reason: item.reason,
      priority: item.priority as MentorTask["priority"],
      estimatedMinutes: item.estimatedMinutes,
      href: item.href,
      status: item.status as MentorTaskStatus
    })),
    signals: doc.signals as MentorSignals,
    subscription: doc.subscription as MentorSubscription
  };
}

async function getTodayPlan(userId: string): Promise<MentorTodayPlan> {
  const user = await UserModel.findById(userId) as MentorUser | null;
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  await normalizeMonthlyUsage(user);

  const date = todayKey();
  const previous = await MentorDailyPlanModel.findOne({ userId, date });
  const { signals, skillGap } = await loadSignals(userId, user);
  const stage = decideStage(user, signals, skillGap);
  const nextTasks = applyPreviousStatuses(buildTasks(date, user, signals, skillGap, stage), previous);
  const subscription = buildSubscription(user, signals.totalNotes);

  const payload = {
    userId,
    date,
    focus: focusFor(stage, signals, skillGap),
    mentorMessage: mentorMessage(stage, signals),
    journeyStage: stage,
    readinessScore: readinessScore(signals, skillGap),
    nextUnlock: nextUnlock(stage),
    tasks: nextTasks,
    signals,
    subscription
  };

  const plan = previous
    ? await MentorDailyPlanModel.findOneAndUpdate({ userId, date }, payload, { new: true, runValidators: true })
    : await MentorDailyPlanModel.create(payload);

  if (!previous) {
    user.usage = {
      mentorPlansGenerated: (user.usage?.mentorPlansGenerated ?? 0) + 1,
      aiMessagesThisMonth: user.usage?.aiMessagesThisMonth ?? 0,
      usageMonth: usageMonthKey()
    };
    await user.save();
  }

  return toTodayPlan(plan as MentorDailyPlanDocument);
}

async function updateTaskStatus(userId: string, taskId: string, status: MentorTaskStatus): Promise<MentorTodayPlan> {
  const date = todayKey();
  const plan = await MentorDailyPlanModel.findOne({ userId, date });

  if (!plan) {
    return getTodayPlan(userId);
  }

  const taskItem = plan.tasks.find((item) => item.id === taskId);
  if (!taskItem) {
    throw new ApiError(404, "Mentor task not found.");
  }

  taskItem.status = status;
  taskItem.completedAt = status === "completed" ? new Date() : null;
  await plan.save();

  return toTodayPlan(plan);
}

export const mentorService = {
  getTodayPlan,
  updateTaskStatus
};
