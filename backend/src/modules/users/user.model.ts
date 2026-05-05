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
    availableHours: {
      type: Number,
      default: 10
    },
    behaviorProfile: {
      consistencyScore: { type: Number, default: 0 },
      skipRate: { type: Number, default: 0 },
      avgSessionTime: { type: Number, default: 0 },
      preferredStudyTime: { type: String, default: "evening" }
    },
    subscription: {
      plan: {
        type: String,
        enum: ["free", "pro", "team"],
        default: "free"
      },
      status: {
        type: String,
        enum: ["trialing", "active", "past_due", "canceled"],
        default: "trialing"
      },
      currentPeriodEnd: {
        type: Date,
        default: null
      }
    },
    usage: {
      mentorPlansGenerated: {
        type: Number,
        default: 0
      },
      aiMessagesThisMonth: {
        type: Number,
        default: 0
      },
      usageMonth: {
        type: String,
        default: ""
      }
    },
    onboardingCompleted: {
      type: Boolean,
      default: false
    },
    pushSubscriptions: {
      type: [Schema.Types.Mixed],
      default: []
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
