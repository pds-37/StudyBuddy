import mongoose from "mongoose";

export interface IMockHireHistory extends mongoose.Document {
  userId: string;
  source: string;
  interview_type: "tech" | "hr" | "dsa";
  communication: number;
  confidence: number;
  technical: number;
  grammar: number;
  overall: number;
  summary: string;
  completed_at: Date;
}

const InterviewHistorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  source:         { type: String, default: "mockhire_ai" },
  interview_type: { type: String, enum: ["tech", "hr", "dsa"], required: true },

  // Scores from MockHire AI feedback
  communication: { type: Number, min: 0, max: 10 },
  confidence:    { type: Number, min: 0, max: 10 },
  technical:     { type: Number, min: 0, max: 10 },
  grammar:       { type: Number, min: 0, max: 10 },
  overall:       { type: Number, min: 0, max: 10 },
  summary:       { type: String },

  completed_at: { type: Date, default: Date.now },
}, { timestamps: true });

export const MockHireHistoryModel = mongoose.model<IMockHireHistory>("MockHireHistory", InterviewHistorySchema);
