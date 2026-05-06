import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";

const behaviorLogSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    action: {
      type: String,
      enum: [
        "task_completed",
        "task_skipped",
        "login",
        "revision_completed",
        "roadmap_generated",
        "session_started",
        "resume_tailored",
        "project_started",
        "project_completed"
      ],
      required: true,
      index: true
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    },
    impact: {
      type: Number,
      default: 0 // Optional: how this action impacted their consistency score (e.g., +1, -1)
    },
    timestamp: {
      type: Date,
      default: () => new Date(),
      index: true
    }
  },
  {
    timestamps: true
  }
);

export type BehaviorLogDocument = HydratedDocument<InferSchemaType<typeof behaviorLogSchema>>;
export const BehaviorLogModel = model("BehaviorLog", behaviorLogSchema);
