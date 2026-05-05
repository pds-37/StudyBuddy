import { Router } from "express";
import { getNextBestAction } from "./recommendations.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";

const router = Router();

// Define the smart endpoint with authentication
router.get("/next-best-action", authenticate, getNextBestAction);

export const recommendationsRouter = router;

