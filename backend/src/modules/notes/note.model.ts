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
    }
  },
  {
    timestamps: true
  }
);

export type NoteDocument = HydratedDocument<InferSchemaType<typeof noteSchema>>;
export const NoteModel = model("Note", noteSchema);
