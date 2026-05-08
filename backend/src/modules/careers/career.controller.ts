import { RequestHandler } from "express";
import { CareerService } from "./career.service.js";

/** Gets personalized job recommendations. */
const getRecommendations: RequestHandler = async (req, res, next) => {
  try {
    const recommendations = await CareerService.getRecommendations(req.userId!);
    res.json({ recommendations });
  } catch (error) {
    next(error);
  }
};

/** Gets the student's career readiness profile. */
const getReadiness: RequestHandler = async (req, res, next) => {
  try {
    const readiness = await CareerService.updateReadinessProfile(req.userId!);
    res.json({ readiness });
  } catch (error) {
    next(error);
  }
};

/** Matches a specific job to the student. */
const matchJob: RequestHandler = async (req, res, next) => {
  try {
    const match = await CareerService.matchJob(req.userId!, req.params.jobId as string);
    res.json({ match });
  } catch (error) {
    next(error);
  }
};

/** Gets all user applications. */
const getApplications: RequestHandler = async (req, res, next) => {
  try {
    // Placeholder logic for fetching applications
    res.json({ applications: [] });
  } catch (error) {
    next(error);
  }
};

export const careerController = {
  getRecommendations,
  getReadiness,
  matchJob,
  getApplications
};
