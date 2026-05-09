import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { knowledgeService } from "./knowledge.service.js";

const router = Router();

router.get("/graph", authenticate, async (req, res, next) => {
  try {
    const graph = await knowledgeService.getGraph(req.userId!);
    res.json(graph);
  } catch (error) {
    next(error);
  }
});

router.get("/concepts/:id", authenticate, async (req, res, next) => {
  try {
    const detail = await knowledgeService.getConceptDetail(req.userId!, req.params.id as string);
    res.json(detail);
  } catch (error) {
    next(error);
  }
});

router.get("/interview-readiness", authenticate, async (req, res, next) => {
  try {
    const readiness = await knowledgeService.getInterviewReadiness(req.userId!);
    res.json(readiness);
  } catch (error) {
    next(error);
  }
});

export default router;
