export type CareerNote = {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  linkedSkills: string[];
  sourceUrl?: string;
  createdAt: string;
  updatedAt: string;
};
