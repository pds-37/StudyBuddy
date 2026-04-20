import { type RequestHandler } from "express";
import { ZodError, type ZodTypeAny } from "zod";

/** Validates request params, query, or body using a Zod schema object. */
export function validateRequest(schema: ZodTypeAny): RequestHandler {
  return (request, response, next) => {
    try {
      schema.parse({
        body: request.body,
        query: request.query,
        params: request.params
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        response.status(400).json({
          message: "Invalid request.",
          issues: error.flatten()
        });
        return;
      }

      next(error);
    }
  };
}
