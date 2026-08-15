import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { usersController } from "./users.controller.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

export const usersRouter = Router();

usersRouter.post("/me/onboarding/upload", authenticate, upload.single("resume"), usersController.uploadOnboardingResume);

usersRouter.get("/me/profile", authenticate, usersController.getProfile);
usersRouter.put("/me/profile", authenticate, usersController.updateProfile);
usersRouter.get("/me/api-keys", authenticate, usersController.getApiKeys);
usersRouter.put("/me/api-keys", authenticate, usersController.updateApiKeys);
usersRouter.get("/me/ai-routes", authenticate, usersController.getAiRoutes);
usersRouter.put("/me/ai-routes", authenticate, usersController.updateAiRoutes);
