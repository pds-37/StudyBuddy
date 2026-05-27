import { studentIntelligenceService } from "../modules/intelligence/student-intelligence.service.js";
import type { StudentIntelligenceEventType } from "../modules/intelligence/student-intelligence.model.js";

export class VedaBlackboardMaster {
  /**
   * Retrieves the current unified memory blackboard (Student Intelligence Profile).
   */
  static async getBlackboardState(userId: string): Promise<any> {
    return studentIntelligenceService.getProfile(userId);
  }

  /**
   * Registers a new agent finding or user interaction event to the blackboard.
   * This immediately triggers a profile rebuild to calibrate cognitive load, 
   * retention rates, weak concepts, daily priorities, and emotional/burnout metrics.
   */
  static async recordAgentFindings(
    userId: string,
    event: {
      type: StudentIntelligenceEventType;
      source: "notes" | "recall" | "roadmap" | "projects" | "resume" | "jobs" | "company-prep" | "mentor" | "skills" | "behavior" | "system";
      entityId?: string;
      payload?: Record<string, any>;
    }
  ): Promise<any> {
    console.log(`[Blackboard Master] Recording agent finding: [${event.type}] from Agent/Feature [${event.source}]`);
    return studentIntelligenceService.emitEvent(userId, {
      type: event.type,
      source: event.source,
      entityId: event.entityId,
      payload: event.payload
    });
  }

  /**
   * Formulates a specialized agent system prompt by injecting relevant blackboard state.
   */
  static buildAgentContext(profile: any): string {
    return studentIntelligenceService.buildMentorContext(profile);
  }
}
