import mongoose from "mongoose";

const ResumeVersionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  roleName: { type: String, required: true },
  versionName: { type: String, required: true },
  targetRole: { type: String, required: true },
  jobDescription: { type: String },
  originalResume: { type: String, required: true },
  tailoredContent: { type: String },
  result: { type: Object }, // Stores the ResumeTailorResult
  createdAt: { type: Date, default: Date.now }
});

export const ResumeModel = mongoose.model("Resume", ResumeVersionSchema);
