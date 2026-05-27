import { AsyncLocalStorage } from "async_hooks";

export type RequestContext = {
  userId?: string;
  apiKeys?: {
    groq?: string;
    gemini?: string;
    openai?: string;
    huggingface?: string;
  };
};

export const requestContextStorage = new AsyncLocalStorage<RequestContext>();
