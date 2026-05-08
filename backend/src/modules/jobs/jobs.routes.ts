import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { jobsController } from "./jobs.controller.js";

export const jobsRouter = Router();

jobsRouter.get("/recommendations", authenticate, jobsController.getRecommendations);
jobsRouter.get("/readiness", authenticate, jobsController.getReadiness);
jobsRouter.post("/match/:jobId", authenticate, jobsController.matchJob);
jobsRouter.get("/applications", authenticate, jobsController.getApplications);
jobsRouter.get("/", authenticate, jobsController.getJobs);
jobsRouter.get("/:id", authenticate, jobsController.getJob);
