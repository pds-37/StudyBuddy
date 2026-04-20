import { type NextFunction, type Request, type RequestHandler, type Response } from "express";

/** Wraps async route handlers and forwards errors to Express middleware. */
export function asyncHandler(handler: (request: Request, response: Response, next: NextFunction) => Promise<void>): RequestHandler {
  return (request, response, next) => {
    void handler(request, response, next).catch(next);
  };
}
