import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { notesController } from "./notes.controller.js";

export const notesRouter = Router();

notesRouter.use(authenticate);

// Vector search endpoints
notesRouter.get("/search/vector", notesController.search);
notesRouter.post("/embeddings/update-all", notesController.updateEmbeddings);

notesRouter.post("/", notesController.create);
notesRouter.get("/", notesController.list);
notesRouter.get("/:id", notesController.get);
notesRouter.put("/:id", notesController.update);
notesRouter.delete("/:id", notesController.remove);
