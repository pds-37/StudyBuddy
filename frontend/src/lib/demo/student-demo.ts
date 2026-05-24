import type { AuthUser } from "../../features/auth/types";
import type { MentorTodayPlan } from "@studybuddy/shared";
import type { BehaviorProfile } from "../api/behavior";
import type { NextBestAction } from "../api/recommendations";

export const DEMO_SESSION_KEY = "studybuddy_demo_mode";

export const demoUser: AuthUser = {
  id: "demo-student",
  name: "Aarav Sharma",
  email: "demo@student.studybuddy.ai",
  targetRoles: ["Frontend Engineer", "AI Frontend Engineer"],
  currentSkills: ["React", "JavaScript", "DSA Basics", "REST APIs"],
  experienceLevel: "intermediate",
  onboardingCompleted: true,
  subscription: {
    plan: "pro",
    status: "trialing",
    currentPeriodEnd: null
  },
  usage: {
    mentorPlansGenerated: 18,
    aiMessagesThisMonth: 142,
    usageMonth: new Date().toISOString().slice(0, 7)
  },
  behaviorProfile: {
    consistencyScore: 76,
    skipRate: 18,
    lastActivityAt: new Date().toISOString()
  },
  psychologicalProfile: {
    identityNarrative: "Placement-ready frontend engineer",
    motivationState: "steady",
    confidence: {
      skill: 68,
      execution: 61,
      interview: 54,
      learning: 72
    }
  }
};

export const demoTodayPlan: MentorTodayPlan = {
  id: "demo-plan",
  date: new Date().toISOString().slice(0, 10),
  focus: "7-day placement sprint",
  mentorMessage:
    "Start with one recall block, then ship a small project proof. Your resume gap is mainly project evidence, not more theory.",
  journeyStage: "build",
  readinessScore: 71,
  nextUnlock: "Mock interview readiness",
  tasks: [
    {
      id: "demo-recall-js-closures",
      type: "recall",
      title: "Revise JavaScript closures and async flow",
      description: "Answer 6 quick prompts from memory before opening notes.",
      reason: "These are due today and show up often in frontend interviews.",
      priority: "high",
      estimatedMinutes: 18,
      href: "/recall",
      status: "pending",
      stuckCount: 0
    },
    {
      id: "demo-project-proof",
      type: "project",
      title: "Add one measurable feature to the placement dashboard",
      description: "Ship a visible before/after improvement and record the impact for your resume.",
      reason: "Project proof raises resume and interview confidence faster than passive study.",
      priority: "high",
      estimatedMinutes: 45,
      href: "/projects",
      status: "in_progress",
      stuckCount: 1,
      mentorNote: "Break it into UI state, API state, and proof screenshot."
    },
    {
      id: "demo-roadmap-system-design",
      type: "roadmap",
      title: "Complete roadmap task: API caching basics",
      description: "Study cache invalidation, stale data, and optimistic UI for one focused block.",
      reason: "This closes the biggest gap for your AI Frontend Engineer target.",
      priority: "medium",
      estimatedMinutes: 30,
      href: "/roadmap",
      status: "pending",
      stuckCount: 0
    },
    {
      id: "demo-resume-bullet",
      type: "reflection",
      title: "Rewrite one resume bullet with product impact",
      description: "Turn a feature into an outcome: action, metric, and user benefit.",
      reason: "Your resume needs sharper proof for internship shortlisting.",
      priority: "medium",
      estimatedMinutes: 12,
      href: "/resume",
      status: "pending",
      stuckCount: 0
    }
  ],
  signals: {
    targetRoles: ["Frontend Engineer", "AI Frontend Engineer"],
    totalNotes: 42,
    recallDue: 6,
    averageMemoryStrength: 0.64,
    roadmapProgress: 58,
    activeMilestone: "Frontend systems and API performance",
    activeProject: "AI Placement Command Center",
    latestInterviewScore: 6.8,
    weakTopics: [
      { topic: "JavaScript closures", averageStrength: 0.42, dueCount: 3 },
      { topic: "React rendering performance", averageStrength: 0.51, dueCount: 2 },
      { topic: "API caching", averageStrength: 0.48, dueCount: 1 }
    ]
  },
  subscription: {
    plan: "pro",
    status: "trialing",
    usage: {
      mentorPlansGenerated: 18,
      aiMessagesThisMonth: 142,
      notesTracked: 42
    },
    limits: {
      aiMessagesPerMonth: 2000,
      notes: 10000,
      projects: 50
    }
  }
};

export const demoNextBestAction: NextBestAction = {
  action: "revision",
  reason:
    "Veda is prioritizing recall first because 6 items are due, memory strength is at 64%, and today's project task depends on closures and async flow.",
  data: {
    title: "Revise JavaScript closures and async flow"
  }
};

export const demoBehaviorProfile: BehaviorProfile = {
  consistencyScore: 76,
  skipRate: 18,
  preferredStudyTime: "evening",
  avgSessionTime: 42
};
