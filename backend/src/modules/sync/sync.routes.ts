import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { syncController } from "./sync.controller.js";

export const syncRouter = Router();

syncRouter.use(authenticate);

// Push notes from C++ agent → web
syncRouter.post("/notes", syncController.pushNotes);

// Pull notes from web → C++ agent
syncRouter.get("/notes/pull", syncController.pullNotes);

// Pull extracted concept graph state from web -> local/cloud clients
syncRouter.get("/concepts/pull", syncController.pullConcepts);

// Pull recall schedule and memory strength state
syncRouter.get("/memory/pull", syncController.pullMemory);

// Push local recall reviews from offline clients
syncRouter.post("/recall", syncController.pushRecall);

// Pull mentor memory and recent intelligence events
syncRouter.get("/mentor-memory/pull", syncController.pullMentorMemory);

// Health check / sync status
syncRouter.get("/status", syncController.getStatus);
