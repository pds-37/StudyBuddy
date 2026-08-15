import { type RequestHandler } from "express";
import { resumeService } from "./resume.service.js";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

/** Generates role-specific resume improvements. */
const tailor: RequestHandler = async (request, response, next) => {
  try {
    const result = await resumeService.tailorResume(request.userId ?? "", request.body);
    response.json(result);
  } catch (error) {
    next(error);
  }
};

const uploadAndTailor: RequestHandler = async (request, response, next) => {
  try {
    const files = request.files as { [fieldname: string]: Express.Multer.File[] };
    const resumeFile = files?.resume?.[0];
    const jdFile = files?.jd?.[0];

    if (!resumeFile || !jdFile) {
      return response.status(400).json({ error: "Both resume and jd files are required" });
    }

    const targetRole = request.body.targetRole || "Tailored Role";
    const mode = request.body.mode || "Standard";

    let currentResume = "";
    if (resumeFile.mimetype === "application/pdf") {
      const data = await pdfParse(resumeFile.buffer);
      currentResume = data.text;
    } else {
      currentResume = resumeFile.buffer.toString("utf-8");
    }

    let jobDescription = "";
    if (jdFile.mimetype === "application/pdf") {
      const data = await pdfParse(jdFile.buffer);
      jobDescription = data.text;
    } else {
      jobDescription = jdFile.buffer.toString("utf-8");
    }

    const result = await resumeService.tailorResume(request.userId ?? "", {
      currentResume,
      jobDescription,
      targetRole,
      mode
    });

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
  uploadAndTailor,
  getVersions,
  getVersion,
  deleteVersion
};
