import { InterviewModel } from "../interview/interview.model.js";
import { NoteModel } from "../notes/note.model.js";
import { ProjectModel } from "../projects/project.model.js";
import { RoadmapModel, type RoadmapDocument } from "../roadmaps/roadmap.model.js";
import { skillsService } from "../skills/skills.service.js";
import { UserModel, type UserDocument } from "../users/user.model.js";
import { recallService } from "../recall/recall.service.js";
import { ApiError } from "../../utils/api-error.js";
import { NudgingEngine } from "../../engines/nudging.engine.js";
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

type AdoptStrategyInput = {
  targetRole?: string;
  recoveryPlan: string;
  nextSkills: string[];
  gaps: Array<{
    skill: string;
    gapScore?: number;
    userScore?: number;
  }>;
};

type MentorTaskFeedbackInput = {
  type: "start" | "stuck" | "confidence";
  confidenceScore?: number;
  note?: string;
};

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
  if (!roadmap || !roadmap.phases || roadmap.phases.length === 0) {
    return 0;
  }

  let totalTasks = 0;
  let completedTasks = 0;

  for (const phase of roadmap.phases as any[]) {
    for (const mission of phase.missions as any[]) {
      const tasks = mission.tasks || [];
      totalTasks += tasks.length;
      completedTasks += tasks.filter((t: any) => t.status === "completed").length;
    }
  }

  if (totalTasks === 0) return 0;
  return Math.round((completedTasks / totalTasks) * 100);
}

