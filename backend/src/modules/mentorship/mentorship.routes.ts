import { Router } from "express";
import { authenticate as requireAuth } from "../../middlewares/authenticate.js";
import * as mentorshipController from "./mentorship.controller.js";

export const mentorshipRouter = Router();

mentorshipRouter.use(requireAuth);

mentorshipRouter.get("/matches", mentorshipController.getMatches);
mentorshipRouter.patch("/matches/:id/status", mentorshipController.updateMatchStatus);
