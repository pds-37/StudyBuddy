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
    lastActivityAt: Date;
    burnoutRisk: number; // 0-100
    cognitiveLoad: number; // 0-100
    procrastinationLevel: "high" | "medium" | "low";
  };
  psychologicalProfile: {
    confidence: {
      skill: number;
      execution: number;
      interview: number;
      learning: number;
    };
    motivationState: "overexcited" | "momentum_driven" | "steady" | "discouraged" | "burned_out";
    anxietyLevel: number; // 0-100
    energyPatterns: {
      peakFocusWindow: string; // "morning", "afternoon", "evening", "night"
      fatigueTriggers: string[];
    };
    identityNarrative: string; // e.g. "Aspiring Engineer", "System Architect"
  };
  careerProfile: {
    readiness: {
      frontend: number;
      backend: number;
      ai: number;
      interview: number;
    };
    projectDepth: number; // 0-100
    executionStrength: "beginner" | "medium" | "advanced";
    communicationConfidence: number; // 0-100
    retentionHealth: number; // 0-100
    targetRoles: string[];
    applicationHistory: {
      totalApplied: number;
      responses: number;
      interviews: number;
      offers: number;
    };
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
  apiKeys?: {
    groq?: string;
    gemini?: string;
    openai?: string;
    huggingface?: string;
  };
  createdAt: Date;
  updatedAt: Date;
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
      preferredStudyTime: { type: String, default: "evening" },
      lastActivityAt: { type: Date, default: Date.now },
      burnoutRisk: { type: Number, default: 0 },
      cognitiveLoad: { type: Number, default: 0 },
      procrastinationLevel: { type: String, enum: ["high", "medium", "low"], default: "low" }
    },
    psychologicalProfile: {
      confidence: {
        skill: { type: Number, default: 50 },
        execution: { type: Number, default: 50 },
        interview: { type: Number, default: 50 },
        learning: { type: Number, default: 50 }
      },
      motivationState: { type: String, default: "steady" },
      anxietyLevel: { type: Number, default: 10 },
      energyPatterns: {
        peakFocusWindow: { type: String, default: "evening" },
        fatigueTriggers: { type: [String], default: [] }
      },
      identityNarrative: { type: String, default: "Student" }
    },
    careerProfile: {
      readiness: {
        frontend: { type: Number, default: 0 },
        backend: { type: Number, default: 0 },
        ai: { type: Number, default: 0 },
        interview: { type: Number, default: 0 }
      },
      projectDepth: { type: Number, default: 0 },
      executionStrength: { type: String, default: "beginner" },
      communicationConfidence: { type: Number, default: 10 },
      retentionHealth: { type: Number, default: 0 },
      targetRoles: { type: [String], default: [] },
      applicationHistory: {
        totalApplied: { type: Number, default: 0 },
        responses: { type: Number, default: 0 },
        interviews: { type: Number, default: 0 },
        offers: { type: Number, default: 0 }
      }
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
    } as any,
    apiKeys: {
      type: {
        groq: { type: String, default: "" },
        gemini: { type: String, default: "" },
        openai: { type: String, default: "" },
        huggingface: { type: String, default: "" }
      },
      default: {},
      select: false
    }
  },
  {
    timestamps: true
  }
);

export type UserDocument = Document & IUser & { _id: any };

export const UserModel = model<IUser>("User", userSchema);
