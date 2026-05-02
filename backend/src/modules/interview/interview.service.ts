import { InterviewModel, type InterviewDocument } from "./interview.model.js";
import { UserModel } from "../users/user.model.js";
import { groqService } from "../../services/ai/groq.service.js";
import { ApiError } from "../../utils/api-error.js";
import type { InterviewSession, InterviewQuestion } from "@studybuddy/shared";

function toSession(doc: InterviewDocument): InterviewSession {
  return doc.toJSON() as unknown as InterviewSession;
}

/** Starts a new interview session. */
async function startSession(userId: string): Promise<InterviewSession> {
  const user = await UserModel.findById(userId);
  if (!user || user.targetRoles.length === 0) {
    throw new ApiError(400, "User must have a target role to start an interview");
  }

  // Generate 3 personalized questions (1 general, 1 behavioral, 1 technical)
  const questionsPrompt = `Generate exactly 3 interview questions for a ${user.targetRoles[0]} role. 
The candidate has the following skills: ${user.currentSkills.join(", ")}.
Question 1: General/Introductory
Question 2: Behavioral (STAR format expected)
Question 3: Technical
Return as a JSON array of objects with keys: "question" and "category" ("general", "behavioral", or "technical").
ONLY output valid JSON.`;

  const aiQuestionsJson = await groqService.generateStructuredResponse(questionsPrompt);
  
  let generatedQuestions;
  try {
    generatedQuestions = JSON.parse(aiQuestionsJson);
  } catch (e) {
    console.error("Failed to parse AI questions:", aiQuestionsJson);
    generatedQuestions = [
      { question: "Tell me about yourself and your background.", category: "general" },
      { question: "Describe a time you faced a difficult challenge at work.", category: "behavioral" },
      { question: `What are your strongest technical skills relevant to a ${user.targetRoles[0]}?`, category: "technical" }
    ];
  }

  const questions: InterviewQuestion[] = generatedQuestions.map((q: any, i: number) => ({
    id: `q-${Date.now()}-${i}`,
    question: q.question,
    category: q.category
  }));

  const session = await InterviewModel.create({
    userId,
    targetRole: user.targetRoles[0],
    status: "in_progress",
    questions
  });

  return toSession(session);
}

/** Gets a session by ID. */
async function getSession(sessionId: string, userId: string): Promise<InterviewSession> {
  const session = await InterviewModel.findOne({ _id: sessionId, userId });
  if (!session) throw new ApiError(404, "Interview session not found");
  return toSession(session);
}

/** Gets all sessions for a user. */
async function getUserSessions(userId: string): Promise<InterviewSession[]> {
  const sessions = await InterviewModel.find({ userId }).sort({ createdAt: -1 });
  return sessions.map(toSession);
}

/** Submits an answer to a question and returns AI scoring. */
async function submitAnswer(sessionId: string, userId: string, questionId: string, answer: string): Promise<InterviewSession> {
  const session = await InterviewModel.findOne({ _id: sessionId, userId });
  if (!session) throw new ApiError(404, "Interview session not found");
  if (session.status === "completed") throw new ApiError(400, "Interview already completed");

  const question = session.questions.find((q: any) => q.id === questionId);
  if (!question) throw new ApiError(404, "Question not found in this session");

  question.userAnswer = answer;

  // Use AI to score the answer
  const scorePrompt = `You are an expert technical recruiter evaluating an interview answer.
Target Role: ${session.targetRole}
Question Category: ${question.category}
Question: "${question.question}"
Candidate Answer: "${answer}"

Evaluate the answer and provide a score out of 10 for:
1. clarity (how clear and articulate was it?)
2. relevance (did it directly answer the question?)
3. starMethod (did it use Situation, Task, Action, Result format? Give a lower score if missing, especially for behavioral questions)
4. overall (overall effectiveness out of 10)
5. feedback (constructive feedback string, max 2-3 sentences)

Return ONLY a valid JSON object with these exact keys: "clarity" (number), "relevance" (number), "starMethod" (number), "overall" (number), "feedback" (string).`;

  const aiScoreJson = await groqService.generateStructuredResponse(scorePrompt);
  
  let score;
  try {
    score = JSON.parse(aiScoreJson);
  } catch (e) {
    score = { clarity: 5, relevance: 5, starMethod: 5, overall: 5, feedback: "Unable to generate detailed feedback." };
  }

  question.score = score;

  // Check if all questions are answered to complete the session
  const allAnswered = session.questions.every((q: any) => q.userAnswer);
  if (allAnswered) {
    session.status = "completed";
    
    // Calculate overall session score
    let totalScore = 0;
    let feedbackParts = [];
    for (const q of session.questions) {
      if (q.score) {
        totalScore += q.score.overall;
        feedbackParts.push(q.score.feedback);
      }
    }
    
    session.overallScore = Math.round(totalScore / session.questions.length);
    session.overallFeedback = await generateOverallFeedback(session.targetRole, session.questions);
  }

  await session.save();
  return toSession(session);
}

async function generateOverallFeedback(targetRole: string, questions: any[]): Promise<string> {
  const prompt = `Based on the following interview performance for a ${targetRole} role, provide a brief 2-3 sentence overall summary of the candidate's strengths and areas for improvement.
Questions and Scores:
${questions.map((q, i) => `Q${i+1}: ${q.question}\nScore: ${q.score?.overall}/10\nFeedback: ${q.score?.feedback}`).join("\n\n")}
Return ONLY the 2-3 sentence summary as plain text.`;
  
  return await groqService.generateStructuredResponse(prompt);
}

export const interviewService = {
  startSession,
  getSession,
  getUserSessions,
  submitAnswer
};
