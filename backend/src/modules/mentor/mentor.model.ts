import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";

const mentorTaskSchema = new Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ["onboarding", "skill_gap", "roadmap", "learn", "recall", "note", "project", "interview", "job", "reflection"],
      required: true
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    reason: { type: String, required: true },
    priority: { type: String, enum: ["high", "medium", "low"], required: true },
    estimatedMinutes: { type: Number, required: true },
    href: { type: String, required: true },
    status: { type: String, enum: ["pending", "completed", "skipped"], default: "pending" },
    completedAt: { type: Date, default: null }
  },
  { _id: false }
);

const mentorDailyPlanSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true },
    focus: { type: String, required: true },
    mentorMessage: { type: String, required: true },
    journeyStage: {
      type: String,
      enum: ["setup", "diagnose", "plan", "learn", "recall", "build", "interview", "job_search"],
      required: true
    },
    readinessScore: { type: Number, min: 0, max: 100, required: true },
    nextUnlock: { type: String, required: true },
    tasks: { type: [mentorTaskSchema], default: [] },
    signals: { type: Schema.Types.Mixed, default: {} },
    subscription: { type: Schema.Types.Mixed, default: {} }
  },
  {
    timestamps: true
  }
);

mentorDailyPlanSchema.index({ userId: 1, date: 1 }, { unique: true });

export type MentorDailyPlanDocument = HydratedDocument<InferSchemaType<typeof mentorDailyPlanSchema>>;
export const MentorDailyPlanModel = model("MentorDailyPlan", mentorDailyPlanSchema);
