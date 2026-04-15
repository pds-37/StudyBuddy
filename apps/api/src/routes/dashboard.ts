import { Router } from "express";

import { requireAuth } from "../middleware/requireAuth";
import { store } from "../data/store";

const router = Router();

router.use(requireAuth);

router.get("/", async (request, response) => {
  const payload = await store.getDashboard(request.user!.id);
  response.json(payload);
});

export default router;
