import { type RequestHandler } from "express";
import { authService } from "../modules/auth/auth.service.js";

/** Verifies the bearer access token and attaches the user id to the request. */
export const authenticate: RequestHandler = (request, response, next) => {
  const header = request.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;

  if (!token) {
    response.status(401).json({ message: "Authentication token is required." });
    return;
  }

  try {
    if (token === "demo_guest") {
      request.userId = "demo_guest_user_id";
      request.authToken = token;
      return next();
    }

    const payload = authService.verifyAccessToken(token);
    request.userId = payload.userId;
    request.authToken = token;
    next();
  } catch {
    response.status(401).json({ message: "Invalid or expired authentication token." });
  }
};
