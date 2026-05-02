import { MentorshipModel, type MentorshipDocument } from "./mentorship.model.js";
import { UserModel } from "../users/user.model.js";
import { groqService } from "../../services/ai/groq.service.js";
import { ApiError } from "../../utils/api-error.js";
import type { MentorshipMatch, MentorProfile } from "@studybuddy/shared";

// Mock database of mentors
const MOCK_MENTORS: MentorProfile[] = [
  { id: "m1", name: "Sarah Chen", role: "Senior Frontend Engineer", company: "Google", expertise: ["React", "TypeScript", "System Design"], bio: "Passionate about helping early-career devs transition into big tech.", available: true },
  { id: "m2", name: "David Kumar", role: "Product Manager", company: "Stripe", expertise: ["Product Strategy", "Agile", "FinTech"], bio: "Ex-engineer turned PM. Happy to help with resume reviews and mock product interviews.", available: true },
  { id: "m3", name: "Elena Rodriguez", role: "Data Scientist", company: "Netflix", expertise: ["Python", "Machine Learning", "A/B Testing"], bio: "Building recommendation algorithms. Looking to mentor those entering the ML space.", available: true },
  { id: "m4", name: "Michael Chang", role: "Backend Developer", company: "Amazon", expertise: ["Node.js", "AWS", "Microservices"], bio: "10+ years backend experience. Focus on scalable systems.", available: true }
];

function toMatch(doc: MentorshipDocument): MentorshipMatch {
  return doc.toJSON() as unknown as MentorshipMatch;
}

/** Analyzes user profile to find the best mentors and generates AI reasons for the match. */
async function findMatches(userId: string): Promise<MentorshipMatch[]> {
  const user = await UserModel.findById(userId);
  if (!user || user.targetRoles.length === 0) {
    throw new ApiError(400, "User must have a target role to find mentors");
  }

  // Check if matches already exist
  const existingMatches = await MentorshipModel.find({ userId });
  if (existingMatches.length > 0) {
    return existingMatches.map(toMatch);
  }

  // Generate matches using AI to determine relevance and reasons
  const prompt = `You are an expert mentorship matchmaker. 
Candidate Target Role: ${user.targetRoles[0]}
Candidate Skills: ${user.currentSkills.join(", ")}

Available Mentors:
${JSON.stringify(MOCK_MENTORS, null, 2)}

Match the candidate with the 2 most relevant mentors. For each match, provide a matchScore (0-100) and 2 specific matchReasons why this mentor is a good fit.
Return ONLY valid JSON in this exact structure:
[
  { "mentorId": "m1", "matchScore": 95, "matchReasons": ["reason 1", "reason 2"] }
]`;

  const aiMatchJson = await groqService.generateStructuredResponse(prompt);
  
  let matchResults;
  try {
    matchResults = JSON.parse(aiMatchJson);
  } catch (e) {
    matchResults = [
      { mentorId: "m1", matchScore: 80, matchReasons: ["Strong alignment with frontend goals", "Can help with React"] }
    ];
  }

  const createdMatches = [];
  for (const result of matchResults) {
    const mentor = MOCK_MENTORS.find(m => m.id === result.mentorId);
    if (!mentor) continue;

    const match = await MentorshipModel.create({
      userId,
      mentorId: mentor.id,
      mentor,
      matchScore: result.matchScore,
      matchReasons: result.matchReasons,
      status: "pending"
    });
    createdMatches.push(match);
  }

  return createdMatches.map(toMatch);
}

/** Updates the status of a match (accept/decline). */
async function updateMatchStatus(userId: string, matchId: string, status: "accepted" | "declined"): Promise<MentorshipMatch> {
  const match = await MentorshipModel.findOneAndUpdate(
    { _id: matchId, userId },
    { status },
    { new: true }
  );
  if (!match) throw new ApiError(404, "Mentorship match not found");
  return toMatch(match);
}

export const mentorshipService = {
  findMatches,
  updateMatchStatus
};
