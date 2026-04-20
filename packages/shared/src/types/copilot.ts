export type CopilotRole = "user" | "assistant" | "system";

export type CopilotMessage = {
  id: string;
  role: CopilotRole;
  content: string;
  createdAt: string;
};
