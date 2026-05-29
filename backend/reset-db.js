import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function resetDb() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected.");
    
    // Delete all users
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      if (collection.collectionName === "users" || collection.collectionName === "tasks" || collection.collectionName === "behaviorlogs" || collection.collectionName === "memoryitems" || collection.collectionName === "roadmaps") {
        console.log(`Dropping collection: ${collection.collectionName}`);
        await collection.deleteMany({});
      }
    }
    
    console.log("Database reset successfully.");
  } catch (error) {
    console.error("Error resetting DB:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

resetDb();
