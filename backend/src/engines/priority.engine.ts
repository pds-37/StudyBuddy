import { NoteModel } from "../modules/notes/note.model.js";
import { DecayEngine } from "./decay.engine.js";
import type { RevisionPriority, RecallGrade } from "@studybuddy/shared";

/**
 * Generates prioritized revision lists to prevent overwhelm.
 * Considers: forgetting curve, interview importance, roadmap relevance, execution gaps, lapse patterns.
 */
export class PriorityEngine {
  /**
   * Generates today's prioritized revision list.
   * Returns the most important concepts to review, ordered by composite score.
   */
  static async generateRevisionPriorities(
    userId: string,
    limit: number = 8
  ): Promise<RevisionPriority[]> {
    const now = new Date();

    // Fetch notes that need attention
    const notes = await NoteModel.find({
      userId,
      deleted: { $ne: true }
    }).sort({ strength: 1, nextReviewAt: 1 });

    const priorities: Array<RevisionPriority & { _score: number }> = [];

    for (const note of notes) {
      const retention = DecayEngine.calculateRetention(
        note.lastReviewed,
        note.strength ?? 0.25
      );

      const urgency = DecayEngine.getRevisionUrgency(
        retention,
        note.interviewImportance ?? 0
      );

      const score = this.calculatePriorityScore(
        note.strength ?? 0.25,
        retention,
        note.interviewImportance ?? 0,
        note.lapseCount ?? 0,
        note.reviewCount ?? 0,
        note.nextReviewAt ? note.nextReviewAt <= now : true
      );

      // Only include items that actually need revision
      if (score < 5) continue;

      // Determine reason and type
      const { reason, reasonType, revisionType } = this.classifyRevisionNeed(
        retention,
        note.interviewImportance ?? 0,
        note.lapseCount ?? 0,
        note.strength ?? 0.25,
        note.revisionStrategy || "conceptual"
      );

      // Estimate time based on difficulty and type
      const estimatedMinutes = this.estimateRevisionTime(
        note.difficulty || "beginner",
        revisionType
      );

      // Determine last attempt grade from lapse pattern
      let lastAttemptGrade: RecallGrade | undefined;
      if (note.lapseCount && note.lapseCount > 0 && note.reviewCount && note.reviewCount > 0) {
        const lapseRatio = note.lapseCount / note.reviewCount;
        if (lapseRatio > 0.5) lastAttemptGrade = "wrong";
        else if (lapseRatio > 0.2) lastAttemptGrade = "weak";
        else lastAttemptGrade = "good";
      }

      priorities.push({
        noteId: String(note._id),
        title: note.title,
        topic: note.topic || note.tags[0] || "General",
        concepts: note.concepts || [],
        urgency,
        reason,
        reasonType,
        estimatedMinutes,
        revisionType,
        strength: note.strength ?? 0.25,
        lastAttemptGrade,
        _score: score
      });
    }

    // Sort by priority score (highest first) and take top N
    return priorities
      .sort((a, b) => b._score - a._score)
      .slice(0, limit)
      .map(({ _score, ...priority }) => priority);
  }

  /**
   * Calculates a composite priority score for a note (0-100).
   */
  static calculatePriorityScore(
    strength: number,
    retention: number,
    interviewImportance: number,
    lapseCount: number,
    reviewCount: number,
    isDue: boolean
  ): number {
    let score = 0;

    // Forgetting curve urgency (0-40 points)
    score += Math.max(0, 40 - retention * 0.4);

    // Interview importance (0-25 points)
    score += interviewImportance * 0.25;

    // Lapse penalty — repeated failures need more attention (0-20 points)
    if (reviewCount > 0) {
      const lapseRatio = lapseCount / reviewCount;
      score += lapseRatio * 20;
    }

    // Due status bonus (0-15 points)
    if (isDue) score += 15;

    // Low strength bonus (0-10)
    score += Math.max(0, (1 - strength) * 10);

    return Math.min(100, Math.round(score));
  }

  /**
   * Classifies why a concept needs revision and how.
   */
  private static classifyRevisionNeed(
    retention: number,
    interviewImportance: number,
    lapseCount: number,
    strength: number,
    revisionStrategy: string
  ): {
    reason: string;
    reasonType: "forgetting_curve" | "interview_critical" | "roadmap_relevant" | "execution_gap" | "repeated_lapse";
    revisionType: "recall" | "implementation" | "explanation" | "quiz";
  } {
    // Repeated failures take highest priority
    if (lapseCount > 3) {
      return {
        reason: `Failed ${lapseCount} times — needs simplified revision approach.`,
        reasonType: "repeated_lapse",
        revisionType: "explanation"
      };
    }

    // Interview-critical with weak retention
    if (interviewImportance > 70 && retention < 60) {
      return {
        reason: "High-frequency interview topic with decaying retention.",
        reasonType: "interview_critical",
        revisionType: "quiz"
      };
    }

    // Pure forgetting curve decay
    if (retention < 30) {
      return {
        reason: "Memory is rapidly decaying — urgent revision needed.",
        reasonType: "forgetting_curve",
        revisionType: "recall"
      };
    }

    // Low strength despite reviews (execution gap)
    if (strength < 0.3 && lapseCount > 1) {
      return {
        reason: "Concept understood in theory but execution is weak.",
        reasonType: "execution_gap",
        revisionType: revisionStrategy === "implementation" ? "implementation" : "recall"
      };
    }

    // Default: moderate decay
    return {
      reason: "Scheduled revision to maintain retention.",
      reasonType: "forgetting_curve",
      revisionType: "recall"
    };
  }

  /**
   * Estimates revision time in minutes based on difficulty and type.
   */
  private static estimateRevisionTime(
    difficulty: string,
    revisionType: string
  ): number {
    const baseTime: Record<string, number> = {
      recall: 5,
      explanation: 8,
      quiz: 10,
      implementation: 20
    };

    const difficultyMultiplier: Record<string, number> = {
      beginner: 1,
      intermediate: 1.5,
      advanced: 2.5
    };

    return Math.round(
      (baseTime[revisionType] || 10) * (difficultyMultiplier[difficulty] || 1)
    );
  }
}
