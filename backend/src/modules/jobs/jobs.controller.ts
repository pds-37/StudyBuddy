import { RequestHandler } from "express";
import { jobsService } from "./jobs.service.js";

/** Gets personalized job recommendations. */
export const getRecommendations: RequestHandler = async (req, res, next) => {
  try {
    const recommendations = await jobsService.getRecommendations(req.userId!);
    res.json({ recommendations });
  } catch (error) {
    next(error);
  }
};

/** Gets the student's career readiness profile. */
export const getReadiness: RequestHandler = async (req, res, next) => {
  try {
    const readiness = await jobsService.getReadiness(req.userId!);
    res.json({ readiness });
  } catch (error) {
    next(error);
  }
};

/** Matches a specific job to the student. */
export const matchJob: RequestHandler = async (req, res, next) => {
  try {
    const match = await jobsService.matchJob(req.userId!, req.params.jobId as string);
    res.json({ match });
  } catch (error) {
    next(error);
  }
};

/** Gets all user applications. */
export const getApplications: RequestHandler = async (req, res, next) => {
  try {
    res.json({ applications: [] });
  } catch (error) {
    next(error);
  }
};

/** Gets raw job listings. */
export const getJobs: RequestHandler = async (req, res, next) => {
  try {
    const jobs = await jobsService.getJobs(req.userId!);
    res.json({ jobs });
  } catch (error) {
    next(error);
  }
};

/** Gets a single job listing. */
export const getJob: RequestHandler = async (req, res, next) => {
  try {
    const job = await jobsService.getJob(req.params.id as string);
    res.json({ job });
  } catch (error) {
    next(error);
  }
};

export const jobsController = {
  getRecommendations,
  getReadiness,
  matchJob,
  getApplications,
  getJobs,
  getJob
};
