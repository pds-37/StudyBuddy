import { Request, Response } from "express";
import { RecommendationEngine } from "../../engines/recommendation.engine.js";
import { NudgingEngine } from "../../engines/nudging.engine.js";

export const getNextBestAction = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
       return res.status(401).json({ error: "Unauthorized" });
    }

    // Fire off nudge evaluation in the background
    NudgingEngine.evaluateNudges(userId).catch((err: any) => console.error("NudgingEngine Error:", err));

    const nextAction = await RecommendationEngine.getNextBestAction(userId);
    return res.status(200).json(nextAction);
  } catch (error) {
    console.error("Error in getNextBestAction:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
