import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { resumeController } from "./resume.controller.js";

export const resumeRouter = Router();

resumeRouter.use(authenticate);

resumeRouter.post("/tailor", resumeController.tailor);
resumeRouter.get("/versions", resumeController.getVersions);
resumeRouter.get("/versions/:id", resumeController.getVersion);
resumeRouter.delete("/versions/:id", resumeController.deleteVersion);
