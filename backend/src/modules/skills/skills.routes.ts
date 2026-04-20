import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { skillsController } from "./skills.controller.js";

export const skillsRouter = Router();

skillsRouter.get("/search", authenticate, skillsController.search);
skillsRouter.get("/gap", authenticate, skillsController.gap);
