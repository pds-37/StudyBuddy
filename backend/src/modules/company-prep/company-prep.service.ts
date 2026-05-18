import type {
  CompanyPrepQuestionQuery,
  CompanyPrepQuestionStatus,
  CompanyPrepRole,
  CompanyTypeCard,
  CompanyTypeDetail,
  CompanyTypeProfile,
  PrepQuestion
} from "@studybuddy/shared";
import { ApiError } from "../../utils/api-error.js";
import { studentIntelligenceService } from "../intelligence/student-intelligence.service.js";
import { ConceptNodeModel } from "../knowledge/concept.model.js";
import { NoteModel } from "../notes/note.model.js";
import { notesService } from "../notes/notes.service.js";
import { UserModel } from "../users/user.model.js";
import {
  CompanyPrepTargetModel,
  CompanyTypeModel,
  PrepQuestionModel,
  UserPrepProgressModel,
  type CompanyTypeDocument,
  type PrepQuestionDocument,
  type UserPrepProgressDocument
} from "./company-prep.model.js";
import { COMPANY_TYPE_SEEDS, PREP_QUESTION_SEEDS } from "./company-prep.seed.js";

const DEFAULT_ROLE: CompanyPrepRole = "Software Engineer";
const DSA_TOPICS = new Set([
  "arrays", "strings", "hashing", "graphs", "trees", "dynamic programming", "heap",
  "binary search", "backtracking", "greedy", "stack", "linked list", "two pointers"
]);

