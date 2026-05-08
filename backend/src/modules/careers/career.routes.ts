import { Router } from "express";
import { careerController } from "./career.controller.js";
import { authMiddleware } from "../../middlewares/auth.js";

const careerRouter = Router();

careerRouter.use(authMiddleware);

careerRouter.get("/recommendations", careerController.getRecommendations);
careerRouter.get("/readiness", careerController.getReadiness);
careerRouter.post("/match/:jobId", careerController.matchJob);
careerRouter.get("/applications", careerController.getApplications);

export { careerRouter };
