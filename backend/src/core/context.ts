import { AsyncLocalStorage } from "async_hooks";

export type RequestContext = {
  userId?: string;
  apiKeys?: {
    groq?: string;
    gemini?: string;
    openai?: string;
    huggingface?: string;
    ollamaUrl?: string;
    ollamaModel?: string;
  };
  aiRoutes?: {
    mentor?: string;
    roadmap?: string;
    quiz?: string;
    resume?: string;
    skills?: string;
    note?: string;
    interview?: string;
    mentorship?: string;
    project?: string;
  };
};

export const requestContextStorage = new AsyncLocalStorage<RequestContext>();
