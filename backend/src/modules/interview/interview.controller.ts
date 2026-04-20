import type { Request, Response, NextFunction } from "express";
import { interviewService } from "./interview.service.js";
import { z } from "zod";

export const startSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await interviewService.startSession(req.userId!);
    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
};

export const getSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await interviewService.getSession(String(req.params.id), req.userId!);
    res.json(session);
  } catch (error) {
    next(error);
  }
};

export const getUserSessions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessions = await interviewService.getUserSessions(req.userId!);
    res.json(sessions);
  } catch (error) {
    next(error);
  }
};

const submitAnswerSchema = z.object({
  answer: z.string().min(1, "Answer is required").max(5000, "Answer is too long")
});

export const submitAnswer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { answer } = submitAnswerSchema.parse(req.body);
    const session = await interviewService.submitAnswer(
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