function activeMilestoneTitle(roadmap: RoadmapDocument | null) {
  if (!roadmap) return undefined;
  for (const phase of roadmap.phases as any[]) {
    for (const mission of phase.missions as any[]) {
      if (mission.status === "in_progress" || mission.status === "not_started") {
        return mission.title;
      }
    }
  }
  return undefined;
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
    return "Hey! Start by telling me your target role and current skills. Once I have your baseline, we can crush your goals together.";
  }

  if (stage === "recall") {
    const topic = signals.weakTopics[0]?.topic;
    return topic
      ? `Today is a retention day, my friend. Let's review ${topic} first so the new stuff actually sticks in your brain.`
      : "Today is a retention day! Let's clear out those due recall items before piling on new material, okay?";
  }

  if (stage === "build") {
    return "You've moved past passive learning! Time to get your hands dirty. Move one project task forward and jot down what you learn.";
  }

  if (stage === "interview") {
    return "You're getting so close! Let's start doing some interview reps. Try explaining your projects and weak topics out loud—you got this.";
  }

  if (stage === "job_search") {
    return "Alright, shift into proof mode! Let's tune that resume, apply selectively, and keep your memory sharp for those upcoming interviews.";
  }

  if (stage === "plan") {
    return "Let's build a solid roadmap before you just study randomly. A clear path means no wasted effort, my friend.";
  }

  return "Let's keep things focused today: learn one concept, write one solid note, test your recall, and we'll adjust from there.";
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
      description: "Let's set your target role, current skills, and experience level.",
      reason: "I need a baseline before I can guide your journey properly, my friend.",
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
      description: "Let's compare your current skills with your target role.",
      reason: "I use this to pick the absolute best next skill for you instead of just guessing.",
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
      reason: "Every great journey needs a north star to map things out.",
      priority: "high",
      estimatedMinutes: 6,
      href: "/roadmap"
    }));
  }

  if (signals.recallDue > 0) {
    tasks.push(task(date, {
      type: "recall",
      title: `Clear ${signals.recallDue} due recall ${signals.recallDue === 1 ? "item" : "items"}`,
      description: "Try to answer from memory before you peek at your notes.",
      reason: "Retention is everything. This shows me if what we're learning is actually sticking.",
      priority: "high",
      estimatedMinutes: Math.min(30, Math.max(8, signals.recallDue * 4)),
      href: "/recall"
    }));
  }

  if (weakTopic && weakTopic.averageStrength < 0.55) {
    tasks.push(task(date, {
      type: "learn",
      title: `Patch weak topic: ${weakTopic.topic}`,
      description: "Review your note, rewrite the explanation in your own words, and test yourself again.",
      reason: `Looks like ${weakTopic.topic} is currently at ${Math.round(weakTopic.averageStrength * 100)}% strength. Let's fix that!`,
      priority: signals.recallDue > 0 ? "medium" : "high",
      estimatedMinutes: 20,
      href: "/notes"
    }));
  } else if (nextSkill) {
    tasks.push(task(date, {
      type: "learn",
      title: `Study next skill: ${nextSkill}`,
      description: "Spend one solid, focused block learning this next high-impact skill.",
      reason: "This is one of the biggest missing pieces for your target role. Nailing this will be huge.",
      priority: "high",
      estimatedMinutes: 35,
      href: "/roadmap"
    }));
  }

  if (signals.activeMilestone) {
    tasks.push(task(date, {
      type: "roadmap",
      title: `Advance milestone: ${signals.activeMilestone}`,
      description: "Make concrete progress today and mark the milestone when you have evidence.",
      reason: "Roadmap progress is how we turn learning into a visible, winning journey.",
      priority: stage === "recall" ? "medium" : "high",
      estimatedMinutes: 30,
      href: "/roadmap"
    }));
  }

  tasks.push(task(date, {
    type: "note",
    title: "Capture one solid note",
    description: "Write a short explanation, an example, and one recall question.",
    reason: "I can be way more helpful once your personal memory base starts growing.",
    priority: signals.totalNotes < 5 ? "high" : "medium",
    estimatedMinutes: 10,
    href: "/notes"
  }));

  if (!signals.activeProject && signals.roadmapProgress >= 15) {
    tasks.push(task(date, {
      type: "project",
      title: "Choose a portfolio project",
      description: "Pick a cool project that actually proves the skills from your roadmap.",
      reason: "Projects are how we turn knowledge into hard interview evidence.",
      priority: "medium",
      estimatedMinutes: 12,
      href: "/projects"
    }));
  } else if (signals.activeProject) {
    tasks.push(task(date, {
      type: "project",
      title: `Move project forward: ${signals.activeProject}`,
      description: "Ship one small, demonstrable improvement to your project today.",
      reason: "I want to push you toward shipping proof, not just studying theory.",
      priority: stage === "build" ? "high" : "medium",
      estimatedMinutes: 45,
      href: "/projects"
    }));
  }

  if (signals.roadmapProgress >= 55 || stage === "interview") {
    tasks.push(task(date, {
      type: "interview",
      title: "Practice one interview round",
      description: "Answer one technical or project question and we'll review the feedback together.",
      reason: "Interview skills improve through actual reps, not just reading.",
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

function strategySkills(input: AdoptStrategyInput) {
  const skills = [
    ...input.nextSkills,
    ...input.gaps
      .slice()
      .sort((left, right) => (right.gapScore ?? 0) - (left.gapScore ?? 0))
      .map((gap) => gap.skill)
  ];

  return Array.from(new Set(skills.map((skill) => skill.trim()).filter(Boolean))).slice(0, 4);
}

function isAdoptedStrategyTask(item: { id: string; title: string }) {
  return item.id.includes("adopted-strategy") || item.title.startsWith("Recovery focus:");
}

function buildAdoptedStrategyTasks(date: string, input: AdoptStrategyInput): MentorTask[] {
  const skills = strategySkills(input);
  const primarySkill = skills[0] ?? "your highest-impact skill gap";
  const roleSuffix = input.targetRole ? ` for ${input.targetRole}` : "";

  const tasks: MentorTask[] = [
    task(date, {
      type: "learn",
      title: "Adopted strategy: recovery sprint",
      description: input.recoveryPlan,
      reason: `Veda is prioritizing the fastest recovery path${roleSuffix}.`,
      priority: "high",
      estimatedMinutes: 15,
      href: "/dashboard"
    }),
    task(date, {
      type: "roadmap",
      title: `Recovery focus: ${primarySkill}`,
      description: "Open your roadmap and move the first task tied to this skill into active execution.",
      reason: "A strategy only works once it changes the next concrete task.",
      priority: "high",
      estimatedMinutes: 25,
      href: "/roadmap"
    })
  ];

  for (const skill of skills.slice(0, 3)) {
    tasks.push(
      task(date, {
        type: "learn",
        title: `Recovery focus: ${skill}`,
        description: "Study the concept, create one note, and write one recall prompt from memory.",
        reason: "This skill is part of the gap Veda flagged as blocking readiness.",
        priority: skill === primarySkill ? "high" : "medium",
        estimatedMinutes: skill === primarySkill ? 35 : 25,
        href: "/notes"
      })
    );
  }

  tasks.push(
    task(date, {
      type: "reflection",
      title: "Recovery focus: mentor check-in",
      description: "Tell Veda what felt easy, what felt blocked, and what should be adjusted tomorrow.",
      reason: "The mentor gets sharper when it sees friction, confidence, and follow-through.",
      priority: "medium",
      estimatedMinutes: 8,
      href: "/copilot"
    })
  );

  return tasks.map((item) => ({
    ...item,
    id: `${date}-adopted-strategy-${item.type}-${slug(item.title)}`
  }));
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
      status: (old?.status as MentorTaskStatus | undefined) ?? item.status,
      startedAt: old?.startedAt ? old.startedAt.toISOString() : null,
      completedAt: old?.completedAt ? old.completedAt.toISOString() : null,
      confidenceScore: old?.confidenceScore ?? null,
      stuckCount: old?.stuckCount ?? 0,
      lastStuckAt: old?.lastStuckAt ? old.lastStuckAt.toISOString() : null,
      mentorNote: old?.mentorNote ?? null
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
      status: item.status as MentorTaskStatus,
      startedAt: item.startedAt?.toISOString() ?? null,
      completedAt: item.completedAt?.toISOString() ?? null,
      confidenceScore: item.confidenceScore ?? null,
      stuckCount: item.stuckCount ?? 0,
      lastStuckAt: item.lastStuckAt?.toISOString() ?? null,
      mentorNote: item.mentorNote ?? null
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
  
  // Trigger Nudging Engine checks
  void NudgingEngine.checkTaskHoarding(userId);
  void NudgingEngine.checkInactivity(userId);

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

async function adoptStrategy(userId: string, input: AdoptStrategyInput): Promise<MentorTodayPlan> {
  await getTodayPlan(userId);

  const date = todayKey();
  const plan = await MentorDailyPlanModel.findOne({ userId, date });

  if (!plan) {
    throw new ApiError(404, "Mentor plan not found.");
  }

  const adoptedTasks = buildAdoptedStrategyTasks(date, input);
  const existingTasks = plan.tasks.filter((item) => !isAdoptedStrategyTask(item));
  const primarySkill = strategySkills(input)[0];

  plan.focus = primarySkill ? `Recovery sprint: ${primarySkill}` : "Recovery sprint";
  plan.mentorMessage = `Got it! Strategy adopted. ${input.recoveryPlan} I'll keep this visible in today's plan, and we'll see how you do so we can tune the next steps. You got this!`;
  plan.journeyStage = "learn";
  plan.nextUnlock = "Recovery momentum";
  plan.tasks = [...adoptedTasks, ...existingTasks].slice(0, 7) as typeof plan.tasks;

  await plan.save();

  return toTodayPlan(plan);
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
  taskItem.startedAt = status === "in_progress" && !taskItem.startedAt ? new Date() : taskItem.startedAt;
  taskItem.completedAt = status === "completed" ? new Date() : null;
  await plan.save();

  return toTodayPlan(plan);
}

async function recordTaskFeedback(userId: string, taskId: string, input: MentorTaskFeedbackInput): Promise<MentorTodayPlan> {
  const date = todayKey();
  const plan = await MentorDailyPlanModel.findOne({ userId, date });

  if (!plan) {
    return getTodayPlan(userId);
  }

  const taskItem = plan.tasks.find((item) => item.id === taskId);
  if (!taskItem) {
    throw new ApiError(404, "Mentor task not found.");
  }

  if (input.type === "start") {
    taskItem.status = taskItem.status === "pending" ? "in_progress" : taskItem.status;
    taskItem.startedAt = taskItem.startedAt ?? new Date();
    taskItem.mentorNote = "I'm keeping an eye on this—let's get it done!";
  }

  if (input.type === "confidence") {
    taskItem.confidenceScore = input.confidenceScore ?? taskItem.confidenceScore;
    taskItem.mentorNote =
      input.confidenceScore && input.confidenceScore <= 2
        ? "Hey, it's totally okay to feel shaky here. We'll take it step by step tomorrow with some review."
        : input.confidenceScore === 3
          ? "Confidence is building! Let's keep this in our review loop until you completely master it."
          : "Awesome confidence! You're ready to put this into practice in projects and interviews. Proud of you!";
  }

  if (input.type === "stuck") {
    taskItem.status = "in_progress";
    taskItem.startedAt = taskItem.startedAt ?? new Date();
    taskItem.stuckCount = (taskItem.stuckCount ?? 0) + 1;
    taskItem.lastStuckAt = new Date();
    taskItem.mentorNote = input.note?.trim()
      ? `Got it: ${input.note.trim()}`
      : "I see you're stuck. Don't stress, I'll help break this down into smaller, easier steps.";

    const unblockTask = task(date, {
      type: "reflection",
      title: `Unblock: ${taskItem.title}`,
      description: "Just write out what blocked you. I'm here to give you a hint so we can tackle the next tiny step.",
      reason: "Getting stuck is just part of the process, man! I'll help smooth out the friction so we can keep moving.",
      priority: "high",
      estimatedMinutes: 10,
      href: "/copilot"
    });

    unblockTask.id = `${date}-unblock-${slug(taskItem.id)}`;
    const alreadyExists = plan.tasks.some((item) => item.id === unblockTask.id);
    if (!alreadyExists) {
      plan.tasks.unshift(unblockTask as any);
    }
  }

  await plan.save();

  return toTodayPlan(plan);
}

export const mentorService = {
  getTodayPlan,
  adoptStrategy,
  updateTaskStatus,
  recordTaskFeedback
};
