import type { Request, Response, NextFunction } from "express";
import { interviewPanelService } from "./interview-panel.service.js";
import { z } from "zod";

const submitAnswerSchema = z.object({
  answer: z.string().trim().min(1, "Answer is required").max(20000, "Answer is too long")
});

export const startPanelSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await interviewPanelService.startPanelSession(req.userId!);
    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
};

export const getPanelSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await interviewPanelService.getPanelSession(String(req.params.id), req.userId!);
    res.json(session);
  } catch (error) {
    next(error);
  }
};

export const getUserPanelSessions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessions = await interviewPanelService.getUserPanelSessions(req.userId!);
    res.json(sessions);
  } catch (error) {
    next(error);
  }
};

export const submitPanelAnswer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { answer } = submitAnswerSchema.parse(req.body);
    const session = await interviewPanelService.submitPanelAnswer(
      String(req.params.id),
      req.userId!,
      String(req.params.questionId),
      answer
    );
    res.json(session);
  } catch (error) {
    next(error);
  }
};
