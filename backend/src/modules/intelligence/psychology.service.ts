import { UserModel } from "../users/user.model.js";
import { RoadmapModel } from "../roadmaps/roadmap.model.js";

/**
 * Psychological Learning Intelligence Engine
 * Analyzes emotional friction, confidence shifts, and cognitive energy.
 */
export class PsychologyEngine {
  /**
   * Infers the user's emotional state from recent behavioral signals.
   */
  static async inferEmotionalState(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) return null;

    const roadmaps = await RoadmapModel.find({ userId, status: "active" });
    const { behaviorProfile, psychologicalProfile } = user;

    // SIGNAL: Overwhelm
    // Detected by: many unfinished tasks, low completion, high cognitive load
    if (behaviorProfile.cognitiveLoad > 80 || behaviorProfile.skipRate > 0.3) {
      return {
        state: "overwhelmed",
        mentorTone: "calm_focused",
        recommendation: "reduce_task_density",
        message: "You seem to be carrying a heavy cognitive load. Let's focus on one small mission today."
      };
    }

    // SIGNAL: Anxious
    // Detected by: high anxietyLevel (updated via mentor interaction or rapid switching)
    if (psychologicalProfile.anxietyLevel > 70) {
      return {
        state: "anxious",
        mentorTone: "reassuring",
        recommendation: "simplify_focus",
        message: "It's normal to feel anxious about the roadmap. You're making progress, let's look at how far you've come."
      };
    }

    // SIGNAL: Burned Out
    // Detected by: sudden inactivity + recall collapse
    if (behaviorProfile.burnoutRisk > 75) {
      return {
        state: "burned_out",
        mentorTone: "empathetic",
        recommendation: "recovery_mode",
        message: "You've been pushing very hard. I recommend a maintenance-only mode for a few days to preserve your mental energy."
      };
    }

    // SIGNAL: Discouraged
    // Detected by: low confidence scores + avoiding harder tasks
    if (psychologicalProfile.confidence.learning < 40) {
      return {
        state: "discouraged",
        mentorTone: "supportive_narrative",
        recommendation: "highlight_growth",
        message: `Remember when you struggled with foundations? Now you're building complex systems. Your trajectory is strong.`
      };
    }

    // DEFAULT: Steady / Momentum Driven
    return {
      state: "steady",
      mentorTone: "challenging",
      recommendation: "continue_mission",
      message: "Great momentum! You're in a high-focus window. Ready for a challenge?"
    };
  }

  /**
   * Momentum Preservation Engine (Part 2)
   * Protects consistency by reducing impossible workloads and creating achievable missions.
   */
  static protectMomentum(behavior: any) {
    if (behavior.consistencyScore < 50) {
      return {
        strategy: "achievable_wins",
        taskLimit: 3,
        focusOn: "satisfaction_loops",
        message: "Consistency is dipping. Let's focus on 3 small, achievable wins today to rebuild your momentum."
      };
    }
    return null;
  }

  /**
   * Confidence Modeling Engine (Part 3)
   * Tracks skill vs execution confidence.
   */
  static async evaluateConfidence(userId: string, taskResult: any) {
    // If user takes too long or uses many hints, execution confidence drops even if task is completed
    const executionDelta = taskResult.hintsUsed > 3 ? -5 : taskResult.timeTaken < taskResult.estimatedTime ? +5 : 0;
    await this.updateConfidence(userId, "execution", executionDelta);
  }

  /**
   * Identity Narrative (Part 4)
   * Updates the user's narrative based on milestones.
   */
  static async evolveIdentity(userId: string, phaseTitle: string) {
    let newIdentity = "Student";
    if (phaseTitle.includes("Foundations")) newIdentity = "Aspiring Developer";
    if (phaseTitle.includes("System")) newIdentity = "System Architect in Training";
    if (phaseTitle.includes("Advanced")) newIdentity = "Full Stack Engineer";
    
    await UserModel.findByIdAndUpdate(userId, { "psychologicalProfile.identityNarrative": newIdentity });
  }

  /**
   * Updates confidence scores based on performance.
   */
  static async updateConfidence(userId: string, type: "skill" | "execution" | "interview", delta: number) {
    await UserModel.findByIdAndUpdate(userId, {
      $inc: { [`psychologicalProfile.confidence.${type}`]: delta }
    });
  }

  /**
   * Injects identity reinforcement into mentor messages.
   */
  static getIdentityNudge(user: any) {
    const role = user.psychologicalProfile.identityNarrative || "Engineer";
    return `As an evolving ${role}, your system thinking is becoming much more refined.`;
  }
}
