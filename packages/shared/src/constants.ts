export const roadmapStatuses = ["upcoming", "in_progress", "completed"] as const;

export const learningItemKinds = ["flashcard", "mcq", "short_answer"] as const;

export const reviewOutcomes = ["correct", "wrong"] as const;

export const studyBlockStatuses = ["todo", "done", "missed"] as const;

export const riskLevels = ["stable", "watch", "urgent"] as const;

export const defaultSubjectSuggestions = [
  "Core subject",
  "Lab",
  "Elective",
  "Project",
  "Placement prep"
] as const;

export const studyMoods = [
  "Deep focus",
  "Quick revision",
  "Exam rescue",
  "Placement sprint"
] as const;
