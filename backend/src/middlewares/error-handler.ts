import { type ErrorRequestHandler } from "express";
import { ZodError } from "zod";

/** Converts thrown errors into JSON responses. */
export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ZodError) {
    const errorDetails = error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join(", ");
    response.status(400).json({
      message: `Request validation failed: ${errorDetails}`,
      issues: error.issues
    });
    return;
  }

  const statusCode = error.statusCode ?? 500;

  response.status(statusCode).json({
    message: error.message ?? "Internal server error",
    stack: error.stack,
    name: error.name
  });
};
