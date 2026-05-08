import { Router } from "express";
import { careerController } from "./career.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";

const careerRouter = Router();

careerRouter.use(authenticate);

careerRouter.get("/recommendations", careerController.getRecommendations);
careerRouter.get("/readiness", careerController.getReadiness);
careerRouter.post("/match/:jobId", careerController.matchJob);
careerRouter.get("/applications", careerController.getApplications);

export { careerRouter };
