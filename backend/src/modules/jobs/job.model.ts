import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";

const jobSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    company: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    requiredSkills: {
      type: [String],
      default: []
    },
    applyUrl: {
      type: String,
      trim: true
    },
    source: {
      type: String,
      enum: ["manual", "mock", "jsearch", "adzuna"],
      default: "manual"
    }
  },
  {
    timestamps: true
  }
);

export type JobDocument = HydratedDocument<InferSchemaType<typeof jobSchema>>;
export const JobModel = model("Job", jobSchema);
