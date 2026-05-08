import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.js";
import { jobsController } from "./jobs.controller.js";

export const jobsRouter = Router();

jobsRouter.get("/recommendations", authMiddleware, jobsController.getRecommendations);
jobsRouter.get("/readiness", authMiddleware, jobsController.getReadiness);
jobsRouter.post("/match/:jobId", authMiddleware, jobsController.matchJob);
jobsRouter.get("/applications", authMiddleware, jobsController.getApplications);
jobsRouter.get("/", authMiddleware, jobsController.getJobs);
jobsRouter.get("/:id", authMiddleware, jobsController.getJob);
