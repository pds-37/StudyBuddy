export type MentorProfile = {
  id: string;
  name: string;
  role: string;
  company: string;
  expertise: string[];
  bio: string;
  available: boolean;
};

export type MentorshipMatch = {
  id: string;
  userId: string;
  mentorId: string;
  mentor: MentorProfile;
  matchScore: number;
  matchReasons: string[];
  status: "pending" | "accepted" | "declined";
  createdAt: string;
};
