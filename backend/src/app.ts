import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { notFound } from "./middlewares/not-found.js";
import { apiRouter } from "./routes/index.js";

/** Checks whether the incoming browser origin is allowed to call the API. */
function isAllowedOrigin(origin: string) {
  if (env.clientOrigins.includes(origin)) {
    return true;
  }

  return env.clientOriginRegexes.some((pattern) => pattern.test(origin));
}

/** Creates the Express application without starting the network listener. */
export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        // Health checks, curl, and same-origin requests may not send an Origin header.
        if (!origin) {
          callback(null, true);
          return;
        }

        callback(null, isAllowedOrigin(origin));
      },
      credentials: true
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan(env.logLevel));

  app.get("/health", (_request, response) => {
    response.json({ status: "ok", service: "studybuddy-api" });
  });

  app.get("/api/test", (_request, response) => {
    response.json({ message: "API is reachable" });
  });

  app.use("/api", apiRouter);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
