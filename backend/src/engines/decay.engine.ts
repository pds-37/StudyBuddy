import { NoteModel } from "../modules/notes/note.model.js";
import { ConceptNodeModel } from "../modules/knowledge/concept.model.js";
import type { MemoryDecayState } from "@studybuddy/shared";

/**
 * Implements Ebbinghaus forgetting curve model for memory decay tracking.
 * Calculates retention scores and revision urgency for concepts.
 */
export class DecayEngine {
  /**
   * Calculates forgetting curve retention using the Ebbinghaus model.
   * R = e^(-t/S) where t = time elapsed (hours), S = stability factor
   * Returns 0-100 (100 = fully retained).
   */
  static calculateRetention(lastReviewedAt: Date | null | undefined, stability: number): number {
    if (!lastReviewedAt) return 0;

    const hoursElapsed = (Date.now() - lastReviewedAt.getTime()) / (1000 * 60 * 60);

    // Stability is mapped from strength (0-1) to hours (4-720)
    // Higher strength = slower decay
    const stabilityHours = 4 + stability * 716;

    const retention = Math.exp(-hoursElapsed / stabilityHours) * 100;
    return Math.max(0, Math.min(100, Math.round(retention)));
  }

  /**
   * Determines revision urgency based on retention score and importance.
   */
  static getRevisionUrgency(
    retentionScore: number,
    interviewImportance: number = 0
  ): "low" | "medium" | "high" | "critical" {
    // Interview-critical concepts have stricter thresholds
    const importanceFactor = interviewImportance > 70 ? 15 : interviewImportance > 40 ? 8 : 0;
    const adjustedRetention = retentionScore - importanceFactor;

    if (adjustedRetention < 20) return "critical";
    if (adjustedRetention < 40) return "high";
    if (adjustedRetention < 65) return "medium";
    return "low";
  }

  /**
   * Determines the best revision strategy based on concept type and performance.
   */
  static getRevisionStrategy(
    topic: string,
    lapseCount: number,
    reviewCount: number
  ): "implementation" | "conceptual" | "practical_repetition" | "visual" {
    const topicLower = (topic || "").toLowerCase();

    // Algorithm/DS topics → implementation-heavy
    const algoKeywords = ["algorithm", "sort", "search", "tree", "graph", "dynamic programming", "dp", "bfs", "dfs", "linked list", "stack", "queue", "heap"];
    if (algoKeywords.some(k => topicLower.includes(k))) return "implementation";

    // Framework/API topics → practical repetition
    const frameworkKeywords = ["react", "next", "vue", "angular", "express", "node", "api", "hook", "component", "middleware"];
    if (frameworkKeywords.some(k => topicLower.includes(k))) return "practical_repetition";

    // If high lapse count, simplify with visual
    if (lapseCount > 3 && reviewCount > 5) return "visual";

    // Default to conceptual
    return "conceptual";
  }

  /**
   * Calculates the optimal next revision date based on current performance.
   */
  static calculateNextRevision(strength: number, consecutiveSuccesses: number): Date {
    // Base interval in hours, exponentially increasing with strength and success streak
    let intervalHours: number;

    if (strength < 0.2) {
      intervalHours = 4; // 4 hours
    } else if (strength < 0.4) {
      intervalHours = 24; // 1 day
    } else if (strength < 0.6) {
      intervalHours = 72; // 3 days
    } else if (strength < 0.8) {
      intervalHours = 168; // 1 week
    } else {
      intervalHours = 336; // 2 weeks
    }

    // Multiply by consecutive success streak
    const streakMultiplier = 1 + Math.min(consecutiveSuccesses, 5) * 0.4;
    intervalHours = Math.round(intervalHours * streakMultiplier);

    const nextDate = new Date();
    nextDate.setTime(nextDate.getTime() + intervalHours * 60 * 60 * 1000);
    return nextDate;
  }

  /**
   * Batch processes all user notes and calculates decay states.
   */
  static async processUserDecay(userId: string): Promise<MemoryDecayState[]> {
    const notes = await NoteModel.find({ userId, deleted: { $ne: true } })
      .sort({ strength: 1, nextReviewAt: 1 });

    const decayStates: MemoryDecayState[] = [];

    for (const note of notes) {
      const retention = this.calculateRetention(
        note.lastReviewed,
        note.strength ?? 0.25
      );

      const urgency = this.getRevisionUrgency(
        retention,
        note.interviewImportance ?? 0
      );

      const strategy = this.getRevisionStrategy(
        note.topic || note.tags[0] || "",
        note.lapseCount ?? 0,
        note.reviewCount ?? 0
      );

      decayStates.push({
        concept: note.title,
        noteId: String(note._id),
        retentionStrength: Math.round((note.strength ?? 0.25) * 100),
        lastReviewed: note.lastReviewed ? note.lastReviewed.toISOString() : new Date(0).toISOString(),
        forgettingCurveScore: retention,
        nextRevisionDate: note.nextReviewAt ? note.nextReviewAt.toISOString() : new Date().toISOString(),
        revisionUrgency: urgency,
        revisionStrategy: strategy
      });
    }

    return decayStates;
  }

  /**
   * Updates retention states for all concept nodes belonging to a user.
   */
  static async updateConceptRetention(userId: string): Promise<void> {
    const concepts = await ConceptNodeModel.find({ userId });

    for (const concept of concepts) {
      // Get all notes for this concept
      const notes = await NoteModel.find({
        userId,
        _id: { $in: concept.noteIds },
        deleted: { $ne: true }
      });

      if (notes.length === 0) continue;

      // Average retention across all notes for this concept
      const totalRetention = notes.reduce((sum, note) => {
        return sum + this.calculateRetention(note.lastReviewed, note.strength ?? 0.25);
      }, 0);

      const avgRetention = Math.round(totalRetention / notes.length);

      // Determine retention state
      let retentionState: "strong" | "stable" | "weakening" | "critical";
      if (avgRetention >= 75) retentionState = "strong";
      else if (avgRetention >= 50) retentionState = "stable";
      else if (avgRetention >= 25) retentionState = "weakening";
      else retentionState = "critical";

      // Find the most recent review across all linked notes
      const lastReviewed = notes
        .map(n => n.lastReviewed)
        .filter(Boolean)
        .sort((a, b) => (b?.getTime() ?? 0) - (a?.getTime() ?? 0))[0];

      await ConceptNodeModel.updateOne(
        { _id: concept._id },
        {
          $set: {
            retentionScore: avgRetention,
            retentionState,
            lastReviewed: lastReviewed || null
          }
        }
      );
    }
  }
}
