import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { resumeController } from "./resume.controller.js";

export const resumeRouter = Router();

resumeRouter.use(authenticate);

resumeRouter.post("/tailor", resumeController.tailor);

