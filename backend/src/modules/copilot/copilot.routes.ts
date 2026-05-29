import { Router } from "express";
import { copilotController } from "./copilot.controller.js";
import { copilotValidation } from "./copilot.validation.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { validateRequest } from "../../middlewares/validate-request.js";

export const copilotRouter = Router();

copilotRouter.use(authenticate);

copilotRouter.post(
  "/conversations",
  validateRequest(copilotValidation.createConversation),
  copilotController.createConversation
);

copilotRouter.get(
  "/conversations",
  copilotController.getConversations
);

copilotRouter.post(
  "/chat",
  copilotController.quickChat
);

copilotRouter.get(
  "/conversations/:conversationId",
  validateRequest(copilotValidation.getConversation),
  copilotController.getConversation
);

copilotRouter.post(
  "/conversations/:conversationId/messages",
  validateRequest(copilotValidation.sendMessage),
  copilotController.sendMessage
);

copilotRouter.delete(
  "/conversations/:conversationId",
  validateRequest(copilotValidation.getConversation),
  copilotController.deleteConversation
);
