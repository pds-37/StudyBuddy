import { UserModel } from "../modules/users/user.model.js";
import { TaskModel } from "../modules/tasks/task.model.js";
import { BehaviorLogModel } from "../modules/behavior/behavior.model.js";

export class BehaviorEngine {
  /**
   * Calculates the consistency score based on recent tasks
   * and updates the user's behavior profile.
   */
  static async updateConsistencyScore(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) return null;

    // Look at tasks from the last 14 days
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const recentTasks = await TaskModel.find({
      userId,
      scheduledAt: { $gte: twoWeeksAgo },
    });

    if (recentTasks.length === 0) return user;

    const completed = recentTasks.filter(t => t.status === "completed").length;
    const skipped = recentTasks.filter(t => t.status === "skipped").length;
    const pending = recentTasks.filter(t => t.status === "pending" && t.scheduledAt < new Date()).length;

    const totalResolved = completed + skipped + pending;
    
    // Simple consistency metric: % of tasks actually completed vs total resolved/overdue
    let newConsistency = totalResolved > 0 ? (completed / totalResolved) * 100 : 0;
    
    // Skip rate
    let skipRate = totalResolved > 0 ? (skipped / totalResolved) * 100 : 0;

    user.behaviorProfile = {
      consistencyScore: Math.round(newConsistency),
      skipRate: Math.round(skipRate),
      avgSessionTime: user.behaviorProfile?.avgSessionTime || 0,
      preferredStudyTime: user.behaviorProfile?.preferredStudyTime || "evening",
      lastActivityAt: new Date(),
      burnoutRisk: Math.round(skipRate) > 40 ? Math.min(100, skipRate * 1.5) : 0,
      cognitiveLoad: Math.min(100, (100 - Math.round(newConsistency)) + Math.round(skipRate))
    };

    await user.save();
    return user;
  }

  /**
   * Logs a user behavior and recalculates their consistency score.
   */
  static async logAction(userId: string, action: string, metadata: Record<string, any> = {}) {
    await BehaviorLogModel.create({
      userId,
      action,
      metadata,
      timestamp: new Date()
    });
    
    // After logging, recalculate consistency to keep profile fresh
    await this.updateConsistencyScore(userId);
  }

  /**
   * Evaluates if a user is currently at risk of falling behind
   */
  static async evaluateRisk(userId: string): Promise<"high" | "medium" | "low"> {
    const user = await UserModel.findById(userId);
    if (!user || !user.behaviorProfile) return "low";

    const score = user.behaviorProfile.consistencyScore;
    
    if (score < 40) return "high";
    if (score < 70) return "medium";
    return "low";
  }
}
