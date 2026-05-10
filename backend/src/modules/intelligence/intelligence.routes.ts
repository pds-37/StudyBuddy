import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { intelligenceController } from "./intelligence.controller.js";

export const intelligenceRouter = Router();

intelligenceRouter.use(authenticate);

intelligenceRouter.get("/health", intelligenceController.getHealth);
intelligenceRouter.get("/revision-priorities", intelligenceController.getRevisionPriorities);
intelligenceRouter.get("/concepts", intelligenceController.getConcepts);
intelligenceRouter.get("/decay-states", intelligenceController.getDecayStates);
intelligenceRouter.get("/momentum", intelligenceController.getMomentum);
intelligenceRouter.get("/profile", intelligenceController.getStudentProfile);
intelligenceRouter.post("/profile/refresh", intelligenceController.refreshStudentProfile);
intelligenceRouter.get("/timeline", intelligenceController.getTimeline);
intelligenceRouter.get("/daily", intelligenceController.getDailyIntelligence);
intelligenceRouter.get("/search", intelligenceController.searchUnified);
