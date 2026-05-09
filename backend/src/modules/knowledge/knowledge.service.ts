import { NoteModel } from "../notes/note.model.js";
import { RoadmapModel } from "../roadmaps/roadmap.model.js";
import { ConceptNodeModel } from "./concept.model.js";
import { DecayEngine } from "../../engines/decay.engine.js";

export type KnowledgeNode = {
  id: string;
  type: "concept" | "note" | "skill" | "milestone";
  label: string;
  val: number;
  retentionState?: "strong" | "stable" | "weakening" | "critical";
  retentionScore?: number;
  category?: string;
  difficulty?: string;
  interviewFrequency?: string;
  noteCount?: number;
};

export type KnowledgeLink = {
  source: string;
  target: string;
  relationship?: string;
  strength?: number;
};

export type KnowledgeGraph = {
  nodes: KnowledgeNode[];
  links: KnowledgeLink[];
  stats: {
    totalNodes: number;
    totalEdges: number;
    strongConcepts: number;
    criticalConcepts: number;
    isolatedConcepts: number;
    avgRetention: number;
  };
};

export type ConceptDetail = {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  retentionState: string;
  retentionScore: number;
  interviewFrequency: string;
  masteryValidated: boolean;
  executionEvidence: number;
  noteCount: number;
  relatedConceptCount: number;
  linkedNotes: Array<{ id: string; title: string; strength: number }>;
  relatedConcepts: Array<{ id: string; name: string; retentionState: string }>;
  lastReviewed?: string;
};

export type InterviewReadiness = {
  overallScore: number;
  criticalGaps: Array<{ name: string; retentionState: string; retentionScore: number }>;
  strongAreas: Array<{ name: string; retentionScore: number }>;
  topicBreakdown: Array<{ category: string; count: number; avgRetention: number }>;
};

/**
 * Builds an intelligent knowledge graph from ConceptNodes, Notes, and Roadmap data.
 * Each node carries retention state. Edges are weighted by concept relationships.
 */
async function getGraph(userId: string): Promise<KnowledgeGraph> {
  // Update retention first
  await DecayEngine.updateConceptRetention(userId).catch(() => {});

  const [concepts, notes, roadmap] = await Promise.all([
    ConceptNodeModel.find({ userId }),
    NoteModel.find({ userId, deleted: { $ne: true } }),
    RoadmapModel.findOne({ userId }).sort({ createdAt: -1 })
  ]);

  const nodes: KnowledgeNode[] = [];
  const links: KnowledgeLink[] = [];
  const nodeIdSet = new Set<string>();

  // 1. Process ConceptNodes (primary nodes)
  for (const concept of concepts) {
    const nodeId = `concept-${concept._id}`;
    nodeIdSet.add(nodeId);

    nodes.push({
      id: nodeId,
      type: "concept",
      label: concept.name,
      val: 10 + (concept.noteIds.length * 5) + (concept.retentionScore ?? 0) / 10,
      retentionState: concept.retentionState as any,
      retentionScore: concept.retentionScore ?? 0,
      category: concept.category,
      difficulty: concept.difficulty,
      interviewFrequency: concept.interviewFrequency,
      noteCount: concept.noteIds.length
    });

    // Link to related concepts
    for (const relatedId of concept.relatedConceptIds) {
      const targetNodeId = `concept-${relatedId}`;
      links.push({
        source: nodeId,
        target: targetNodeId,
        relationship: "related",
        strength: 0.7
      });
    }
  }

  // 2. Process Notes as secondary nodes
  for (const note of notes) {
    const noteNodeId = `note-${note._id}`;
    nodeIdSet.add(noteNodeId);

    const retention = DecayEngine.calculateRetention(note.lastReviewed, note.strength ?? 0.25);
    let retentionState: "strong" | "stable" | "weakening" | "critical";
    if (retention >= 75) retentionState = "strong";
    else if (retention >= 50) retentionState = "stable";
    else if (retention >= 25) retentionState = "weakening";
    else retentionState = "critical";

    nodes.push({
      id: noteNodeId,
      type: "note",
      label: note.title,
      val: 6 + (note.strength ?? 0) * 8,
      retentionState,
      retentionScore: retention,
      difficulty: note.difficulty
    });

    // Link note → concepts
    for (const conceptName of (note.concepts || [])) {
      const concept = concepts.find(c => c.name === conceptName);
      if (concept) {
        links.push({
          source: noteNodeId,
          target: `concept-${concept._id}`,
          relationship: "contains",
          strength: note.strength ?? 0.25
        });
      }
    }

    // Link note → skills
    for (const skill of note.linkedSkills) {
      const skillNodeId = `skill-${skill}`;
      if (!nodeIdSet.has(skillNodeId)) {
        nodeIdSet.add(skillNodeId);
        nodes.push({
          id: skillNodeId,
          type: "skill",
          label: skill,
          val: 15
        });
      }
      links.push({
        source: noteNodeId,
        target: skillNodeId,
        relationship: "teaches",
        strength: 0.5
      });
    }
  }

  // 3. Process Roadmap milestones
  if (roadmap && roadmap.phases) {
    for (const phase of roadmap.phases as any[]) {
      for (const mission of (phase.missions as any[]) || []) {
        const missionNodeId = `mission-${mission.id}`;
        if (!nodeIdSet.has(missionNodeId)) {
          nodeIdSet.add(missionNodeId);
          nodes.push({
            id: missionNodeId,
            type: "milestone",
            label: mission.title,
            val: 12
          });
        }
      }
    }
  }

  // 4. Filter out orphan links (where target doesn't exist)
  const validLinks = links.filter(l => nodeIdSet.has(l.source) && nodeIdSet.has(l.target));

  // 5. Calculate stats
  const conceptNodes = nodes.filter(n => n.type === "concept");
  const linkedNodeIds = new Set([
    ...validLinks.map(l => l.source),
    ...validLinks.map(l => l.target)
  ]);
  const isolatedConcepts = conceptNodes.filter(n => !linkedNodeIds.has(n.id)).length;
  const totalRetention = conceptNodes.reduce((sum, n) => sum + (n.retentionScore ?? 0), 0);

  return {
    nodes,
    links: validLinks,
    stats: {
      totalNodes: nodes.length,
      totalEdges: validLinks.length,
      strongConcepts: conceptNodes.filter(n => n.retentionState === "strong").length,
      criticalConcepts: conceptNodes.filter(n => n.retentionState === "critical").length,
      isolatedConcepts,
      avgRetention: conceptNodes.length > 0 ? Math.round(totalRetention / conceptNodes.length) : 0
    }
  };
}

