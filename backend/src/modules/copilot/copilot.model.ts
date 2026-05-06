import mongoose, { type Document, Schema } from "mongoose";
import type { CopilotMessage } from "@studybuddy/shared";

export interface CopilotConversationDocument extends Document {
  userId: string;
  messages: CopilotMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const copilotMessageSchema = new Schema({
  id: { type: String, required: true },
  role: { type: String, enum: ["user", "assistant", "system"], required: true },
  content: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: String, required: true }
}, { _id: false });

const copilotConversationSchema = new Schema({
  userId: { type: String, required: true, index: true },
  messages: [copilotMessageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

copilotConversationSchema.index({ userId: 1, createdAt: -1 });

export const CopilotConversation = mongoose.model<CopilotConversationDocument>(
  "CopilotConversation",
  copilotConversationSchema
);
