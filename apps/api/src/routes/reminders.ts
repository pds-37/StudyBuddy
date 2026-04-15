import { Router } from "express";
import { z } from "zod";

import { requireAuth } from "../middleware/requireAuth";
import { store } from "../data/store";

const router = Router();
const reviewSchema = z.object({
  outcome: z.enum(["correct", "wrong"])
});

router.use(requireAuth);

router.get("/", async (request, response) => {
  const [reminders, learningItems] = await Promise.all([
    store.listReminders(request.user!.id),
    store.listLearningItems(request.user!.id)
  ]);

  response.json({
    reminders,
    revisionQueue: learningItems.filter((item) => new Date(item.dueAt).getTime() <= Date.now())
  });
});

router.post("/revision/:itemId", async (request, response) => {
  const parsed = reviewSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ message: "Review outcome is missing." });
    return;
  }

  const item = await store.reviewLearningItem(request.user!.id, request.params.itemId, parsed.data.outcome);
  if (!item) {
    response.status(404).json({ message: "Revision item not found." });
    return;
  }

  response.json({ item });
});

export default router;
