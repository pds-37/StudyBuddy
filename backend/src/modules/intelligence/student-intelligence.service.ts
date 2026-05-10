import { ApplicationModel } from "../jobs/job.model.js";
import { ConceptNodeModel } from "../knowledge/concept.model.js";
import { NoteModel } from "../notes/note.model.js";
import { ProjectModel } from "../projects/project.model.js";
import { ResumeModel } from "../resume/resume.model.js";
import { RoadmapModel } from "../roadmaps/roadmap.model.js";
import { UserModel } from "../users/user.model.js";
import { DecayEngine } from "../../engines/decay.engine.js";
import {
  StudentIntelligenceEventModel,
  StudentIntelligenceProfileModel,
  type StudentIntelligenceEventType
} from "./student-intelligence.model.js";

type IntelligenceEventInput = {
  type: StudentIntelligenceEventType;
  source: "notes" | "recall" | "roadmap" | "projects" | "resume" | "jobs" | "mentor" | "skills" | "behavior" | "system";
  entityId?: string;
  payload?: Record<string, unknown>;
};

function clampScore(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function roadmapCompletion(roadmap: any) {
  const tasks = (roadmap.phases || []).flatMap((phase: any) =>
    (phase.missions || []).flatMap((mission: any) => mission.tasks || [])
  );
  if (tasks.length === 0) return roadmap.readinessScore ?? 0;
  const completed = tasks.filter((task: any) => task.status === "completed").length;
  return (completed / tasks.length) * 100;
}

function mapByConceptScore(concepts: any[]) {
  return concepts.reduce<Record<string, number>>((map, concept) => {
    const executionBonus = Math.min(15, (concept.executionEvidence ?? 0) * 5);
    map[concept.name] = clampScore((concept.retentionScore ?? 0) * 0.75 + executionBonus);
    return map;
  }, {});
}

function inferAdaptiveDifficulty(cognitiveLoad: number, burnoutRisk: number, retention: number, velocity: number) {
  if (burnoutRisk >= 70 || cognitiveLoad >= 80) return "recovery";
  if (retention < 35) return "easy";
  if (velocity >= 70 && cognitiveLoad < 55) return "stretch";
  return "balanced";
}

function buildDailyPriorities(args: {
  weakConcepts: string[];
  roadmap: any | null;
  burnoutRisk: number;
  applicationsCount: number;
  resumesCount: number;
}) {
  const priorities: Array<{ type: string; title: string; reason: string; weight: number }> = [];

  for (const concept of args.weakConcepts.slice(0, 3)) {
    priorities.push({
      type: "recall",
      title: `Revise ${concept}`,
      reason: "Retention is currently weak, so this protects long-term mastery.",
      weight: 95
    });
  }

  const nextTask = args.roadmap?.phases
    ?.flatMap((phase: any) => phase.missions || [])
    ?.flatMap((mission: any) => mission.tasks || [])
    ?.find((task: any) => task.status !== "completed");

  if (nextTask) {
    priorities.push({
      type: "roadmap",
      title: nextTask.title,
      reason: "This is the next unlocked roadmap action.",
      weight: 80
    });
  }

  if (args.applicationsCount > args.resumesCount) {
    priorities.push({
      type: "resume",
      title: "Tighten the resume for the latest target role",
      reason: "Job activity is ahead of resume tailoring.",
      weight: 70
    });
  }

  if (args.burnoutRisk >= 60) {
    priorities.unshift({
      type: "recovery",
      title: "Do one small win and stop",
      reason: "Burnout risk is elevated, so the platform should lower load today.",
      weight: 100
    });
  }

  return priorities.sort((a, b) => b.weight - a.weight).slice(0, 5);
}

async function rebuildProfile(userId: string) {
  await DecayEngine.updateConceptRetention(userId).catch(() => {});

  const [user, notes, concepts, roadmaps, projects, resumes, applications, recentEvents] = await Promise.all([
    UserModel.findById(userId).catch(() => null),
    NoteModel.find({ userId, deleted: { $ne: true } }),
    ConceptNodeModel.find({ userId }),
    RoadmapModel.find({ userId }).sort({ updatedAt: -1 }),
    ProjectModel.find({ userId }),
    ResumeModel.find({ userId }).sort({ createdAt: -1 }),
    ApplicationModel.find({ userId }).sort({ updatedAt: -1 }),
    StudentIntelligenceEventModel.find({ userId }).sort({ createdAt: -1 }).limit(50)
  ]);

  const now = new Date();
  const activeRoadmaps = roadmaps.filter((roadmap: any) => roadmap.status === "active");
  const activeRoadmap = activeRoadmaps[0] ?? roadmaps[0] ?? null;
  const retentionValues = notes.map((note) => DecayEngine.calculateRetention(note.lastReviewed, note.strength ?? 0.25));
  const memoryRetention = clampScore(average(retentionValues));
  const recallHealth = clampScore(average(notes.map((note) => (note.strength ?? 0) * 100)));
  const roadmapProgress = clampScore(average(activeRoadmaps.map(roadmapCompletion)));

  const completedProjects = projects.filter((project: any) => project.status === "completed").length;
  const inProgressProjects = projects.filter((project: any) => project.status === "in_progress").length;
  const projectDepth = clampScore(completedProjects * 28 + inProgressProjects * 12 + average(projects.map((p: any) => p.matchScore ?? 0)) * 0.25);
  const executionStrength = projectDepth >= 70 ? "advanced" : projectDepth >= 35 ? "medium" : "beginner";

  const interviewReadiness = clampScore(
    average([
      memoryRetention,
      average(concepts.filter((concept) => ["high", "critical"].includes(concept.interviewFrequency)).map((concept) => concept.retentionScore ?? 0)),
      user?.careerProfile?.readiness?.interview ?? 0
    ])
  );

  const careerReadinessValues = user?.careerProfile?.readiness ? Object.values(user.careerProfile.readiness) : [];
  const jobReadiness = clampScore(average([...careerReadinessValues, roadmapProgress, projectDepth, interviewReadiness]));
  const opportunityAlignment = clampScore(average(applications.map((application) => application.matchScore ?? 0)));

  const recentWeekEvents = recentEvents.filter((event) => event.createdAt.getTime() >= now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const learningVelocity = clampScore(
    recentWeekEvents.filter((event) =>
      ["NOTE_CREATED", "RECALL_PASSED", "ROADMAP_TASK_COMPLETED", "PROJECT_COMPLETED", "RESUME_UPDATED"].includes(event.type)
    ).length * 8
  );

  const weakConcepts = concepts
    .filter((concept) => concept.retentionState === "critical" || concept.retentionState === "weakening")
    .sort((a, b) => (a.retentionScore ?? 0) - (b.retentionScore ?? 0))
    .slice(0, 12)
    .map((concept) => concept.name);

  const strongConcepts = concepts
    .filter((concept) => concept.retentionState === "strong" || concept.retentionState === "stable")
    .sort((a, b) => (b.retentionScore ?? 0) - (a.retentionScore ?? 0))
    .slice(0, 12)
    .map((concept) => concept.name);

  const burnoutRisk = clampScore(user?.behaviorProfile?.burnoutRisk ?? (recentEvents.filter((event) => event.type === "RECALL_FAILED").length * 4));
  const cognitiveLoad = clampScore((user?.behaviorProfile?.cognitiveLoad ?? 0) + activeRoadmaps.length * 8 + weakConcepts.length * 2);
  const confidenceLevel = clampScore(average(Object.values(user?.psychologicalProfile?.confidence ?? { skill: 50, execution: 50, interview: 50, learning: 50 })));
  const emotionalState = burnoutRisk >= 75
    ? "burned_out"
    : (user?.psychologicalProfile?.motivationState ?? (confidenceLevel < 35 ? "discouraged" : "steady"));

  const skillConfidenceMap = mapByConceptScore(concepts);
  for (const skill of user?.currentSkills ?? []) {
    skillConfidenceMap[skill] = Math.max(skillConfidenceMap[skill] ?? 0, 55);
  }

  const highLeverageSkills = concepts
    .map((concept) => ({
      name: concept.name,
      score: clampScore((concept.interviewFrequency === "critical" ? 30 : concept.interviewFrequency === "high" ? 20 : 10) + (100 - (concept.retentionScore ?? 0)) + concept.noteIds.length * 3)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  const dailyPriorities = buildDailyPriorities({
    weakConcepts,
    roadmap: activeRoadmap,
    burnoutRisk,
    applicationsCount: applications.length,
    resumesCount: resumes.length
  });

  const profile = await StudentIntelligenceProfileModel.findOneAndUpdate(
    { userId },
    {
      $set: {
        userId,
        targetRoles: user?.targetRoles ?? [],
        activeTracks: activeRoadmaps.map((roadmap: any) => roadmap.targetRole),
        roadmapState: {
          activeCount: activeRoadmaps.length,
          currentRoadmapId: activeRoadmap?._id?.toString(),
          currentPhaseId: activeRoadmap?.currentPhaseId,
          nextMilestone: activeRoadmap?.nextMilestone,
          recalibrationNeeded: burnoutRisk >= 70 || (user?.behaviorProfile?.skipRate ?? 0) > 0.35
        },
        roadmapProgress,
        skillConfidenceMap,
        skillGapMap: Object.fromEntries(
          Object.entries(skillConfidenceMap)
            .filter(([, score]) => score < 55)
            .map(([skill, score]) => [skill, clampScore(100 - Number(score))])
        ),
        recallHealth,
        memoryRetention,
        knowledgeGraph: {
          nodes: concepts.map((concept) => ({
            id: concept._id.toString(),
            label: concept.name,
            type: "concept",
            retentionState: concept.retentionState,
            retentionScore: concept.retentionScore ?? 0,
            noteCount: concept.noteIds.length
          })),
          edges: concepts.flatMap((concept) =>
            concept.relatedConceptIds.map((relatedId) => ({
              source: concept._id.toString(),
              target: relatedId,
              relationship: "related"
            }))
          ),
          highLeverageSkills
        },
        projectDepth,
        executionStrength,
        interviewReadiness,
        resumeState: {
          versions: resumes.length,
          latestTargetRole: (resumes[0] as any)?.targetRole,
          latestVersionId: resumes[0]?._id?.toString()
        },
        ATSReadiness: clampScore(average(resumes.map((resume: any) => resume.result?.atsScore ?? resume.result?.score ?? 0))),
        consistencyScore: clampScore(user?.behaviorProfile?.consistencyScore ?? 0),
        learningVelocity,
        cognitiveLoad,
        burnoutRisk,
        emotionalState,
        confidenceLevel,
        jobReadiness,
        opportunityAlignment,
        preferredLearningStyle: user?.preferences?.learningStyle ?? "adaptive",
        weakConcepts,
        strongConcepts,
        behavioralPatterns: {
          skipRate: user?.behaviorProfile?.skipRate ?? 0,
          preferredStudyTime: user?.behaviorProfile?.preferredStudyTime ?? "evening",
          avgSessionTime: user?.behaviorProfile?.avgSessionTime ?? 0,
          recentEvents: recentEvents.slice(0, 12).map((event) => ({ type: event.type, source: event.source, at: event.createdAt }))
        },
        adaptiveDifficulty: inferAdaptiveDifficulty(cognitiveLoad, burnoutRisk, memoryRetention, learningVelocity),
        dailyIntelligence: {
          priorities: dailyPriorities,
          mentorTone: burnoutRisk >= 60 ? "calm_supportive" : confidenceLevel < 40 ? "confidence_rebuilding" : "execution_focused"
        },
        systemMemory: {
          struggles: weakConcepts.slice(0, 6),
          preferences: [user?.preferences?.learningStyle, user?.behaviorProfile?.preferredStudyTime].filter(Boolean),
          confidenceShifts: recentEvents
            .filter((event) => ["RECALL_FAILED", "RECALL_PASSED", "PROJECT_COMPLETED", "INTERVIEW_FAILED", "INTERVIEW_PASSED"].includes(event.type))
            .slice(0, 10)
            .map((event) => ({ type: event.type, at: event.createdAt, payload: event.payload }))
        },
        lastEventAt: recentEvents[0]?.createdAt ?? null,
        lastRecalculatedAt: now
      }
    },
    { upsert: true, new: true }
  );

  return profile.toObject();
}

async function emitEvent(userId: string, input: IntelligenceEventInput) {
  const event = await StudentIntelligenceEventModel.create({
    userId,
    type: input.type,
    source: input.source,
    entityId: input.entityId,
    payload: input.payload ?? {}
  });

  const profile = await rebuildProfile(userId);
  event.processedAt = new Date();
  event.impact = {
    recallHealth: profile.recallHealth,
    roadmapProgress: profile.roadmapProgress,
    jobReadiness: profile.jobReadiness,
    burnoutRisk: profile.burnoutRisk,
    adaptiveDifficulty: profile.adaptiveDifficulty
  };
  await event.save();

  return { event, profile };
}

async function getProfile(userId: string) {
  const existing = await StudentIntelligenceProfileModel.findOne({ userId });
  return existing ? existing.toObject() : rebuildProfile(userId);
}

async function getTimeline(userId: string, limit = 30) {
  return StudentIntelligenceEventModel.find({ userId }).sort({ createdAt: -1 }).limit(limit);
}

async function getDailyIntelligence(userId: string) {
  const profile = await getProfile(userId);
  return {
    priorities: profile.dailyIntelligence?.priorities ?? [],
    adaptiveDifficulty: profile.adaptiveDifficulty,
    mentorTone: profile.dailyIntelligence?.mentorTone ?? "execution_focused",
    cognitiveLoad: profile.cognitiveLoad,
    burnoutRisk: profile.burnoutRisk,
    weakConcepts: profile.weakConcepts,
    jobReadiness: profile.jobReadiness
  };
}

async function search(userId: string, query: string) {
  const pattern = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  const [notes, concepts, roadmaps, projects, resumes] = await Promise.all([
    NoteModel.find({ userId, deleted: { $ne: true }, $or: [{ title: pattern }, { content: pattern }, { concepts: pattern }, { tags: pattern }] }).limit(8),
    ConceptNodeModel.find({ userId, name: pattern }).limit(8),
    RoadmapModel.find({ userId, $or: [{ title: pattern }, { targetRole: pattern }, { nextMilestone: pattern }] }).limit(5),
    ProjectModel.find({ userId, $or: [{ "project.title": pattern }, { "project.description": pattern }, { "project.requiredSkills": pattern }] }).limit(5),
    ResumeModel.find({ userId, $or: [{ targetRole: pattern }, { roleName: pattern }, { jobDescription: pattern }] }).limit(5)
  ]);

  return {
    results: [
      ...notes.map((note) => ({ type: "note", id: note._id.toString(), title: note.title, excerpt: note.content.slice(0, 180) })),
      ...concepts.map((concept) => ({ type: "concept", id: concept._id.toString(), title: concept.name, excerpt: `${concept.retentionState} retention, ${concept.retentionScore ?? 0}% score` })),
      ...roadmaps.map((roadmap) => ({ type: "roadmap", id: roadmap._id.toString(), title: roadmap.title, excerpt: roadmap.nextMilestone ?? roadmap.targetRole })),
      ...projects.map((project: any) => ({ type: "project", id: project._id.toString(), title: project.project.title, excerpt: project.project.description })),
      ...resumes.map((resume: any) => ({ type: "resume", id: resume._id.toString(), title: resume.versionName, excerpt: resume.targetRole }))
    ]
  };
}

function buildMentorContext(profile: any) {
  return [
    `Unified Student Intelligence Profile:`,
    `Target roles: ${(profile.targetRoles ?? []).join(", ") || "not set"}`,
    `Roadmap progress: ${profile.roadmapProgress}%`,
    `Recall health: ${profile.recallHealth}%`,
    `Memory retention: ${profile.memoryRetention}%`,
    `Weak concepts: ${(profile.weakConcepts ?? []).slice(0, 6).join(", ") || "none"}`,
    `Project depth: ${profile.projectDepth}% (${profile.executionStrength})`,
    `Interview readiness: ${profile.interviewReadiness}%`,
    `Job readiness: ${profile.jobReadiness}%`,
    `Burnout risk: ${profile.burnoutRisk}%`,
    `Cognitive load: ${profile.cognitiveLoad}%`,
    `Emotional state: ${profile.emotionalState}`,
    `Adaptive difficulty: ${profile.adaptiveDifficulty}`,
    `Daily priorities: ${(profile.dailyIntelligence?.priorities ?? []).map((item: any) => item.title).join("; ") || "none"}`
  ].join("\n");
}

export const studentIntelligenceService = {
  emitEvent,
  rebuildProfile,
  getProfile,
  getTimeline,
  getDailyIntelligence,
  search,
  buildMentorContext
};
