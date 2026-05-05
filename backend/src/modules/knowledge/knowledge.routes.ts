import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { knowledgeService } from "./knowledge.service.js";

const router = Router();

router.get("/graph", authenticate, async (req, res, next) => {
  try {
    const graph = await knowledgeService.getGraph((req as any).user!.id);
    res.json(graph);
  } catch (error) {
    next(error);
  }
});

export default router;