/**
 * Gets detailed information for a specific concept node.
 */
async function getConceptDetail(userId: string, conceptId: string): Promise<ConceptDetail> {
  const concept = await ConceptNodeModel.findOne({ _id: conceptId, userId });
  if (!concept) throw new Error("Concept not found");

  // Get linked notes
  const linkedNotes = await NoteModel.find({
    _id: { $in: concept.noteIds },
    userId,
    deleted: { $ne: true }
  });

  // Get related concepts
  const relatedConcepts = await ConceptNodeModel.find({
    _id: { $in: concept.relatedConceptIds },
    userId
  });

  return {
    id: concept._id.toString(),
    name: concept.name,
    category: concept.category || "concept",
    difficulty: concept.difficulty || "beginner",
    retentionState: concept.retentionState || "critical",
    retentionScore: concept.retentionScore ?? 0,
    interviewFrequency: concept.interviewFrequency || "medium",
    masteryValidated: concept.masteryValidated ?? false,
    executionEvidence: concept.executionEvidence ?? 0,
    noteCount: concept.noteIds.length,
    relatedConceptCount: concept.relatedConceptIds.length,
    linkedNotes: linkedNotes.map(n => ({
      id: n._id.toString(),
      title: n.title,
      strength: n.strength ?? 0
    })),
    relatedConcepts: relatedConcepts.map(c => ({
      id: c._id.toString(),
      name: c.name,
      retentionState: c.retentionState || "critical"
    })),
    lastReviewed: concept.lastReviewed ? concept.lastReviewed.toISOString() : undefined
  };
}

/**
 * Calculates interview readiness from concept retention states.
 */
async function getInterviewReadiness(userId: string): Promise<InterviewReadiness> {
  await DecayEngine.updateConceptRetention(userId).catch(() => {});

  const concepts = await ConceptNodeModel.find({ userId });

  // Only consider interview-relevant concepts
  const interviewConcepts = concepts.filter(c =>
    c.interviewFrequency === "high" || c.interviewFrequency === "critical"
  );

  // Overall score = weighted average of retention for interview concepts
  const totalRetention = interviewConcepts.reduce((sum, c) => sum + (c.retentionScore ?? 0), 0);
  const overallScore = interviewConcepts.length > 0 ? Math.round(totalRetention / interviewConcepts.length) : 0;

  // Critical gaps: interview-relevant concepts with weak retention
  const criticalGaps = concepts
    .filter(c => (c.interviewFrequency === "high" || c.interviewFrequency === "critical") &&
                 (c.retentionState === "critical" || c.retentionState === "weakening"))
    .map(c => ({
      name: c.name,
      retentionState: c.retentionState || "critical",
      retentionScore: c.retentionScore ?? 0
    }))
    .sort((a, b) => a.retentionScore - b.retentionScore)
    .slice(0, 8);

  // Strong areas
  const strongAreas = concepts
    .filter(c => (c.retentionState === "strong" || c.retentionState === "stable") &&
                 (c.interviewFrequency === "high" || c.interviewFrequency === "critical"))
    .map(c => ({ name: c.name, retentionScore: c.retentionScore ?? 0 }))
    .sort((a, b) => b.retentionScore - a.retentionScore)
    .slice(0, 8);

  // Topic breakdown by category
  const categoryMap = new Map<string, { count: number; totalRetention: number }>();
  for (const c of concepts) {
    const cat = c.category || "concept";
    const bucket = categoryMap.get(cat) ?? { count: 0, totalRetention: 0 };
    bucket.count++;
    bucket.totalRetention += c.retentionScore ?? 0;
    categoryMap.set(cat, bucket);
  }

  const topicBreakdown = [...categoryMap.entries()].map(([category, data]) => ({
    category,
    count: data.count,
    avgRetention: data.count > 0 ? Math.round(data.totalRetention / data.count) : 0
  }));

  return { overallScore, criticalGaps, strongAreas, topicBreakdown };
}

export const knowledgeService = {
  getGraph,
  getConceptDetail,
  getInterviewReadiness
};
