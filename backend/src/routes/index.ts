import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes.js";
import { copilotRouter } from "../modules/copilot/copilot.routes.js";
import { jobsRouter } from "../modules/jobs/jobs.routes.js";
import { notesRouter } from "../modules/notes/notes.routes.js";
import { resumeRouter } from "../modules/resume/resume.routes.js";
import { roadmapsRouter } from "../modules/roadmaps/roadmaps.routes.js";
import { skillsRouter } from "../modules/skills/skills.routes.js";
import { usersRouter } from "../modules/users/users.routes.js";
import { interviewRouter } from "../modules/interview/interview.routes.js";
import { mentorshipRouter } from "../modules/mentorship/mentorship.routes.js";
import { projectRouter } from "../modules/projects/project.routes.js";
import { notificationRouter } from "../modules/notifications/notification.routes.js";
import { syncRouter } from "../modules/sync/sync.routes.js";


export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/skills", skillsRouter);
apiRouter.use("/roadmaps", roadmapsRouter);
apiRouter.use("/notes", notesRouter);
apiRouter.use("/jobs", jobsRouter);
apiRouter.use("/copilot", copilotRouter);
apiRouter.use("/resume", resumeRouter);
apiRouter.use("/interview", interviewRouter);
apiRouter.use("/mentorship", mentorshipRouter);
apiRouter.use("/projects", projectRouter);
apiRouter.use("/notifications", notificationRouter);
apiRouter.use("/sync", syncRouter);

