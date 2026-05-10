import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { mentorController } from "./mentor.controller.js";

export const mentorRouter = Router();

mentorRouter.use(authenticate);

mentorRouter.get("/today", mentorController.today);
mentorRouter.post("/strategy", mentorController.adoptStrategy);
mentorRouter.patch("/today/tasks/:taskId", mentorController.updateTask);
mentorRouter.post("/today/tasks/:taskId/feedback", mentorController.recordTaskFeedback);
