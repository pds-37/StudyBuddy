import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env";
import aiRoutes from "./routes/ai";
import authRoutes from "./routes/auth";
import dashboardRoutes from "./routes/dashboard";
import notesRoutes from "./routes/notes";
import remindersRoutes from "./routes/reminders";
import roadmapRoutes from "./routes/roadmap";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true
    })
  );
  app.use(helmet());
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(morgan("dev"));

  app.get("/api/health", (_request, response) => {
    response.json({
      status: "ok",
      database: env.MONGODB_URI ? "mongo" : "memory"
    });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/notes", notesRoutes);
  app.use("/api/reminders", remindersRoutes);
  app.use("/api/roadmap", roadmapRoutes);
  app.use("/api/ai", aiRoutes);

  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    console.error(error);
    response.status(500).json({
      message: "Study Buddy hit an unexpected server issue."
    });
  });

  return app;
}
