import { type RequestHandler } from "express";
import { jobsService } from "./jobs.service.js";
import { createJobSchema, jobsQuerySchema } from "./jobs.validation.js";

/** Retrieves jobs with optional user-specific matching. */
const getJobs: RequestHandler = async (request, response, next) => {
  try {
    const query = jobsQuerySchema.parse(request.query);
    const jobs = await jobsService.getJobs(request.userId, query.limit);
    response.json({ jobs });
  } catch (error) {
    next(error);
  }
};

/** Retrieves a single job by ID. */
const getJob: RequestHandler = async (request, response, next) => {
  try {
    const jobId = String(request.params.id ?? "");
    const job = await jobsService.getJob(jobId);
    response.json({ job });
  } catch (error) {
    next(error);
  }
};

/** Creates a new job listing. */
const createJob: RequestHandler = async (request, response, next) => {
  try {
    const body = createJobSchema.parse(request.body);
    const job = await jobsService.createJob(body);
    response.status(201).json({ job });
  } catch (error) {
    next(error);
  }
};

export const jobsController = {
  getJobs,
  getJob,
  createJob
};
