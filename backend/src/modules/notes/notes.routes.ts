import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { notesController } from "./notes.controller.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

export const notesRouter = Router();

notesRouter.use(authenticate);

notesRouter.post("/upload", upload.single("file"), notesController.uploadFile);

// Vector search endpoints
notesRouter.get("/search/vector", notesController.search);
notesRouter.post("/embeddings/update-all", notesController.updateEmbeddings);
notesRouter.post("/ingest", notesController.ingest);
notesRouter.get("/contradictions", notesController.contradictions);

notesRouter.post("/", notesController.create);
notesRouter.get("/", notesController.list);
notesRouter.get("/:id", notesController.get);
notesRouter.post("/:id/resolve-contradiction", notesController.resolveContradiction);
notesRouter.put("/:id", notesController.update);
notesRouter.delete("/:id", notesController.remove);
