import mongoose from "mongoose";

export interface IJob extends mongoose.Document {
  title: string;
  company: string;
  location: string;
  type: "full-time" | "internship" | "remote";
  requirements: string[];
  description: string;
  source: string;
  externalUrl: string;
  category: "frontend" | "backend" | "ai" | "fullstack" | "devops";
  postedAt: Date;
}

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, enum: ["full-time", "internship", "remote"], default: "internship" },
  requirements: [{ type: String }],
  description: { type: String },
  source: { type: String },
  externalUrl: { type: String },
  category: { type: String, enum: ["frontend", "backend", "ai", "fullstack", "devops"], required: true },
  postedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const JobModel = mongoose.model<IJob>("Job", jobSchema);

export interface IApplication extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  status: "interested" | "applied" | "interviewing" | "rejected" | "offered";
  matchScore: number;
  aiReadinessAnalysis: {
    strengthAreas: string[];
    weakAreas: string[];
    prepRoadmapId?: string;
  };
  notes: string;
}

const applicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  status: { type: String, enum: ["interested", "applied", "interviewing", "rejected", "offered"], default: "interested" },
  matchScore: { type: Number, default: 0 },
  aiReadinessAnalysis: {
    strengthAreas: [{ type: String }],
    weakAreas: [{ type: String }],
    prepRoadmapId: { type: mongoose.Schema.Types.ObjectId, ref: "Roadmap" }
  },
  notes: { type: String }
}, { timestamps: true });

export const ApplicationModel = mongoose.model<IApplication>("Application", applicationSchema);
