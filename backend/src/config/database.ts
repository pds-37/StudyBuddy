import mongoose from "mongoose";
import { env } from "./env.js";

/** Opens the MongoDB connection when database-backed features are implemented. */
export async function connectDatabase() {
  await mongoose.connect(env.mongoUri, {
    dbName: env.mongoDbName
  });
}

/** Closes the MongoDB connection during tests or graceful shutdown. */
export async function disconnectDatabase() {
  await mongoose.disconnect();
}
