import { apiClient } from "./client.js";
import type { CopilotMessage } from "@studybuddy/shared";

export interface Conversation {
  _id: string;
  userId: string;
  messages: CopilotMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateConversationResponse {
  conversationId: string;
}

export interface SendMessageResponse {
  message: CopilotMessage;
}

export interface GetConversationsResponse {
  conversations: Conversation[];
}

export interface GetConversationResponse {
  conversation: Conversation;
}

/** Creates a new conversation. */
export async function createConversation(): Promise<string> {
  const response = await apiClient.post<CreateConversationResponse>("/copilot/conversations", {});
  return response.data.conversationId;
}

/** Gets all conversations for the user. */
export async function getConversations(): Promise<Conversation[]> {
  const response = await apiClient.get<GetConversationsResponse>("/copilot/conversations");
  return response.data.conversations;
}

/** Gets a specific conversation. */
export async function getConversation(conversationId: string): Promise<Conversation> {
  const response = await apiClient.get<GetConversationResponse>(`/copilot/conversations/${conversationId}`);
  return response.data.conversation;
}

/** Sends a message to a conversation. */
export async function sendMessage(conversationId: string, message: string): Promise<CopilotMessage> {
  const response = await apiClient.post<SendMessageResponse>(`/copilot/conversations/${conversationId}/messages`, {
    message
  });
  return response.data.message;
}
