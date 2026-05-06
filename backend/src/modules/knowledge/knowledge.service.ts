import { NoteModel } from "../notes/note.model.js";
import { RoadmapModel } from "../roadmaps/roadmap.model.js";

export type KnowledgeNode = {
  id: string;
  type: "note" | "skill" | "milestone";
  label: string;
  val: number; // size/importance
};

export type KnowledgeLink = {
  source: string;
  target: string;
};

export type KnowledgeGraph = {
  nodes: KnowledgeNode[];
  links: KnowledgeLink[];
};

/**
 * Aggregates user data into a graph structure for visualization.
 */
async function getGraph(userId: string): Promise<KnowledgeGraph> {
  const [notes, roadmap] = await Promise.all([
    NoteModel.find({ userId, deleted: { $ne: true } }),
    RoadmapModel.findOne({ userId }).sort({ createdAt: -1 })
  ]);

  const nodes: KnowledgeNode[] = [];
  const links: KnowledgeLink[] = [];
  const skillSet = new Set<string>();

  // 1. Process Notes
  notes.forEach(note => {
    nodes.push({
      id: `note-${note._id}`,
      type: "note",
      label: note.title,
      val: 10
    });

    // Extract skills from note tags or content (simulated link)
    if (note.linkedSkills) {
      note.linkedSkills.forEach(skill => {
        skillSet.add(skill);
        links.push({
          source: `note-${note._id}`,
          target: `skill-${skill}`
        });
      });
    }
  });

  // 2. Process Roadmap Missions
  if (roadmap && roadmap.phases) {
    (roadmap.phases as any[]).forEach(phase => {
      (phase.missions as any[]).forEach(mission => {
        nodes.push({
          id: `mission-${mission.id}`,
          type: "milestone",
          label: mission.title,
          val: 15
        });
      });
    });
  }

  // 3. Add Skill Nodes
  skillSet.forEach(skill => {
    nodes.push({
      id: `skill-${skill}`,
      type: "skill",
      label: skill,
      val: 20
    });
  });

  return { nodes, links };
}

export const knowledgeService = {
  getGraph
};
