import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";

const taskSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    roadmapId: {
      type: String,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    type: {
      type: String,
      enum: ["study", "revision", "project", "quiz"],
      required: true,
      default: "study"
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium"
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "skipped"],
      default: "pending"
    },
    scheduledAt: {
      type: Date,
      required: true
    },
    completedAt: {
      type: Date
    },
    estimatedMinutes: {
      type: Number,
      default: 30
    }
  },
  {
    timestamps: true
  }
);

export type TaskDocument = HydratedDocument<InferSchemaType<typeof taskSchema>>;
export const TaskModel = model("Task", taskSchema);
