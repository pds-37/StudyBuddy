import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";

const resourceSchema = new Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ["video", "course", "article", "documentation"], required: true },
  url: { type: String, required: true },
  author: { type: String, required: true }
});

const roadmapMilestoneSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  skillTags: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ["not_started", "in_progress", "completed"],
    default: "not_started"
  },
  order: {
    type: Number,
    required: true
  },
  rationale: {
    type: String
  },
  targetDate: {
    type: String
  },
  resources: {
    type: [resourceSchema],
    default: []
  }
});

const roadmapSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    targetRole: {
      type: String,
      required: true
    },
    timelineWeeks: {
      type: Number,
      required: true,
      min: 1,
      max: 104
    },
    rationale: {
      type: String
    },
    milestones: {
      type: [roadmapMilestoneSchema],
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
