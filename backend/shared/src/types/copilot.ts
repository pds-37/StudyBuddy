export type CopilotRole = "user" | "assistant" | "system";

export type CopilotMessageMetadata = {
  behaviorAnalysis?: string;
  cards?: Array<{
    type: "insight" | "mission" | "focus_sprint" | "recall_challenge" | "warning" | "analysis" | "recovery";
    title: string;
    description?: string;
    data?: any;
    actionLabel?: string;
    actionUrl?: string;
  }>;
  nextBestAction?: {
    label: string;
    description: string;
    type: "learn" | "revise" | "practice" | "rest" | "project";
  };
};

export type CopilotMessage = {
  id: string;
  role: CopilotRole;
  content: string;
  metadata?: CopilotMessageMetadata;
  createdAt: string;
};

