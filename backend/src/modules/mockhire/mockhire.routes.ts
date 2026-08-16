import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { authenticate } from "../../middlewares/authenticate.js";
import { MockHireHistoryModel } from "./mockhire.model.js";
import { env } from "../../config/env.js"; // or process.env directly

export const mockhireRouter = Router();

const SHARED_SECRET = process.env.MOCKHIRE_SHARED_SECRET || "default_secret";
const MOCKHIRE_URL = process.env.MOCKHIRE_URL || "https://mock-hire-ai-bay.vercel.app";
const PROJECT_A_URL = process.env.PROJECT_A_URL || "http://localhost:5173";

// POST /api/mockhire/token
mockhireRouter.post("/token", authenticate, (req: any, res: Response) => {
  const user = req.user; // from requireAuth middleware

  const guestToken = jwt.sign(
    {
      sub:        user.id || user._id,
      name:       user.name || "Candidate",
      email:      user.email,
      guest:      true,
      source:     "project_a",
      return_url: `${PROJECT_A_URL}/interview-result`,
    },
    SHARED_SECRET,
    { expiresIn: "15m" }
  );

  res.json({
    redirect_url: `${MOCKHIRE_URL}/guest-interview?token=${guestToken}`
  });
});

// POST /api/mockhire/save-result
mockhireRouter.post("/save-result", authenticate, async (req: any, res: Response) => {
  const { communication, confidence, technical, grammar, overall, summary, interview_type, completed_at } = req.body;

  try {
    const result = await MockHireHistoryModel.create({
      userId:         req.user.id || req.user._id,
      source:         "mockhire_ai",
      interview_type: interview_type || "tech",
      communication,
      confidence,
      technical,
      grammar,
      overall,
      summary,
      completed_at:   completed_at || new Date(),
    });

    res.json({ message: "Interview result saved", id: result._id });
  } catch (err) {
    console.error("Error saving mockhire result:", err);
    res.status(500).json({ error: "Failed to save result" });
  }
});
