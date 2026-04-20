import type { Request, Response, NextFunction } from "express";
import { mentorshipService } from "./mentorship.service.js";
import { z } from "zod";

export const getMatches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const matches = await mentorshipService.findMatches(req.userId!);
    res.json(matches);
  } catch (error) {
    next(error);
  }
};

const updateStatusSchema = z.object({
  status: z.enum(["accepted", "declined"])
});

export const updateMatchStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = updateStatusSchema.parse(req.body);
    const match = await mentorshipService.updateMatchStatus(req.userId!, String(req.params.id), status as "accepted" | "declined");
    res.json(match);
  } catch (error) {
    next(error);
  }
};
