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
      cognitiveLoad: Math.min(100, (100 - Math.round(newConsistency)) + Math.round(skipRate)),
      procrastinationLevel: pending > 3 ? "high" : pending > 1 ? "medium" : "low",
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
    // Recalculate stress index to sync anxiety levels and keep profile fresh
    await this.calculateStressIndex(userId);
  }

  /**
   * Calculates the dynamic Stress Index (0-100) for a user based on:
   * 1. Consecutive task skips
   * 2. Latency/response time in answers (e.g. mock interview answers)
   * 3. Friction indicators (e.g. mouse movement speed variations, click rates, repeated keystrokes)
   */
  static async calculateStressIndex(userId: string): Promise<number> {
    const user = await UserModel.findById(userId);
    if (!user) return 0;

    // Fetch the last 20 behavior logs to analyze recent behavioral signals
    const logs = await BehaviorLogModel.find({ userId })
      .sort({ timestamp: -1 })
      .limit(20);

    let stressScore = 15; // baseline stress

    if (logs.length === 0) return stressScore;

    // Heuristics 1: Consecutive task skips
    let consecutiveSkips = 0;
    for (const log of logs) {
      if (log.action === "task_skipped") {
        consecutiveSkips++;
      } else if (log.action === "task_completed" || log.action === "revision_completed") {
        break; // broke the chain
      }
    }
    // Each consecutive skip increases stress heavily (+15 per skip, capped at +45)
    stressScore += Math.min(45, consecutiveSkips * 15);

    // Heuristics 2: Latency in answers (mock interview or response delay)
    // We look at logs with metadata containing latency or responseTime
    const latencyLogs = logs.filter(log => log.metadata && (log.metadata.responseTime !== undefined || log.metadata.latency !== undefined));
    if (latencyLogs.length > 0) {
      let totalLatency = 0;
      let latencyCount = 0;
      latencyLogs.forEach(log => {
        const latency = log.metadata.responseTime !== undefined ? log.metadata.responseTime : log.metadata.latency;
        if (typeof latency === "number") {
          totalLatency += latency;
          latencyCount++;
        }
      });
      if (latencyCount > 0) {
        const avgLatencyMs = totalLatency / latencyCount;
        // High latency (>15s or 15000ms) indicates struggling / freezing / high cognitive load
        // Extremely rushed latency (<2s or 2000ms) also indicates rushed behavior/stress
        if (avgLatencyMs > 15000) {
          stressScore += 25; // Overwhelmed / freezing
        } else if (avgLatencyMs < 2000) {
          stressScore += 15; // Rushed / high anxiety
        } else {
          // Normal response time
          stressScore -= 5;
        }
      }
    }

    // Heuristics 3: Mouse friction / keystroke jitter / rapid interaction loops
    const frictionLogs = logs.filter(log => log.metadata && (log.metadata.friction !== undefined || log.metadata.mouseJitter !== undefined || log.metadata.keyJitter !== undefined));
    if (frictionLogs.length > 0) {
      let frictionSum = 0;
      let frictionCount = 0;
      frictionLogs.forEach(log => {
        const friction = log.metadata.friction !== undefined ? log.metadata.friction : (log.metadata.mouseJitter !== undefined ? log.metadata.mouseJitter : log.metadata.keyJitter);
        if (typeof friction === "number") {
          frictionSum += friction;
          frictionCount++;
        }
      });
      if (frictionCount > 0) {
        const avgFriction = frictionSum / frictionCount;
        if (avgFriction > 0.7) {
          stressScore += 20; // highly erratic movement / high friction
        } else if (avgFriction > 0.4) {
          stressScore += 10;
        }
      }
    }

    // Heuristics 4: General context / cognitive load sync
    if (user.behaviorProfile) {
      stressScore += (user.behaviorProfile.cognitiveLoad || 0) * 0.2;
      stressScore += (user.behaviorProfile.burnoutRisk || 0) * 0.2;
    }

    // Ensure stress index is strictly bounds between 0 and 100
    const finalStress = Math.max(0, Math.min(100, Math.round(stressScore)));

    // Save anxietyLevel in user's psychological profile as well to keep profiles synchronized
    if (!user.psychologicalProfile) {
      user.psychologicalProfile = {
        confidence: { skill: 50, execution: 50, interview: 50, learning: 50 },
        motivationState: "steady",
        anxietyLevel: finalStress,
        energyPatterns: { peakFocusWindow: "evening", fatigueTriggers: [] },
        identityNarrative: "Student"
      };
    } else {
      user.psychologicalProfile.anxietyLevel = finalStress;
    }
    
    await user.save();
    return finalStress;
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
