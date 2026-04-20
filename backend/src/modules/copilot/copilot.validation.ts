import { z } from "zod";

/** Schema for creating a new conversation. */
export const createConversationSchema = z.object({
  body: z.object({}).optional().default({})
});

/** Schema for sending a message. */
export const sendMessageSchema = z.object({
  params: z.object({
    conversationId: z.string().min(1, "Conversation ID is required")
  }),
  body: z.object({
    message: z.string().min(1, "Message cannot be empty").max(2000, "Message too long")
  })
});

/** Schema for getting a conversation. */
export const getConversationSchema = z.object({
  params: z.object({
    conversationId: z.string().min(1, "Conversation ID is required")
  })
});

export const copilotValidation = {
  createConversation: createConversationSchema,
  sendMessage: sendMessageSchema,
  getConversation: getConversationSchema
};
