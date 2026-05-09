import { type RequestHandler } from "express";
import { resumeService } from "./resume.service.js";

/** Generates role-specific resume improvements. */
const tailor: RequestHandler = async (request, response, next) => {
  try {
    const result = await resumeService.tailorResume(request.userId ?? "", request.body);
    response.json(result);
  } catch (error) {
    next(error);
  }
};

const getVersions: RequestHandler = async (request, response, next) => {
  try {
    const versions = await resumeService.getVersions(request.userId ?? "");
    response.json(versions);
  } catch (error) {
    next(error);
  }
};

const getVersion: RequestHandler = async (request, response, next) => {
  try {
    const version = await resumeService.getVersion(request.userId ?? "", request.params.id as string);
    response.json(version);
  } catch (error) {
    next(error);
  }
};

const deleteVersion: RequestHandler = async (request, response, next) => {
  try {
    await resumeService.deleteVersion(request.userId ?? "", request.params.id as string);
    response.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const resumeController = {
  tailor,
  getVersions,
  getVersion,
  deleteVersion
};
