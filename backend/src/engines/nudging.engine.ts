import { UserModel } from "../modules/users/user.model.js";
import { TaskModel } from "../modules/tasks/task.model.js";
import { notificationService } from "../modules/notifications/notification.service.js";

/**
 * Nudging Engine
 * Monitors user patterns and proactively sends interventions (Push/In-app).
 */
export class NudgingEngine {
  /**
   * Evaluates all nudges for a specific user.
   */
  static async evaluateNudges(userId: string) {
    await this.checkInactivity(userId);
    await this.checkTaskHoarding(userId);
  }

  /**
   * Scans for users who need a "nudge" today.
   * Can be called by a cron job or during a global system heartbeat.
   */
  static async processDailyNudges() {
    const users = await UserModel.find({});
    
    for (const user of users) {
      await this.checkInactivity(String(user._id));
      await this.checkTaskHoarding(String(user._id));
    }
  }

  /**
   * Checks if user has been inactive for > 24 hours.
   */
  static async checkInactivity(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) return;

    const lastSeen = user.updatedAt;
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setDate(twentyFourHoursAgo.getDate() - 1);

    if (lastSeen < twentyFourHoursAgo) {
      await notificationService.createNotification(
        userId,
        "Veda Misses You",
        "It's been over 24 hours since your last session. Consistency is the key to mastery—let's do a quick 10-minute review?",
        "warning",
        "/dashboard"
      );
    }
  }

  /**
   * Checks if user has too many pending tasks (> 10).
   */
  static async checkTaskHoarding(userId: string) {
    const pendingCount = await TaskModel.countDocuments({ userId, status: "pending" });
    
    if (pendingCount > 10) {
      await notificationService.createNotification(
        userId,
        "Clean Up Your Roadmap",
        `You have ${pendingCount} pending tasks. Hoarding tasks causes cognitive load. Let's recalibrate or clear some out?`,
        "info",
        "/onboarding"
      );
    }
  }

  /**
   * Checks if a high-strength topic is about to fade (Spaced Repetition).
   */
  static async checkMemoryFade(userId: string, topic: string) {
    await notificationService.createNotification(
      userId,
      "Retention Warning",
      `Your mastery of "${topic}" is entering the forgetting curve. A 5-minute recall session now will lock it in for weeks.`,
      "warning",
      "/recall"
    );
  }
}
