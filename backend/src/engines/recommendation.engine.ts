import { TaskModel } from "../modules/tasks/task.model.js";
import { MemoryItemModel } from "../modules/memory/memory.model.js";
import { UserModel } from "../modules/users/user.model.js";
import { BehaviorEngine } from "./behavior.engine.js";

export class RecommendationEngine {
  /**
   * The core AI router endpoint. Looks at behavior, memory, and tasks
   * to decide the absolute best thing the user should do right now.
   */
  static async getNextBestAction(userId: string) {
    const riskLevel = await BehaviorEngine.evaluateRisk(userId);
    
    // 1. If risk is high, prioritize an easy win or a quick review
    if (riskLevel === "high") {
      const user = await UserModel.findById(userId);
      if (user?.behaviorProfile && user.behaviorProfile.consistencyScore < 30) {
        return {
          action: "recalibrate",
          reason: "You've been having a tough time keeping up. Should we recalibrate your roadmap to better fit your current pace?",
          data: null
        };
      }

      const easyTask = await TaskModel.findOne({ 
        userId, 
        status: "pending", 
        difficulty: "easy" 
      }).sort({ scheduledAt: 1 });
      
      if (easyTask) {
        return {
          action: "task",
          reason: "You've been skipping tasks recently. Let's get back on track with something quick.",
          data: easyTask
        };
      }
    }

    // 2. Check for overdue memory reviews (Spaced Repetition)
    const overdueMemory = await MemoryItemModel.findOne({
      userId,
      nextReview: { $lte: new Date() }
    }).sort({ nextReview: 1 });

    if (overdueMemory) {
      return {
        action: "revision",
        reason: "You have knowledge that is about to fade from memory. Quick review?",
        data: overdueMemory
      };
    }

    // 3. Otherwise, just give them the next scheduled roadmap task
    const nextTask = await TaskModel.findOne({
      userId,
      status: "pending",
      scheduledAt: { $lte: new Date() }
    }).sort({ scheduledAt: 1 });

    if (nextTask) {
      return {
        action: "task",
        reason: "This is next on your career roadmap.",
        data: nextTask
      };
    }

    // 4. Default fallback
    return {
      action: "generate",
      reason: "You're all caught up! Time to generate the next phase of your roadmap.",
      data: null
    };
  }
}
