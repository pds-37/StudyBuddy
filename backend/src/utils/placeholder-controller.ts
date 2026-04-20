import { type RequestHandler } from "express";

/** Returns a standard response for feature routes that are scaffolded only. */
export function placeholderController(moduleName: string): RequestHandler {
  return (_request, response) => {
    response.status(501).json({
      module: moduleName,
      message: `${moduleName} is scaffolded and will be implemented in a later step.`
    });
  };
}
