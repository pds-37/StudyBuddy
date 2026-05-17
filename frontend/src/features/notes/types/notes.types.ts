export type ConceptHealth = 'strong' | 'needs-review' | 'critical';
export type RecallDifficulty = 'easy' | 'hard' | 'forgot';
export type PanelId = 'library' | 'veda' | 'review' | 'insights' | 'jobs';
export type FilterType = 'all' | 'strong' | 'weak' | 'due-today' | 'linked';

export interface Concept {
  id: string;
  title: string;
  excerpt: string;
  tags: string[];
  health: ConceptHealth;
  recallScore: number;        // 0–100
  lastReviewed: Date | null;
  dueDate: Date | null;
  linkedJobId: string | null;
  linkedJobTitle: string | null;
  createdAt: Date;
}

export interface VedaNudge {
  id: string;
  type: 'recall-warning' | 'connection' | 'job-context';
  title: string;
  body: string;
  actionLabel: string;
  actionPrompt: string;       // what to do when action is clicked
}

export interface RecallCard {
  conceptId: string;
  conceptTitle: string;
  priority: 'low' | 'medium' | 'critical';
  recallScore: number;
  lastReviewed: Date | null;
}

export interface JobLink {
  jobId: string;
  jobTitle: string;
  conceptCount: number;
  color: string;              // hex for the dot indicator
}

export interface NotesStats {
  totalConcepts: number;
  retention: number;          // percentage 0–100
  dueToday: number;
  streakDays: number;
  streakCompletedToday: number;
  streakGoalToday: number;
}
