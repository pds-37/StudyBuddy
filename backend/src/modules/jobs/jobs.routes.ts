import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { jobsController } from "./jobs.controller.js";

export const jobsRouter = Router();

jobsRouter.get("/", authenticate, jobsController.getJobs);
jobsRouter.get("/:id", authenticate, jobsController.getJob);
jobsRouter.post("/", authenticate, jobsController.createJob);
