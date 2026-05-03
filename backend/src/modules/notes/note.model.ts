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
    source: {
      type: String,
      enum: ["web", "cli"],
      default: "web"
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
    }
  },
  {
    timestamps: true
  }
);

export type NoteDocument = HydratedDocument<InferSchemaType<typeof noteSchema>>;
export const NoteModel = model("Note", noteSchema);
