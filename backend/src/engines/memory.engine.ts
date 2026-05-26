import { MemoryItemModel } from "../modules/memory/memory.model.js";

type MemoryHealth = {
  totalItems: number;
  dueItems: number;
  averageStrength: number;
  averageEaseFactor: number;
  itemsByStrength: {
    strong: number;   // > 0.7
    moderate: number;  // 0.3 - 0.7
    weak: number;      // < 0.3
  };
};

export class MemoryEngine {
  /**
   * Applies the SM-2 algorithm to calculate the next review date and updated strength.
   * @param quality Quality of response (0-5)
   * 0: Complete blackout
   * 1: Incorrect response, but remembered upon seeing correct answer
   * 2: Incorrect response, but easy to remember
   * 3: Correct response recalled with serious difficulty
   * 4: Correct response after a hesitation
   * 5: Perfect response
   */
  static async processRecall(userId: string, noteId: string, quality: number) {
    let memoryItem = await MemoryItemModel.findOne({ userId, noteId });

    if (!memoryItem) {
      // First time reviewing this item
      memoryItem = new MemoryItemModel({
        userId,
        noteId,
        content: "placeholder", // To be populated when generating flashcards
        nextReview: new Date(),
        repetitions: 0,
        interval: 1,
        easeFactor: 2.5,
        strength: 0
      });
    }

    let { repetitions, interval, easeFactor } = memoryItem;

    if (quality >= 3) {
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 4;
      } else if (repetitions === 2) {
        interval = 11;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
    } else {
      repetitions = 0;
      interval = 1;
    }

    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    memoryItem.repetitions = repetitions;
    memoryItem.interval = interval;
    memoryItem.easeFactor = easeFactor;
    
    // Convert quality and repetitions into a simple 0-1 "strength" metric for UI
    memoryItem.strength = Math.min(1, (repetitions * quality) / 25);

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);
    memoryItem.nextReview = nextDate;

    await memoryItem.save();
    return memoryItem;
  }

  /**
   * Registers a self-assessed confidence score for a topic/note.
   * Confidence is 1-5.
   */
  static async registerConfidence(userId: string, noteId: string, confidence: number) {
    let memoryItem = await MemoryItemModel.findOne({ userId, noteId });

    if (!memoryItem) {
      // Initialize if not exists
      memoryItem = new MemoryItemModel({
        userId,
        noteId,
        nextReview: new Date(),
        repetitions: 0,
        interval: 1,
        easeFactor: 2.5,
        strength: 0
      });
    }

    // Boost or reduce the ease factor based on confidence
    // A score of 3 is neutral. 5 is a big boost. 1 is a penalty.
    const adjustment = (confidence - 3) * 0.1;
    memoryItem.easeFactor = Math.max(1.3, memoryItem.easeFactor + adjustment);

    // If confidence is high (4-5), we can push the next review further out immediately
    if (confidence >= 4) {
      memoryItem.interval = Math.round(memoryItem.interval * 1.5);
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + memoryItem.interval);
      memoryItem.nextReview = nextDate;
    } else if (confidence <= 2) {
      // If low, pull it back
      memoryItem.interval = Math.max(1, Math.round(memoryItem.interval * 0.5));
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + memoryItem.interval);
      memoryItem.nextReview = nextDate;
    }

    await memoryItem.save();
    return memoryItem;
  }

  /**
   * Gets the queue of items due for revision today
   */
  static async getRevisionQueue(userId: string) {
    const today = new Date();
    
    return MemoryItemModel.find({
      userId,
      nextReview: { $lte: today }
    }).sort({ nextReview: 1 }).limit(20); // Give them up to 20 items to review
  }

  /**
   * Aggregates memory health statistics for a user.
   */
  static async getMemoryHealth(userId: string): Promise<MemoryHealth> {
    const now = new Date();
    const items = await MemoryItemModel.find({ userId });

    const totalItems = items.length;
    const dueItems = items.filter(item => item.nextReview <= now).length;
    const totalStrength = items.reduce((sum, item) => sum + (item.strength ?? 0), 0);
    const totalEaseFactor = items.reduce((sum, item) => sum + (item.easeFactor ?? 2.5), 0);

    let strong = 0, moderate = 0, weak = 0;
    for (const item of items) {
      const s = item.strength ?? 0;
      if (s > 0.7) strong++;
      else if (s >= 0.3) moderate++;
      else weak++;
    }

    return {
      totalItems,
      dueItems,
      averageStrength: totalItems > 0 ? totalStrength / totalItems : 0,
      averageEaseFactor: totalItems > 0 ? totalEaseFactor / totalItems : 2.5,
      itemsByStrength: { strong, moderate, weak }
    };
  }

  /**
   * Gets the most decayed memory items (lowest strength, most overdue).
   */
  static async getDecayingItems(userId: string, limit = 10) {
    return MemoryItemModel.find({
      userId,
      strength: { $lt: 0.4 }
    })
      .sort({ strength: 1, nextReview: 1 })
      .limit(limit);
  }
}
