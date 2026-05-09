import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";

const conceptNodeSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ["algorithm", "framework", "pattern", "language", "concept", "tool"],
      default: "concept"
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner"
    },
    noteIds: {
      type: [String],
      default: []
    },
    relatedConceptIds: {
      type: [String],
      default: []
    },
    interviewFrequency: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium"
    },
    retentionScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    retentionState: {
      type: String,
      enum: ["strong", "stable", "weakening", "critical"],
      default: "critical"
    },
    masteryValidated: {
      type: Boolean,
      default: false
    },
    lastReviewed: {
      type: Date,
      default: null
    },
    projectLinks: {
      type: [String],
      default: []
    },
    roadmapPhaseIds: {
      type: [String],
      default: []
    },
    executionEvidence: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

conceptNodeSchema.index({ userId: 1, name: 1 }, { unique: true });
conceptNodeSchema.index({ userId: 1, retentionState: 1 });
conceptNodeSchema.index({ userId: 1, interviewFrequency: 1 });

export type ConceptNodeDocument = HydratedDocument<InferSchemaType<typeof conceptNodeSchema>>;
export const ConceptNodeModel = model("ConceptNode", conceptNodeSchema);
