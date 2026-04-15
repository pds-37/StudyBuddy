import { env } from "./config/env";
import { store } from "./data/store";
import { createApp } from "./app";

async function bootstrap() {
  await store.init();
  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`Study Buddy API running on http://localhost:${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start Study Buddy API", error);
  process.exit(1);
});
