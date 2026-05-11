import { type Request, type Response } from "express";
import { copilotService } from "./copilot.service.js";
import { asyncHandler } from "../../utils/async-handler.js";

/** Creates a new conversation for the authenticated user. */
export const createConversation = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId ?? "";
  const conversationId = await copilotService.createConversation(userId);

  res.status(201).json({ conversationId });
});

/** Gets all conversations for the authenticated user. */
export const getConversations = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId ?? "";
  const conversations = await copilotService.getUserConversations(userId);

  res.json({ conversations });
});

/** Gets a specific conversation by ID. */
export const getConversation = asyncHandler(async (req: Request, res: Response) => {
  const conversationId = String(req.params.conversationId ?? "");
  const userId = req.userId ?? "";

  const conversation = await copilotService.getConversation(conversationId, userId);

  res.json({ conversation });
});

/** Sends a message to a conversation and gets AI response. */
export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const conversationId = String(req.params.conversationId ?? "");
  const { message } = req.body;
  const userId = req.userId ?? "";

  const aiResponse = await copilotService.sendMessage(conversationId, userId, message);

  res.json({ message: aiResponse });
});

/** One-shot chat endpoint used by the offline C++ agent. */
export const quickChat = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId ?? "";
  const message = String(req.body?.message ?? "");
  const conversationId = await copilotService.createConversation(userId);
  const aiResponse = await copilotService.sendMessage(conversationId, userId, message);

  res.json({
    response: aiResponse.content,
    message: aiResponse.content,
    metadata: aiResponse.metadata
  });
});

export const copilotController = {
  createConversation,
  getConversations,
  getConversation,
  sendMessage,
  quickChat
};
