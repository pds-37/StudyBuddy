import crypto from "node:crypto";

import { Router } from "express";
import { z } from "zod";

import { requireAuth } from "../middleware/requireAuth";
import { store } from "../data/store";

const router = Router();

const milestoneSchema = z.object({
  topic: z.string().min(2),
  description: z.string().min(2),
  orderIndex: z.number().int().positive(),
  status: z.enum(["upcoming", "in_progress", "completed"]),
  estimatedNotes: z.number().int().positive(),
  actualNotes: z.number().int().min(0)
});

const roadmapSchema = z.object({
  goalTitle: z.string().min(4),
  subject: z.string().min(2),
  targetDate: z.string(),
  milestones: z.array(milestoneSchema).min(1)
});

router.use(requireAuth);

router.get("/active", async (request, response) => {
  const roadmap = await store.getActiveRoadmap(request.user!.id);
  response.json({ roadmap });
});

router.post("/", async (request, response) => {
  const parsed = roadmapSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ message: "Roadmap data is incomplete." });
    return;
  }

  const roadmap = await store.saveRoadmap({
    userId: request.user!.id,
    goalTitle: parsed.data.goalTitle,
    subject: parsed.data.subject,
    targetDate: parsed.data.targetDate,
    milestones: parsed.data.milestones.map((milestone) => ({
      ...milestone,
      id: `milestone_${crypto.randomUUID()}`
    }))
  });

  response.status(201).json({ roadmap });
});

router.delete("/active", async (request, response) => {
  await store.clearActiveRoadmap(request.user!.id);
  response.status(204).send();
});

export default router;
