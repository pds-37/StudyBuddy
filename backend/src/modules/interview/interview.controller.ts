import type { Request, Response, NextFunction } from "express";
import { interviewService } from "./interview.service.js";
import { z } from "zod";

const startSessionSchema = z.object({
  mode: z.enum(["technical", "scenario", "behavioral", "company", "mock"]).optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced", "adaptive"]).optional(),
  interviewerPersonality: z.enum(["friendly", "strict", "founder", "architect", "recruiter"]).optional(),
  pressureMode: z.boolean().optional(),
  timeLimitMinutes: z.number().optional(),
  targetCompany: z.string().optional()
}).optional();

export const startSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const options = req.body ? startSessionSchema.parse(req.body) : {};
    const session = await interviewService.startSession(req.userId!, options);
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

export const toggleFlag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await interviewService.toggleFlag(
      String(req.params.id),
      req.userId!,
      String(req.params.questionId)
    );
    res.json(session);
  } catch (error) {
    next(error);
  }
};

export const getHint = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hint = await interviewService.getHint(
      String(req.params.id),
      req.userId!,
      String(req.params.questionId)
    );
    res.json({ hint });
  } catch (error) {
    next(error);
  }
};

const saveDraftSchema = z.object({
  draftAnswer: z.string().max(5000, "Draft is too long")
});

export const saveDraft = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { draftAnswer } = saveDraftSchema.parse(req.body);
    const session = await interviewService.saveDraft(
      String(req.params.id),
      req.userId!,
      String(req.params.questionId),
      draftAnswer
    );
    res.json(session);
  } catch (error) {
    next(error);
  }
};

export const skipQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await interviewService.skipQuestion(
      String(req.params.id),
      req.userId!,
      String(req.params.questionId)
    );
    res.json(session);
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
