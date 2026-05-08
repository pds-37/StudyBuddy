export type AuthMode = "login" | "signup";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  targetRoles: string[];
  currentSkills: string[];
  experienceLevel: "beginner" | "intermediate" | "advanced";
  subscription?: {
    plan: "free" | "pro" | "team";
    status: "trialing" | "active" | "past_due" | "canceled";
    currentPeriodEnd?: string | null;
  };
  usage?: {
    mentorPlansGenerated: number;
    aiMessagesThisMonth: number;
    usageMonth: string;
  };
  onboardingCompleted: boolean;
  behaviorProfile?: {
    consistencyScore: number;
    skipRate: number;
    lastActivityAt: string;
  };
  psychologicalProfile?: {
    identityNarrative: string;
    motivationState: string;
    confidence: {
      skill: number;
      execution: number;
      interview: number;
      learning: number;
    };
  };
};

export type AuthResponse = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type SignupPayload = LoginPayload & {
  name: string;
};
