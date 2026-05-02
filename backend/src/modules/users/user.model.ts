import { Schema, model, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true,
      select: false
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    targetRoles: {
      type: [String],
      default: []
    },
    experienceLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner"
    },
    currentSkills: {
      type: [String],
      default: []
    },
    profile: {
      type: Schema.Types.Mixed,
      default: {}
    },
    preferences: {
      type: Schema.Types.Mixed,
      default: {}
    },
    onboardingCompleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: unknown;
};

export const UserModel = model("User", userSchema);
