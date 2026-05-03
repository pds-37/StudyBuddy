import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { recallController } from "./recall.controller.js";

export const recallRouter = Router();

recallRouter.use(authenticate);

recallRouter.get("/due", recallController.due);
recallRouter.get("/stats", recallController.stats);
recallRouter.post("/review", recallController.review);
