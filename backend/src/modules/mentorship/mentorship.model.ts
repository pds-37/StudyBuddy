import mongoose from "mongoose";
import type { MentorshipMatch } from "@studybuddy/shared";

export type MentorshipDocument = Omit<MentorshipMatch, "id"> & mongoose.Document;

const mentorProfileSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  company: { type: String, required: true },
  expertise: [{ type: String }],
  bio: { type: String },
  available: { type: Boolean, default: true }
}, { _id: false });

const mentorshipMatchSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  mentorId: { type: String, required: true },
  mentor: { type: mentorProfileSchema, required: true },
  matchScore: { type: Number, required: true },
  matchReasons: [{ type: String }],
  status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" }
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

export const MentorshipModel = mongoose.model<MentorshipDocument>("MentorshipMatch", mentorshipMatchSchema);
