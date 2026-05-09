import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";
import { randomUUID } from "crypto";

const noteSchema = new Schema(
  {
    noteId: {
      type: String,
      unique: true,
      default: () => randomUUID(),
      index: true
    },
    userId: {
      type: String,
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    topic: {
      type: String,
      trim: true,
      index: true
    },
    tags: {
      type: [String],
      default: []
    },
    linkedSkills: {
      type: [String],
      default: []
    },
    sourceUrl: {
      type: String,
      trim: true
    },
    sourceType: {
      type: String,
      enum: ["manual", "pdf", "image", "web", "youtube"],
      default: "manual"
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    },
    syncedAt: {
      type: Date,
      default: null
    },
    deleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date,
      default: null
    },
    embedding: {
      type: [Number],
      default: []
    },
    embeddingProvider: {
      type: String,
      enum: ["huggingface", "local-fallback"],
      default: "local-fallback"
    },
    strength: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.25,
      index: true
    },
    nextReviewAt: {
      type: Date,
      default: () => new Date(),
      index: true
    },
    lastReviewed: {
      type: Date,
      default: null
    },
    reviewCount: {
      type: Number,
      default: 0
    },
    lapseCount: {
      type: Number,
      default: 0
    },

    // ─── Knowledge Intelligence Fields ───
    concepts: {
      type: [String],
      default: [],
      index: true
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner"
    },
    knowledgeLayer: {
      type: String,
      enum: ["surface", "understanding", "application", "mastery"],
      default: "surface"
    },
    interviewImportance: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    confusionCount: {
      type: Number,
      default: 0
    },
    evolutionHistory: {
      type: [Schema.Types.Mixed],
      default: []
    },
    relatedNoteIds: {
      type: [String],
      default: []
    },
    projectLinks: {
      type: [String],
      default: []
    },
    revisionStrategy: {
      type: String,
      enum: ["implementation", "conceptual", "practical_repetition", "visual"],
      default: "conceptual"
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for knowledge intelligence queries
noteSchema.index({ userId: 1, concepts: 1 });
noteSchema.index({ userId: 1, difficulty: 1 });
noteSchema.index({ userId: 1, interviewImportance: -1 });
noteSchema.index({ userId: 1, strength: 1, nextReviewAt: 1 });

export type NoteDocument = HydratedDocument<InferSchemaType<typeof noteSchema>>;
export const NoteModel = model("Note", noteSchema);
