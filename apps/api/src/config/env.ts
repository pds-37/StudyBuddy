import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  CLIENT_URL: z.string().default("http://localhost:5173"),
  JWT_SECRET: z.string().default("study-buddy-dev-secret"),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash-lite"),
  MONGODB_URI: z.string().optional(),
  MONGODB_DB: z.string().default("studybuddy")
});

export const env = envSchema.parse(process.env);
