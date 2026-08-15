import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { resumeController } from "./resume.controller.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

export const resumeRouter = Router();

resumeRouter.use(authenticate);

resumeRouter.post("/tailor", resumeController.tailor);
resumeRouter.post(
  "/upload-tailor",
  upload.fields([{ name: "resume", maxCount: 1 }, { name: "jd", maxCount: 1 }]),
  resumeController.uploadAndTailor
);
resumeRouter.get("/versions", resumeController.getVersions);
resumeRouter.get("/versions/:id", resumeController.getVersion);
resumeRouter.delete("/versions/:id", resumeController.deleteVersion);
