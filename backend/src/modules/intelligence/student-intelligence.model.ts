import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";

export const STUDENT_INTELLIGENCE_EVENT_TYPES = [
  "NOTE_CREATED",
  "NOTE_UPDATED",
  "NOTE_DELETED",
  "RECALL_FAILED",
  "RECALL_PASSED",
  "RECALL_WEAK",
  "ROADMAP_TASK_COMPLETED",
  "ROADMAP_TASK_SKIPPED",
  "ROADMAP_PHASE_COMPLETED",
  "PROJECT_STARTED",
  "PROJECT_COMPLETED",
  "JOB_TARGETED",
  "JOB_APPLIED",
  "INTERVIEW_FAILED",
  "INTERVIEW_PASSED",
  "RESUME_UPDATED",
  "SKILL_CONFIDENCE_CHANGED",
  "BURNOUT_DETECTED",
  "INCONSISTENCY_DETECTED",
  "TRACK_ADDED",
  "ROADMAP_RECALIBRATED",
  "MENTOR_INTERACTION"
] as const;

const intelligenceEventSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, enum: STUDENT_INTELLIGENCE_EVENT_TYPES, required: true, index: true },
    source: {
      type: String,
      enum: ["notes", "recall", "roadmap", "projects", "resume", "jobs", "mentor", "skills", "behavior", "system"],
      required: true,
      index: true
    },
    entityId: { type: String, index: true },
    payload: { type: Schema.Types.Mixed, default: {} },
    processedAt: { type: Date, default: null },
    impact: { type: Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

const studentIntelligenceProfileSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },

    targetRoles: { type: [String], default: [] },
    activeTracks: { type: [String], default: [] },

    roadmapState: { type: Schema.Types.Mixed, default: {} },
    roadmapProgress: { type: Number, min: 0, max: 100, default: 0 },

    skillConfidenceMap: { type: Schema.Types.Mixed, default: {} },
    skillGapMap: { type: Schema.Types.Mixed, default: {} },

    recallHealth: { type: Number, min: 0, max: 100, default: 0 },
    memoryRetention: { type: Number, min: 0, max: 100, default: 0 },

    knowledgeGraph: { type: Schema.Types.Mixed, default: { nodes: [], edges: [], highLeverageSkills: [] } },

    projectDepth: { type: Number, min: 0, max: 100, default: 0 },
    executionStrength: { type: String, enum: ["beginner", "medium", "advanced"], default: "beginner" },

    interviewReadiness: { type: Number, min: 0, max: 100, default: 0 },
    resumeState: { type: Schema.Types.Mixed, default: {} },
    ATSReadiness: { type: Number, min: 0, max: 100, default: 0 },

    consistencyScore: { type: Number, min: 0, max: 100, default: 0 },
    learningVelocity: { type: Number, min: 0, max: 100, default: 0 },
    cognitiveLoad: { type: Number, min: 0, max: 100, default: 0 },

    burnoutRisk: { type: Number, min: 0, max: 100, default: 0 },
    emotionalState: { type: String, default: "steady" },
    confidenceLevel: { type: Number, min: 0, max: 100, default: 50 },

    jobReadiness: { type: Number, min: 0, max: 100, default: 0 },
    opportunityAlignment: { type: Number, min: 0, max: 100, default: 0 },

    preferredLearningStyle: { type: String, default: "adaptive" },
    weakConcepts: { type: [String], default: [] },
    strongConcepts: { type: [String], default: [] },

    behavioralPatterns: { type: Schema.Types.Mixed, default: {} },
    adaptiveDifficulty: { type: String, enum: ["recovery", "easy", "balanced", "stretch"], default: "balanced" },

    dailyIntelligence: { type: Schema.Types.Mixed, default: { priorities: [], mentorTone: "steady" } },
    systemMemory: { type: Schema.Types.Mixed, default: { struggles: [], preferences: [], confidenceShifts: [] } },
    lastEventAt: { type: Date, default: null },
    lastRecalculatedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

intelligenceEventSchema.index({ userId: 1, createdAt: -1 });
studentIntelligenceProfileSchema.index({ userId: 1, updatedAt: -1 });

export type StudentIntelligenceEventType = (typeof STUDENT_INTELLIGENCE_EVENT_TYPES)[number];
export type StudentIntelligenceEventDocument = HydratedDocument<InferSchemaType<typeof intelligenceEventSchema>>;
export type StudentIntelligenceProfileDocument = HydratedDocument<InferSchemaType<typeof studentIntelligenceProfileSchema>>;

export const StudentIntelligenceEventModel = model("StudentIntelligenceEvent", intelligenceEventSchema);
export const StudentIntelligenceProfileModel = model("StudentIntelligenceProfile", studentIntelligenceProfileSchema);
