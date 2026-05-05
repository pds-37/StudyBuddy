import type { Request, Response } from "express";
import { BehaviorEngine } from "../../engines/behavior.engine.js";
import { UserModel } from "../users/user.model.js";

async function logBehavior(req: Request, res: Response) {
  const userId = req.userId!;
  const { action, metadata } = req.body;

  if (!action) {
    return res.status(400).json({ error: "Action is required" });
  }

  await BehaviorEngine.logAction(userId, action, metadata);

  return res.json({ success: true, message: "Behavior logged successfully." });
}

async function getBehaviorProfile(req: Request, res: Response) {
  const userId = req.userId!;
  const user = await UserModel.findById(userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json(user.behaviorProfile || {});
}

export const behaviorController = {
  logBehavior,
  getBehaviorProfile
};
