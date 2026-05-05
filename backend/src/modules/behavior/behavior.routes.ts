import { Router } from "express";
import { behaviorController } from "./behavior.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";

export const behaviorRouter = Router();

// Log a behavior action for the current user
behaviorRouter.post("/log", authenticate, behaviorController.logBehavior);

// Get the user's behavior profile (optional utility)
behaviorRouter.get("/profile", authenticate, behaviorController.getBehaviorProfile);
