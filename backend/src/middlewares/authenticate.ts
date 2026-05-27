import { type RequestHandler } from "express";
import { authService } from "../modules/auth/auth.service.js";
import { UserModel } from "../modules/users/user.model.js";
import { requestContextStorage } from "../core/context.js";

/** Verifies the bearer access token and attaches the user id to the request. */
export const authenticate: RequestHandler = async (request, response, next) => {
  const header = request.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;

  if (!token) {
    response.status(401).json({ message: "Authentication token is required." });
    return;
  }

  try {
    let userId: string;

    if (token === "demo_guest") {
      const demoId = "000000000000000000000001";
      userId = demoId;
      request.userId = demoId;
      request.authToken = token;

      // Seed the demo guest user in MongoDB if not already seeded
      try {
        const exists = await UserModel.findById(demoId).lean();
        if (!exists) {
          await UserModel.create({
            _id: demoId,
            email: "demo@student.studybuddy.ai",
            name: "Aarav Sharma",
            targetRoles: ["Frontend Engineer", "AI Frontend Engineer"],
            currentSkills: ["React", "JavaScript", "DSA Basics", "REST APIs"],
            experienceLevel: "intermediate",
            onboardingCompleted: true
          });
        }
      } catch (seedErr) {
        console.error("Failed to seed demo guest user:", seedErr);
      }
    } else {
      const payload = authService.verifyAccessToken(token);
      userId = payload.userId;
      request.userId = payload.userId;
      request.authToken = token;
    }

    // Fetch the user's custom API keys
    const user = await UserModel.findById(userId).select("+apiKeys").lean();
    const apiKeys = user?.apiKeys || {};

    // Execute downstream middleware and route handlers inside the RequestContext context
    requestContextStorage.run({ userId, apiKeys }, () => {
      next();
    });
  } catch (error) {
    response.status(401).json({ message: "Invalid or expired authentication token." });
  }
};
