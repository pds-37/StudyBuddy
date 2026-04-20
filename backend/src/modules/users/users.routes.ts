import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { usersController } from "./users.controller.js";

export const usersRouter = Router();

usersRouter.get("/me/profile", authenticate, usersController.getProfile);
usersRouter.put("/me/profile", authenticate, usersController.updateProfile);
