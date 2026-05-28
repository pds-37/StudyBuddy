import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";

const roadmapTaskSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ["learn", "practice", "revise", "project"], required: true },
  durationMinutes: { type: Number, required: true },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
  status: { type: String, enum: ["pending", "completed", "skipped"], default: "pending" },
  aiHint: { type: String },
  completedAt: { type: Date },
  subtasks: { type: [String], default: [] },
  resources: {
    type: [{
      label: { type: String },
      url: { type: String }
    }],
    default: []
  }
});

const roadmapMissionSchema = new Schema({
  id: { type: String, required: true },
  weekNumber: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  whyItMatters: { type: String, required: true },
  outcome: { type: String, required: true },
  commonMistakes: { type: [String], default: [] },
  tasks: { type: [roadmapTaskSchema], default: [] },
  status: { type: String, enum: ["not_started", "in_progress", "completed"], default: "not_started" }
});

const roadmapPhaseSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ["locked", "unlocked", "completed"], default: "locked" },
  estimatedWeeks: { type: Number, required: true },
  difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"], required: true },
  checkpoints: { type: [String], default: [] },
  missions: { type: [roadmapMissionSchema], default: [] }
});

const roadmapInsightSchema = new Schema({
  type: { type: String, enum: ["behavior", "performance", "recommendation"], required: true },
  message: { type: String, required: true },
  actionLabel: { type: String },
  actionUrl: { type: String }
});

const roadmapSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    trackId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    category: {
      type: String,
      default: "Career"
    },
    priorityWeight: {
      type: Number,
      default: 1.0 // 0.0 to 1.0
    },
    targetRole: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["active", "paused", "completed", "archived"],
      default: "active"
    },
    readinessScore: {
      type: Number,
      default: 0
    },
    consistencyScore: {
      type: Number,
      default: 0
    },
    currentPhaseId: {
      type: String
    },
    nextMilestone: {
      type: String
    },
    phases: {
      type: [roadmapPhaseSchema],
      default: []
    },
    insights: {
      type: [roadmapInsightSchema],
      default: []
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: {
      type: String
    }
  },
  {
    timestamps: true
  }
);


export type RoadmapDocument = HydratedDocument<InferSchemaType<typeof roadmapSchema>>;
export const RoadmapModel = model("Roadmap", roadmapSchema);
