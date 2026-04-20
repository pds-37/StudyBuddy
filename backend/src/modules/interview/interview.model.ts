import mongoose from "mongoose";
import type { InterviewSession } from "@studybuddy/shared";

export type InterviewDocument = Omit<InterviewSession, "id"> & mongoose.Document;

const interviewScoreSchema = new mongoose.Schema({
  clarity: { type: Number, required: true },
  relevance: { type: Number, required: true },
  starMethod: { type: Number, required: true },
  overall: { type: Number, required: true },
  feedback: { type: String, required: true },
}, { _id: false });

const interviewQuestionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  question: { type: String, required: true },
  category: { type: String, enum: ["behavioral", "technical", "general"], required: true },
  userAnswer: { type: String },
  score: { type: interviewScoreSchema }
}, { _id: false });

const interviewSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  targetRole: { type: String, required: true },
  status: { type: String, enum: ["in_progress", "completed"], default: "in_progress" },
  questions: [interviewQuestionSchema],
  overallScore: { type: Number },
  overallFeedback: { type: String }
}, {
  timestamps: true,
  toJSON: {
    transform: (_, ret: any) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

export const InterviewModel = mongoose.model<InterviewDocument>("Interview", interviewSessionSchema);
