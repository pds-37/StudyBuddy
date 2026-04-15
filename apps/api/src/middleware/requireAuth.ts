import type { NextFunction, Request, Response } from "express";

import { readSessionCookie, verifySessionToken } from "../utils/auth";

export function requireAuth(request: Request, response: Response, next: NextFunction) {
  try {
    const token = readSessionCookie(request.cookies);
    if (!token) {
      response.status(401).json({
        message: "Please sign in first."
      });
      return;
    }

    request.user = verifySessionToken(token);
    next();
  } catch {
    response.status(401).json({
      message: "Your session expired. Please sign in again."
    });
  }
}
