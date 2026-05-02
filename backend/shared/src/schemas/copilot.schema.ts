import { z } from "zod";

export const copilotMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
  createdAt: z.string()
});

export const createConversationRequestSchema = z.object({});

export const createConversationResponseSchema = z.object({
  conversationId: z.string()
});

export const sendMessageRequestSchema = z.object({
  message: z.string().min(1).max(2000)
});

export const sendMessageResponseSchema = z.object({
  message: copilotMessageSchema
});

export const getConversationResponseSchema = z.object({
  conversation: z.object({
    _id: z.string(),
    userId: z.string(),
    messages: z.array(copilotMessageSchema),
    createdAt: z.string(),
    updatedAt: z.string()
  })
});

export const getConversationsResponseSchema = z.object({
  conversations: z.array(z.object({
    _id: z.string(),
    userId: z.string(),
    messages: z.array(copilotMessageSchema),
    createdAt: z.string(),
    updatedAt: z.string()
  }))
});