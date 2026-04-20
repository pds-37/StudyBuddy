import { Router } from "express";
import { authenticate as requireAuth } from "../../middlewares/authenticate.js";
import * as projectController from "./project.controller.js";

export const projectRouter = Router();

projectRouter.use(requireAuth);

projectRouter.get("/matches", projectController.getMatches);
projectRouter.patch("/matches/:id/status", projectController.updateProjectStatus);
