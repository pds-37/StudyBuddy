import { type RequestHandler } from "express";
import { resumeService } from "./resume.service.js";
import { tailorResumeSchema } from "./resume.validation.js";

/** Generates role-specific resume improvements. */
const tailor: RequestHandler = async (request, response, next) => {
  try {
    const body = tailorResumeSchema.parse(request.body);
    const result = await resumeService.tailorResume(request.userId ?? "", body);
    response.json({ result });
  } catch (error) {
    next(error);
  }
};

export const resumeController = {
  tailor
};

