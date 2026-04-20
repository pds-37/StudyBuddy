import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import { createApp } from "./app.js";
import { skillsService } from "./modules/skills/skills.service.js";

/** Starts the HTTP server for local development or Render deployment. */
async function bootstrap() {
  await connectDatabase();
  await skillsService.seedDefaultSkills();

  const app = createApp();

  app.listen(env.port, "0.0.0.0", () => {
    console.log(`StudyBuddy API listening on port ${env.port}`);
  });
}

void bootstrap().catch((error) => {
  console.error("Failed to start StudyBuddy API", error);
  process.exit(1);
});