let seedPromise: Promise<void> | null = null;

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function clampScore(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

async function ensureSeedData() {
  if (!seedPromise) {
    seedPromise = (async () => {
      await Promise.all([
        CompanyTypeModel.bulkWrite(
          COMPANY_TYPE_SEEDS.map((profile) => ({
            updateOne: {
              filter: { typeId: profile.id },
              update: {
                $set: {
                  typeId: profile.id,
                  name: profile.name,
                  summary: profile.summary,
                  hiringFrequency: profile.hiringFrequency,
                  selectivity: profile.selectivity,
                  difficulty: profile.difficulty,
                  roleTags: profile.roleTags,
                  focusAreas: profile.focusAreas,
                  exampleCompanies: profile.exampleCompanies,
                  procedure: profile.procedure,
                  questionMix: profile.questionMix,
                  lastUpdated: profile.lastUpdated
                }
              },
              upsert: true
            }
          })) as any
        ),
        PrepQuestionModel.bulkWrite(
          PREP_QUESTION_SEEDS.map((question) => ({
            updateOne: {
              filter: { questionId: question.id },
              update: {
                $set: {
                  questionId: question.id,
                  title: question.title,
                  difficulty: question.difficulty,
                  topics: question.topics,
                  roleTags: question.roleTags,
                  companyTypes: question.companyTypes,
                  approach: question.approach,
                  sourceRefs: question.sourceRefs
                }
              },
              upsert: true
            }
          })) as any
        )
      ]);
    })();
  }

  return seedPromise;
}

function toCompanyTypeProfile(doc: CompanyTypeDocument): CompanyTypeProfile {
  return {
    id: doc.typeId,
    name: doc.name,
    summary: doc.summary,
    hiringFrequency: doc.hiringFrequency as CompanyTypeProfile["hiringFrequency"],
    selectivity: doc.selectivity as CompanyTypeProfile["selectivity"],
    difficulty: doc.difficulty as CompanyTypeProfile["difficulty"],
    roleTags: doc.roleTags as CompanyPrepRole[],
    focusAreas: doc.focusAreas,
    exampleCompanies: doc.exampleCompanies,
    procedure: doc.procedure.map((stage) => ({
      order: stage.order,
      name: stage.name,
      format: stage.format,
      duration: stage.duration,
      evaluationSignals: stage.evaluationSignals,
      preparationTips: stage.preparationTips,
      eliminationRisk: stage.eliminationRisk as any
    })),
    questionMix: doc.questionMix.map((item) => ({ topic: item.topic, weight: item.weight })),
    lastUpdated: doc.lastUpdated
  };
}

function frequencyFor(question: PrepQuestionDocument | PrepQuestion, companyTypeId?: string) {
  const tags = "companyTypes" in question ? question.companyTypes : [];
  const match = companyTypeId
    ? tags.find((item: any) => item.companyTypeId === companyTypeId)
    : tags.sort((left: any, right: any) => right.frequency - left.frequency)[0];

  return Number(match?.frequency ?? 0);
}

function toPrepQuestion(
  doc: PrepQuestionDocument,
  progress?: UserPrepProgressDocument | null
): PrepQuestion {
  return {
    id: doc.questionId,
    title: doc.title,
    difficulty: doc.difficulty as PrepQuestion["difficulty"],
    topics: doc.topics,
    roleTags: doc.roleTags as CompanyPrepRole[],
    companyTypes: doc.companyTypes.map((tag) => ({
      companyTypeId: tag.companyTypeId,
      frequency: tag.frequency,
      lastSeen: tag.lastSeen,
      stage: tag.stage
    })),
    approach: {
      pattern: doc.approach.pattern,
      signal: doc.approach.signal,
      steps: doc.approach.steps,
      commonMistake: doc.approach.commonMistake,
      timeComplexity: doc.approach.timeComplexity,
      spaceComplexity: doc.approach.spaceComplexity
    },
    sourceRefs: doc.sourceRefs.map((source) => ({ label: source.label, url: source.url ?? undefined })),
    userStatus: progress?.status as CompanyPrepQuestionStatus | undefined,
    savedNoteId: progress?.savedNoteId ?? undefined
  };
}

function conceptAliasScore(topic: string, userSkills: Set<string>, conceptScores: Record<string, number>) {
  const normalizedTopic = normalize(topic);

  if (userSkills.has(normalizedTopic)) return 76;
  if (conceptScores[normalizedTopic] !== undefined) return conceptScores[normalizedTopic];

  if ((userSkills.has("data structures") || userSkills.has("algorithms") || userSkills.has("dsa")) && DSA_TOPICS.has(normalizedTopic)) {
    return 58;
  }

  if (normalizedTopic === "system design" && userSkills.has("backend")) return 54;
  if (normalizedTopic === "frontend" && (userSkills.has("react") || userSkills.has("javascript"))) return 68;
  if (normalizedTopic === "databases" && (userSkills.has("mongodb") || userSkills.has("sql"))) return 65;
  if (normalizedTopic === "ml fundamentals" && (userSkills.has("machine learning") || userSkills.has("python"))) return 58;
  if (normalizedTopic === "python" && userSkills.has("machine learning")) return 60;
  if (normalizedTopic === "apis" && (userSkills.has("rest apis") || userSkills.has("node js"))) return 66;

  return 0;
}

function readinessForTopics(
  topics: string[],
  userSkills: Set<string>,
  conceptScores: Record<string, number>
) {
  return Object.fromEntries(
    Array.from(new Set(topics)).map((topic) => [topic, conceptAliasScore(topic, userSkills, conceptScores)])
  );
}

export function computeCompanyTypeMatch(args: {
  profile: CompanyTypeProfile;
  questions: PrepQuestion[];
  userSkills: string[];
  conceptScores: Record<string, number>;
  role?: CompanyPrepRole;
}) {
  const userSkills = new Set(args.userSkills.map(normalize));
  const topicPool = [
    ...args.profile.focusAreas,
    ...args.profile.questionMix.map((item) => item.topic),
    ...args.questions.flatMap((question) => question.topics)
  ];
  const readiness = readinessForTopics(topicPool, userSkills, args.conceptScores);
  const topicScores = Object.values(readiness);
  const coverage = topicScores.length ? average(topicScores.map((score) => Math.min(100, score))) : 0;
  const roleScore = !args.role || args.profile.roleTags.includes(args.role) ? 18 : 6;
  const selectivityAdjustment = args.profile.selectivity === "elite" ? -8 : args.profile.selectivity === "selective" ? -4 : 4;
  const difficultyAdjustment = args.profile.difficulty === "hard" && coverage < 55 ? -6 : args.profile.difficulty === "easy" ? 4 : 0;
  const score = clampScore(30 + coverage * 0.48 + roleScore + selectivityAdjustment + difficultyAdjustment);
  const sorted = Object.entries(readiness).sort((left, right) => left[1] - right[1]);

  return {
    matchScore: Math.max(20, Math.min(98, score)),
    weakAreas: sorted.filter(([, value]) => value < 55).slice(0, 5).map(([topic]) => topic),
    strongAreas: sorted.filter(([, value]) => value >= 65).sort((left, right) => right[1] - left[1]).slice(0, 5).map(([topic]) => topic)
  };
}

function progressMap(progress: UserPrepProgressDocument[]) {
  return new Map(progress.map((item) => [item.questionId, item]));
}

export function buildCompanyPrepPlan(args: {
  companyTypeId: string;
  role: CompanyPrepRole;
  matchScore: number;
  weakAreas: string[];
  strongAreas: string[];
  questions: PrepQuestion[];
}) {
  const weak = new Set(args.weakAreas.map(normalize));
  const sorted = [...args.questions].sort((left, right) => {
    const leftWeak = left.topics.some((topic) => weak.has(normalize(topic))) ? 18 : 0;
    const rightWeak = right.topics.some((topic) => weak.has(normalize(topic))) ? 18 : 0;
    const leftDifficulty = left.difficulty === "easy" ? 4 : left.difficulty === "medium" ? 8 : 10;
    const rightDifficulty = right.difficulty === "easy" ? 4 : right.difficulty === "medium" ? 8 : 10;

    return (frequencyFor(right, args.companyTypeId) + rightWeak + rightDifficulty)
      - (frequencyFor(left, args.companyTypeId) + leftWeak + leftDifficulty);
  });

  const topQuestions = sorted.slice(0, 30);
  const nextQuestions = topQuestions.filter((question) => question.userStatus !== "solved").slice(0, 12);

  return {
    companyTypeId: args.companyTypeId,
    role: args.role,
    matchScore: args.matchScore,
    weakAreas: args.weakAreas,
    strongAreas: args.strongAreas,
    questionIds: topQuestions.map((question) => question.id),
    nextQuestionIds: nextQuestions.map((question) => question.id),
    generatedAt: new Date().toISOString()
  };
}

async function getUserPrepContext(userId: string) {
  const [user, concepts] = await Promise.all([
    UserModel.findById(userId),
    ConceptNodeModel.find({ userId })
  ]);

  if (!user) throw new ApiError(404, "User not found");

  const conceptScores = concepts.reduce<Record<string, number>>((map, concept) => {
    map[normalize(concept.name)] = concept.retentionScore ?? 0;
    return map;
  }, {});

  return {
    user,
    userSkills: user.currentSkills ?? [],
    conceptScores
  };
}

async function loadQuestionsForCompanyType(companyTypeId: string, role?: CompanyPrepRole) {
  const filter: any = { "companyTypes.companyTypeId": companyTypeId };
  if (role) filter.roleTags = role;
  return PrepQuestionModel.find(filter);
}

async function listCompanyTypes(userId: string, role?: CompanyPrepRole): Promise<CompanyTypeCard[]> {
  await ensureSeedData();
  const [{ userSkills, conceptScores }, profiles, targets] = await Promise.all([
    getUserPrepContext(userId),
    CompanyTypeModel.find().sort({ name: 1 }),
    CompanyPrepTargetModel.find({ userId, status: "active" })
  ]);

  const activeTargets = new Set(targets.map((target) => `${target.companyTypeId}:${target.role}`));

  return Promise.all(profiles.map(async (profileDoc) => {
    const profile = toCompanyTypeProfile(profileDoc);
    const questionDocs = await loadQuestionsForCompanyType(profile.id, role);
    const questions = questionDocs.map((doc) => toPrepQuestion(doc));
    const match = computeCompanyTypeMatch({ profile, questions, userSkills, conceptScores, role });

    return {
      ...profile,
      questionCount: questionDocs.length,
      matchScore: match.matchScore,
      weakAreas: match.weakAreas,
      strongAreas: match.strongAreas,
      targeting: activeTargets.has(`${profile.id}:${role ?? DEFAULT_ROLE}`)
    };
  }));
}

async function getCompanyTypeDetail(
  userId: string,
  companyTypeId: string,
  role?: CompanyPrepRole
): Promise<CompanyTypeDetail> {
  await ensureSeedData();
  const [profileDoc, context, progressItems, target] = await Promise.all([
    CompanyTypeModel.findOne({ typeId: companyTypeId }),
    getUserPrepContext(userId),
    UserPrepProgressModel.find({ userId }),
    CompanyPrepTargetModel.findOne({ userId, companyTypeId, role: role ?? DEFAULT_ROLE, status: "active" })
  ]);

  if (!profileDoc) throw new ApiError(404, "Company type not found");

  const profile = toCompanyTypeProfile(profileDoc);
  const questionDocs = await loadQuestionsForCompanyType(companyTypeId, role);
  const progress = progressMap(progressItems);
  const questions = questionDocs
    .map((doc) => toPrepQuestion(doc, progress.get(doc.questionId)))
    .sort((left, right) => frequencyFor(right, companyTypeId) - frequencyFor(left, companyTypeId));
  const match = computeCompanyTypeMatch({ profile, questions, userSkills: context.userSkills, conceptScores: context.conceptScores, role });
  const patternCounts = questions.reduce<Record<string, number>>((map, question) => {
    map[question.approach.pattern] = (map[question.approach.pattern] ?? 0) + 1;
    return map;
  }, {});

  return {
    ...profile,
    questionCount: questions.length,
    matchScore: match.matchScore,
    weakAreas: match.weakAreas,
    strongAreas: match.strongAreas,
    targeting: Boolean(target),
    questions,
    topPatterns: Object.entries(patternCounts)
      .map(([pattern, count]) => ({ pattern, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 6),
    prepPlan: target ? {
      companyTypeId,
      role: target.role as CompanyPrepRole,
      matchScore: target.matchScore,
      weakAreas: target.weakAreas,
      strongAreas: target.strongAreas,
      questionIds: target.prepQuestionIds,
      nextQuestionIds: target.prepQuestionIds
        .filter((id) => progress.get(id)?.status !== "solved")
        .slice(0, 12),
      generatedAt: target.updatedAt.toISOString()
    } : undefined
  };
}

async function listQuestions(userId: string, query: CompanyPrepQuestionQuery) {
  await ensureSeedData();
  const filter: any = {};
  if (query.companyTypeId) filter["companyTypes.companyTypeId"] = query.companyTypeId;
  if (query.role) filter.roleTags = query.role;
  if (query.topic) filter.topics = query.topic;
  if (query.difficulty) filter.difficulty = query.difficulty;

  const [questionDocs, progressItems] = await Promise.all([
    PrepQuestionModel.find(filter),
    UserPrepProgressModel.find({ userId })
  ]);

  const progress = progressMap(progressItems);
  let questions = questionDocs.map((doc) => toPrepQuestion(doc, progress.get(doc.questionId)));

  if (query.status && query.status !== "all") {
    questions = questions.filter((question) =>
      query.status === "unseen" ? !question.userStatus : question.userStatus === query.status
    );
  }

  if (query.sort === "title") {
    questions.sort((left, right) => left.title.localeCompare(right.title));
  } else if (query.sort === "difficulty") {
    const difficultyRank = { easy: 1, medium: 2, hard: 3 };
    questions.sort((left, right) => difficultyRank[left.difficulty] - difficultyRank[right.difficulty]);
  } else {
    questions.sort((left, right) => frequencyFor(right, query.companyTypeId) - frequencyFor(left, query.companyTypeId));
  }

  return questions;
}

async function updateQuestionStatus(
  userId: string,
  questionId: string,
  status: CompanyPrepQuestionStatus
) {
  await ensureSeedData();
  const question = await PrepQuestionModel.findOne({ questionId });
  if (!question) throw new ApiError(404, "Question not found");

  const progress = await UserPrepProgressModel.findOneAndUpdate(
    { userId, questionId },
    {
      $set: {
        status,
        lastPracticedAt: new Date()
      }
    },
    { upsert: true, new: true }
  );

  const eventType = status === "solved" ? "COMPANY_PREP_QUESTION_SOLVED" : "COMPANY_PREP_QUESTION_ATTEMPTED";
  studentIntelligenceService.emitEvent(userId, {
    type: eventType as any,
    source: "company-prep" as any,
    entityId: questionId,
    payload: { title: question.title, topics: question.topics, status }
  }).catch((error) => console.error("Company prep progress event failed:", error));

  return toPrepQuestion(question, progress);
}

async function saveQuestionToNotes(userId: string, questionId: string) {
  await ensureSeedData();
  const question = await PrepQuestionModel.findOne({ questionId });
  if (!question) throw new ApiError(404, "Question not found");

  const existing = await NoteModel.findOne({
    userId,
    deleted: { $ne: true },
    "metadata.companyPrep.questionId": questionId
  });

  if (existing) {
    await UserPrepProgressModel.findOneAndUpdate(
      { userId, questionId },
      { $set: { savedNoteId: existing._id.toString(), lastPracticedAt: new Date() }, $setOnInsert: { status: "bookmarked" } },
      { upsert: true, new: true }
    );
    return { noteId: existing._id.toString(), created: false };
  }

  const companyTypeIds = question.companyTypes.map((tag) => tag.companyTypeId);
  const companyTypes = await CompanyTypeModel.find({ typeId: { $in: companyTypeIds } });
  const companyNames = companyTypes.map((companyType) => companyType.name);
  const content = [
    `Approach pattern: ${question.approach.pattern}`,
    `Signal: ${question.approach.signal}`,
    "",
    "Steps:",
    ...question.approach.steps.map((step, index) => `${index + 1}. ${step}`),
    "",
    `Common mistake: ${question.approach.commonMistake}`,
    `Complexity: ${question.approach.timeComplexity} time, ${question.approach.spaceComplexity} space`,
    "",
    `Company type relevance: ${companyNames.join(", ")}`
  ].join("\n");

  const note = await notesService.createNote(userId, {
    title: `Approach Pattern: ${question.title}`,
    content,
    topic: question.topics[0] ?? "Company Prep",
    tags: Array.from(new Set(["company-prep", question.approach.pattern, ...question.topics, ...companyNames])),
    linkedSkills: question.topics,
    strength: 0.2,
    nextReviewAt: new Date().toISOString(),
    metadata: {
      companyPrep: {
        questionId,
        questionTitle: question.title,
        companyTypeIds,
        companyTypeNames: companyNames,
        pattern: question.approach.pattern,
        savedAt: new Date().toISOString()
      }
    }
  });

  await UserPrepProgressModel.findOneAndUpdate(
    { userId, questionId },
    { $set: { savedNoteId: note.id, lastPracticedAt: new Date() }, $setOnInsert: { status: "bookmarked" } },
    { upsert: true, new: true }
  );

  studentIntelligenceService.emitEvent(userId, {
    type: "COMPANY_PREP_APPROACH_SAVED" as any,
    source: "company-prep" as any,
    entityId: questionId,
    payload: { noteId: note.id, title: question.title, companyTypes: companyNames, topics: question.topics }
  }).catch((error) => console.error("Company prep save event failed:", error));

  return { noteId: note.id, created: true };
}

async function startPrep(userId: string, companyTypeId: string, role: CompanyPrepRole = DEFAULT_ROLE, targetDate?: string) {
  const detail = await getCompanyTypeDetail(userId, companyTypeId, role);
  const plan = buildCompanyPrepPlan({
    companyTypeId,
    role,
    matchScore: detail.matchScore,
    weakAreas: detail.weakAreas,
    strongAreas: detail.strongAreas,
    questions: detail.questions
  });

  await CompanyPrepTargetModel.findOneAndUpdate(
    { userId, companyTypeId, role },
    {
      $set: {
        matchScore: plan.matchScore,
        weakAreas: plan.weakAreas,
        strongAreas: plan.strongAreas,
        prepQuestionIds: plan.questionIds,
        completedQuestionIds: detail.questions.filter((question) => question.userStatus === "solved").map((question) => question.id),
        targetDate: targetDate ? new Date(targetDate) : null,
        status: "active"
      }
    },
    { upsert: true, new: true }
  );

  studentIntelligenceService.emitEvent(userId, {
    type: "COMPANY_TYPE_TARGETED" as any,
    source: "company-prep" as any,
    entityId: companyTypeId,
    payload: {
      companyType: detail.name,
      role,
      matchScore: plan.matchScore,
      weakAreas: plan.weakAreas,
      nextQuestionIds: plan.nextQuestionIds,
      targetDate
    }
  }).catch((error) => console.error("Company prep target event failed:", error));

  return plan;
}

async function getVedaContext(userId: string) {
  await ensureSeedData();
  const targets = await CompanyPrepTargetModel.find({ userId, status: "active" }).sort({ updatedAt: -1 }).limit(3);
  if (targets.length === 0) return "";

  const lines: string[] = ["Company Type Prep Targets:"];
  for (const target of targets) {
    const [profile, questions, progressItems] = await Promise.all([
      CompanyTypeModel.findOne({ typeId: target.companyTypeId }),
      PrepQuestionModel.find({ questionId: { $in: target.prepQuestionIds } }),
      UserPrepProgressModel.find({ userId, questionId: { $in: target.prepQuestionIds } })
    ]);

    const progress = progressMap(progressItems);
    const nextQuestions = target.prepQuestionIds
      .map((id) => questions.find((question) => question.questionId === id))
      .filter((question): question is PrepQuestionDocument => Boolean(question))
      .filter((question) => progress.get(question.questionId)?.status !== "solved")
      .slice(0, 5)
      .map((question) => question.title);

    lines.push([
      `${profile?.name ?? target.companyTypeId} for ${target.role}: ${target.matchScore}% match.`,
      `Weak areas: ${target.weakAreas.slice(0, 5).join(", ") || "none detected"}.`,
      `Next prep questions: ${nextQuestions.join(", ") || "all planned questions solved"}.`,
      target.targetDate ? `Target date: ${target.targetDate.toISOString().slice(0, 10)}.` : ""
    ].filter(Boolean).join(" "));
  }

  return lines.join("\n");
}

export const companyPrepService = {
  ensureSeedData,
  listCompanyTypes,
  getCompanyTypeDetail,
  listQuestions,
  updateQuestionStatus,
  saveQuestionToNotes,
  startPrep,
  getVedaContext
};

export const __companyPrepTestUtils = {
  computeCompanyTypeMatch,
  buildCompanyPrepPlan,
  validateSeedData() {
    const companyTypeIds = new Set(COMPANY_TYPE_SEEDS.map((profile) => profile.id));
    const questionIds = new Set<string>();

    for (const question of PREP_QUESTION_SEEDS) {
      if (questionIds.has(question.id)) return false;
      questionIds.add(question.id);
      if (!question.title || !question.approach.pattern || question.topics.length === 0) return false;
      if (question.companyTypes.some((tag) => !companyTypeIds.has(tag.companyTypeId) || tag.frequency < 0 || tag.frequency > 100)) return false;
    }

    return COMPANY_TYPE_SEEDS.length >= 8 && PREP_QUESTION_SEEDS.length >= 100;
  }
};
