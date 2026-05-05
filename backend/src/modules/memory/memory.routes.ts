import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { MemoryEngine } from "../../engines/memory.engine.js";

const router = Router();

router.post("/confidence", authenticate, async (req, res, next) => {
  try {
    const { noteId, confidence } = req.body;
    
    if (!noteId || typeof confidence !== "number") {
      return res.status(400).json({ message: "noteId and confidence are required" });
    }

    const item = await MemoryEngine.registerConfidence((req as any).user!.id, noteId, confidence);
    res.json(item);
  } catch (error) {
    next(error);
  }
});

export default router;
