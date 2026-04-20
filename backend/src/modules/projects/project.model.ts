import mongoose from "mongoose";
import type { ProjectMatch } from "@studybuddy/shared";

export type ProjectDocument = Omit<ProjectMatch, "id"> & mongoose.Document;

const capstoneProjectSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  industry: { type: String, required: true },
  description: { type: String, required: true },
  requiredSkills: [{ type: String }],
  difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"], required: true },
  estimatedHours: { type: Number, required: true }
}, { _id: false });

const projectMatchSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  projectId: { type: String, required: true },
  project: { type: capstoneProjectSchema, required: true },
  matchScore: { type: Number, required: true },
  matchReasons: [{ type: String }],
  status: { type: String, enum: ["recommended", "in_progress", "completed"], default: "recommended" }
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

export const ProjectModel = mongoose.model<ProjectDocument>("ProjectMatch", projectMatchSchema);
