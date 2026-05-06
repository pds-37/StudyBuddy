import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { roadmapsController } from "./roadmaps.controller.js";

export const roadmapsRouter = Router();

roadmapsRouter.use(authenticate);

roadmapsRouter.post("/generate", roadmapsController.generate);
roadmapsRouter.get("/generate-from-gaps", roadmapsController.generateFromGaps);
roadmapsRouter.get("/", roadmapsController.get);
roadmapsRouter.patch("/tasks/:taskId", roadmapsController.updateTaskStatus);
roadmapsRouter.get("/tasks/:taskId/quiz", roadmapsController.generateQuiz);
roadmapsRouter.patch("/:roadmapId/rate", roadmapsController.rate);

