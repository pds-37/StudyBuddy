import mongoose from "mongoose";
import type { InterviewSession } from "@studybuddy/shared";

export type InterviewDocument = Omit<InterviewSession, "id"> & mongoose.Document;

const interviewScoreSchema = new mongoose.Schema({
  technicalAccuracy: { type: Number, required: true },
  clarity: { type: Number, required: true },
  scalabilityThinking: { type: Number, required: true },
  debuggingApproach: { type: Number, required: true },
  communication: { type: Number, required: true },
  optimizationAwareness: { type: Number, required: true },
  confidence: { type: Number, required: true },
  relevance: { type: Number },
  starMethod: { type: Number },
  overall: { type: Number, required: true },
  feedback: { type: String, required: true },
}, { _id: false });

const interviewQuestionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  question: { type: String, required: true },
  category: { type: String, enum: ["behavioral", "technical", "general", "scenario", "system_design"], required: true },
  userAnswer: { type: String },
  score: { type: interviewScoreSchema },
  hint: { type: String },
  idealAnswer: { type: String },
  missingConcepts: { type: [String], default: [] },
  scalabilityGaps: { type: [String], default: [] },
  communicationTips: { type: [String], default: [] },
  isFlagged: { type: Boolean, default: false },
  draftAnswer: { type: String }
}, { _id: false });

const interviewSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  targetRole: { type: String, required: true },
  status: { type: String, enum: ["in_progress", "completed"], default: "in_progress" },
  questions: [interviewQuestionSchema],
  overallScore: { type: Number },
  overallFeedback: { type: String },
  mode: { 
    type: String, 
    enum: ["technical", "scenario", "behavioral", "company", "mock"], 
    required: true, 
    default: "technical" 
  },
  difficulty: { 
    type: String, 
    enum: ["beginner", "intermediate", "advanced"], 
    required: true, 
    default: "intermediate" 
  },
  interviewerPersonality: { 
    type: String, 
    enum: ["friendly", "strict", "founder", "architect", "recruiter"], 
    required: true, 
    default: "friendly" 
  },
  pressureMode: { type: Boolean, required: true, default: false },
  timeLimitMinutes: { type: Number },
  targetCompany: { type: String }
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
