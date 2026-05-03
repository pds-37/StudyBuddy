import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { mentorController } from "./mentor.controller.js";

export const mentorRouter = Router();

mentorRouter.use(authenticate);

mentorRouter.get("/today", mentorController.today);
mentorRouter.patch("/today/tasks/:taskId", mentorController.updateTask);
