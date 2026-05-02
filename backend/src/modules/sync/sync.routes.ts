import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { syncController } from "./sync.controller.js";

export const syncRouter = Router();

syncRouter.use(authenticate);

// Push notes from C++ agent → web
syncRouter.post("/notes", syncController.pushNotes);

// Pull notes from web → C++ agent
syncRouter.get("/notes/pull", syncController.pullNotes);

// Health check / sync status
syncRouter.get("/status", syncController.getStatus);
