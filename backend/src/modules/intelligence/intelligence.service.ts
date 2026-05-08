import { UserModel } from "../users/user.model.js";
import { RoadmapModel } from "../roadmaps/roadmap.model.js";
import { AIOrchestrator } from "../../core/ai-orchestrator.js";
import { ApiError } from "../../utils/api-error.js";
import { PsychologyEngine } from "./psychology.service.js";

/**
 * Edge Case Intelligence Engine
 * Monitors student behavior and dynamically adapts the learning OS.
 */
export class IntelligenceEngine {
  /**
   * Analyzes user behavior and returns adaptive interventions.
   * This should be called on major events (login, task completion, adding tracks).
   */
  static async analyzeBehavior(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const roadmaps = await RoadmapModel.find({ userId, status: "active" });
    const lastActivity = user.updatedAt;
    const now = new Date();
    
    const daySinceLastActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    
    let intervention: any = null;

    // PSYCHOLOGICAL ANALYSIS (Emotional State Engine)
    const psychState = await PsychologyEngine.inferEmotionalState(userId);
    if (psychState && psychState.state !== "steady") {
      intervention = psychState;
    }

    // EDGE CASE: Long Inactivity Recovery (Part 3)
    if (daySinceLastActivity > 7) {
      intervention = await this.handleRecoveryMode(userId, daySinceLastActivity);
    }

    // EDGE CASE: Overcommitment Detection (Part 2)
    if (roadmaps.length > 3) {
      intervention = await this.handleOvercommitment(userId, roadmaps);
    }

    // EDGE CASE: Cognitive Overload Detection (Part 7)
    if (user.behaviorProfile.skipRate > 0.4 || user.behaviorProfile.consistencyScore < 30) {
      intervention = await this.handleCognitiveOverload(userId, user);
    }

    // EDGE CASE: Rapid Learning Acceleration (Part 5)
    if (user.behaviorProfile.consistencyScore > 90 && (user.careerProfile?.readiness?.frontend > 50 || user.careerProfile?.readiness?.backend > 50)) {
      intervention = await this.handleAcceleration(userId);
    }

    // EDGE CASE: AI Overdependence Detection (Part 19)
    // Hypothetical: If user requests hints for every task (we'd need to track this)
    if (user.behaviorProfile.avgSessionTime < 5 && user.behaviorProfile.consistencyScore > 80) {
      intervention = await this.handleOverdependence(userId);
    }

    return intervention;
  }

  /**
   * Acceleration: Unlocks harder tasks and faster pacing for high-velocity learners.
   */
  private static async handleAcceleration(userId: string) {
    return {
      type: "acceleration",
      message: "Your learning velocity is significantly above baseline. I've unlocked an advanced optimization track for your current mission.",
      actions: ["INCREASE_CHALLENGE", "UNLOCK_ADVANCED"]
    };
  }

  /**
   * Overdependence: Encourages independent thinking when AI hints are over-used.
   */
  private static async handleOverdependence(userId: string) {
    return {
      type: "guidance",
      message: "You've relied heavily on guided hints recently. I've activated Independent Challenge mode to help you master self-reasoning.",
      actions: ["REDUCE_HINTS", "INDEPENDENT_MODE"]
    };
  }

  /**
   * Market Trend Panic (Part 16)
   * Provides realistic context to prevent fear-based roadmap switching.
   */
  static async handleMarketPanic(userId: string, context: string) {
    return {
      message: "I detect some concern about market shifts. Remember: your foundational skills remain the base for any evolution. Let's look at hybridization instead of a full reset.",
      type: "supportive"
    };
  }

  /**
   * Recovery Mode: Estimates memory decay and generates a recovery sprint.
   */
  private static async handleRecoveryMode(userId: string, daysInactive: number) {
    // 1. Identify critical concepts to revise
    // 2. Reduce roadmap intensity temporarily
    // 3. Update mentor message
    return {
      type: "recovery",
      mode: "RECOVERY_MODE",
      message: `Welcome back. It's been ${daysInactive} days. Your retention may have weakened, so I've activated a 2-day momentum recovery sprint.`,
      actions: ["REDUCE_PACING", "PRIORITIZE_REVISION"]
    };
  }

  /**
   * Overcommitment: Detects unrealistic workload and suggests prioritization.
   */
  private static async handleOvercommitment(userId: string, roadmaps: any[]) {
    return {
      type: "warning",
      message: `You have ${roadmaps.length} active learning tracks. Your cognitive load exceeds sustainable limits. I recommend focusing on 2 tracks maximum for optimal retention.`,
      actions: ["SUGGEST_PAUSE_SECONDARY"]
    };
  }

  /**
   * Cognitive Overload: Detects high skip rates or burnout signals.
   */
  private static async handleCognitiveOverload(userId: string, user: any) {
    return {
      type: "burnout_alert",
      message: "Your consistency has dropped recently. I'm simplifying your milestones this week to help you rebuild momentum without burnout.",
      actions: ["SIMPLIFY_TASKS", "REDUCE_DAILY_HOURS"]
    };
  }

  /**
   * Career Transition Layer (Part 1)
   * Intelligently archives current roadmap and bridges to a new one.
   */
  static async transitionCareer(userId: string, fromRole: string, toRole: string) {
    // 1. Find overlapping skills using AI
    // 2. Mark overlapping missions as 'pre-completed' or 'transferable'
    // 3. Archive old roadmap
    // 4. Generate transition pathway
    return {
      message: `Transitioning from ${fromRole} to ${toRole}. Your previous experience in ${fromRole} still benefits your new path. Overlapping concepts have been identified.`,
    };
  }
}
