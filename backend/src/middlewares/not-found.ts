import { type RequestHandler } from "express";

/** Handles unknown API routes. */
export const notFound: RequestHandler = (request, response) => {
  response.status(404).json({
    message: `Route not found: ${request.method} ${request.originalUrl}`
  });
};
