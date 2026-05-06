import { Schema, model, type InferSchemaType, type Document } from "mongoose";

export interface IUser {
  email: string;
  googleId?: string;
  passwordHash?: string;
  name: string;
  targetRoles: string[];
  experienceLevel: "beginner" | "intermediate" | "advanced";
  currentSkills: string[];
  profile: Record<string, any>;
  preferences: Record<string, any>;
  availableHours: number;
  behaviorProfile: {
    consistencyScore: number;
    skipRate: number;
    avgSessionTime: number;
    preferredStudyTime: string;
  };
  subscription: {
    plan: "free" | "pro" | "team";
    status: "trialing" | "active" | "past_due" | "canceled";
    currentPeriodEnd: Date | null;
  };
  usage: {
    mentorPlansGenerated: number;
    aiMessagesThisMonth: number;
    usageMonth: string;
  };
  onboardingCompleted: boolean;
  pushSubscriptions: any[];
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: function(this: IUser) { return !this.googleId; },
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

export type UserDocument = Document & IUser & { _id: any };

export const UserModel = model<IUser>("User", userSchema);
