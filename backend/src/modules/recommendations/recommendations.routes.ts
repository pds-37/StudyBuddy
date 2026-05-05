import { Router } from "express";
import { getNextBestAction } from "./recommendations.controller.js";
// import { requireAuth } from "../../middlewares/requireAuth"; // Assuming you have an auth middleware

const router = Router();

// Define the smart endpoint
// Ideally you would add your auth middleware here like: router.get("/next-best-action", requireAuth, getNextBestAction);
router.get("/next-best-action", getNextBestAction);

export const recommendationsRouter = router;

