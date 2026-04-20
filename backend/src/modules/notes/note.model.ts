import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";

const noteSchema = new Schema(
  {
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
