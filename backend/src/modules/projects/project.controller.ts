import type { Request, Response, NextFunction } from "express";
import { projectService } from "./project.service.js";
import { z } from "zod";

export const getMatches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const matches = await projectService.findMatches(req.userId!);
    res.json(matches);
  } catch (error) {
    next(error);
  }
};

const updateStatusSchema = z.object({
  status: z.enum(["in_progress", "completed"])
});

export const updateProjectStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = updateStatusSchema.parse(req.body);
    const match = await projectService.updateProjectStatus(req.userId!, String(req.params.id), status as "in_progress" | "completed");
    res.json(match);
  } catch (error) {
    next(error);
  }
};

const generateCustomSchema = z.object({
  ideaPrompt: z.string().min(3).max(500)
});

export const generateCustomProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ideaPrompt } = generateCustomSchema.parse(req.body);
    const match = await projectService.generateCustomProject(req.userId!, ideaPrompt);
    res.json(match);
  } catch (error) {
    next(error);
  }
};

export const getMentorInsights = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const insights = await projectService.getMentorInsights(req.userId!);
    res.json(insights);
  } catch (error) {
    next(error);
  }
};
