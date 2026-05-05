import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";

const memoryItemSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    noteId: {
      type: String,
      required: true,
      index: true
    },
    content: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ["flashcard", "quiz", "summary"],
      default: "flashcard"
    },
    nextReview: {
      type: Date,
      required: true,
      index: true
    },
    strength: {
      type: Number, // 0 to 1, representing how well the user knows this
      default: 0
    },
    interval: {
      type: Number, // days until next review
      default: 1
    },
    repetitions: {
      type: Number,
      default: 0
    },
    easeFactor: {
      type: Number,
      default: 2.5
    }
  },
  {
    timestamps: true
  }
);

export type MemoryItemDocument = HydratedDocument<InferSchemaType<typeof memoryItemSchema>>;
export const MemoryItemModel = model("MemoryItem", memoryItemSchema);
