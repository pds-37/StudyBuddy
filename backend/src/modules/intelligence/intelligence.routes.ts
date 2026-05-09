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
