import { Router } from "express";
import { authenticate as requireAuth } from "../../middlewares/authenticate.js";
import * as interviewController from "./interview.controller.js";
import * as interviewPanelController from "./interview-panel.controller.js";

export const interviewRouter = Router();

interviewRouter.use(requireAuth);

// Standard Mock Interviews
interviewRouter.post("/", interviewController.startSession);
interviewRouter.get("/", interviewController.getUserSessions);
interviewRouter.get("/:id", interviewController.getSession);
interviewRouter.post("/:id/questions/:questionId/answer", interviewController.submitAnswer);
interviewRouter.post("/:id/questions/:questionId/flag", interviewController.toggleFlag);
interviewRouter.get("/:id/questions/:questionId/hint", interviewController.getHint);
interviewRouter.post("/:id/questions/:questionId/draft", interviewController.saveDraft);
interviewRouter.post("/:id/questions/:questionId/skip", interviewController.skipQuestion);

// Multi-Agent Shadow Panel Interviews
interviewRouter.post("/panel/start", interviewPanelController.startPanelSession);
interviewRouter.get("/panel", interviewPanelController.getUserPanelSessions);
interviewRouter.get("/panel/:id", interviewPanelController.getPanelSession);
interviewRouter.post("/panel/:id/questions/:questionId/answer", interviewPanelController.submitPanelAnswer);

