import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { companyPrepController } from "./company-prep.controller.js";

export const companyPrepRouter = Router();

companyPrepRouter.use(authenticate);

companyPrepRouter.get("/companies", companyPrepController.listCompanyTypes);
companyPrepRouter.get("/companies/:companyTypeId", companyPrepController.getCompanyType);
companyPrepRouter.post("/companies/:companyTypeId/start-prep", companyPrepController.startPrep);
companyPrepRouter.get("/questions", companyPrepController.listQuestions);
companyPrepRouter.patch("/questions/:questionId/status", companyPrepController.updateQuestionStatus);
companyPrepRouter.post("/questions/:questionId/save-note", companyPrepController.saveQuestionToNotes);
