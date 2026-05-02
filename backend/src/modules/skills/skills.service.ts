import { DEFAULT_ONET_SKILLS } from "./default-skills.js";
import { embeddingsService } from "../../services/ai/embeddings.service.js";
import { UserModel } from "../users/user.model.js";
import { ApiError } from "../../utils/api-error.js";
import { ROLE_REQUIREMENTS } from "./role-requirements.js";
import { SkillTaxonomyModel, type SkillTaxonomyDocument } from "./skill-taxonomy.model.js";

type SkillSuggestion = {
  id: string;
  name: string;
  category: string;
  source: string;
  aliases: string[];
};

type SkillGapItem = {
  skill: string;
  category: string;
  requiredScore: number;
  userScore: number;
  gapScore: number;
  matchedUserSkill: string | null;
  status: "strong" | "partial" | "missing";
  priority: "high" | "medium" | "low";
};

type SkillMatch = {
  skill: string;
  similarity: number;
  provider: "huggingface" | "local-fallback";
};

/** Normalizes skill names for matching and unique storage. */
function normalizeSkillName(value: string) {
  return value.trim().toLowerCase();
}

/** Converts an embedding similarity score into a 0-100 user skill score. */
function similarityToScore(similarity: number) {
  return Math.max(0, Math.min(100, Math.round(similarity * 100)));
}

/** Returns the category for a skill name using starter taxonomy data. */
function getSkillCategory(skillName: string) {
  const normalizedSkill = normalizeSkillName(skillName);
  const match = DEFAULT_ONET_SKILLS.find(
    (skill) =>
      normalizeSkillName(skill.name) === normalizedSkill ||
      skill.aliases.some((alias) => normalizeSkillName(alias) === normalizedSkill)
  );

  return match?.category ?? "Role Skill";
}

/** Maps a user score to a readable skill status. */
function getSkillStatus(userScore: number): SkillGapItem["status"] {
  if (userScore >= 80) {
    return "strong";
  }

  if (userScore >= 45) {
    return "partial";
  }

  return "missing";
}

/** Maps a gap score to a recommended priority. */
function getGapPriority(gapScore: number): SkillGapItem["priority"] {
  if (gapScore >= 60) {
    return "high";
  }

  if (gapScore >= 30) {
    return "medium";
  }

  return "low";
}

/** Selects role requirements from a known role or derives them from related skills. */
function getRequiredSkillsForRole(targetRole: string) {
  const normalizedRole = normalizeSkillName(targetRole);
  const exactRole = ROLE_REQUIREMENTS.find((requirement) => normalizeSkillName(requirement.role) === normalizedRole);

  if (exactRole) {
    return exactRole.skills;
  }

  const fuzzyRole = ROLE_REQUIREMENTS.find(
    (requirement) =>
      normalizeSkillName(requirement.role).includes(normalizedRole) ||
      normalizedRole.includes(normalizeSkillName(requirement.role))
  );

  if (fuzzyRole) {
    return fuzzyRole.skills;
  }

  const relatedSkills = DEFAULT_ONET_SKILLS.filter((skill) =>
    skill.relatedRoles.some((role) => {
      const normalizedRelatedRole = normalizeSkillName(role);
      return normalizedRelatedRole === "all roles" || normalizedRelatedRole.includes(normalizedRole) || normalizedRole.includes(normalizedRelatedRole);
    })
  ).map((skill) => skill.name);

  if (relatedSkills.length > 0) {
    return Array.from(new Set(relatedSkills)).slice(0, 8);
  }

  return ["Problem Solving", "Communication", "Git", "Resume Writing"];
}

/** Converts a skill document into the public suggestion shape. */
function toSuggestion(skill: SkillTaxonomyDocument): SkillSuggestion {
  return {
    id: String(skill._id),
    name: skill.name,
    category: skill.category,
    source: skill.source,
    aliases: skill.aliases
  };
}

/** Builds fallback suggestions from the local O*NET-style starter taxonomy. */
function searchDefaultSkills(query: string, limit: number): SkillSuggestion[] {
  const normalizedQuery = normalizeSkillName(query);
  const filtered = DEFAULT_ONET_SKILLS.filter((skill) => {
    if (!normalizedQuery) {
      return true;
    }

    return (
      normalizeSkillName(skill.name).includes(normalizedQuery) ||
      skill.aliases.some((alias) => normalizeSkillName(alias).includes(normalizedQuery)) ||
      normalizeSkillName(skill.category).includes(normalizedQuery)
    );
  });

  return filtered.slice(0, limit).map((skill) => ({
    id: `default:${normalizeSkillName(skill.name).replaceAll(" ", "-")}`,
    name: skill.name,
    category: skill.category,
    source: "onet",
    aliases: skill.aliases
  }));
}

/** Searches MongoDB skill taxonomy, falling back to starter O*NET-style skills. */
async function searchSkills(query: string, limit: number) {
  const trimmedQuery = query.trim();
  const mongoFilter = trimmedQuery
    ? {
        $or: [
          { name: { $regex: trimmedQuery, $options: "i" } },
          { normalizedName: { $regex: normalizeSkillName(trimmedQuery), $options: "i" } },
          { aliases: { $regex: trimmedQuery, $options: "i" } },
          { category: { $regex: trimmedQuery, $options: "i" } }
        ]
      }
    : {};

  const matches = await SkillTaxonomyModel.find(mongoFilter).limit(limit).sort({ name: 1 });

  if (matches.length > 0) {
    return matches.map(toSuggestion);
  }

  return searchDefaultSkills(trimmedQuery, limit);
}

/** Analyzes current user skills against the target role's required skills. */
async function analyzeSkillGap(userId: string) {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  if (user.targetRoles.length === 0 || user.currentSkills.length === 0) {
    throw new ApiError(400, "Complete onboarding before running skill gap analysis.");
  }

  // Aggregate required skills from all target roles
  const allRequiredSkills = new Set<string>();
  for (const role of user.targetRoles) {
    getRequiredSkillsForRole(role).forEach(skill => allRequiredSkills.add(skill));
  }
  
  const requiredSkills = Array.from(allRequiredSkills);
  const gapItems: SkillGapItem[] = [];
  let provider: "huggingface" | "local-fallback" = "local-fallback";

  for (const requiredSkill of requiredSkills) {
    const exactMatch = user.currentSkills.find((skill) => normalizeSkillName(skill) === normalizeSkillName(requiredSkill));
    const match: SkillMatch = exactMatch
      ? { skill: exactMatch, similarity: 1, provider }
      : await embeddingsService.findBestSkillMatch(requiredSkill, user.currentSkills);

    provider = match.provider;

    const userScore = similarityToScore(match.similarity);
    const gapScore = Math.max(0, 100 - userScore);

    gapItems.push({
      skill: requiredSkill,
      category: getSkillCategory(requiredSkill),
      requiredScore: 100,
      userScore,
      gapScore,
      matchedUserSkill: match.skill || null,
      status: getSkillStatus(userScore),
      priority: getGapPriority(gapScore)
    });
  }

  const overallScore =
    gapItems.length === 0 ? 0 : Math.round(gapItems.reduce((total, item) => total + item.userScore, 0) / gapItems.length);
  const missingSkills = gapItems.filter((item) => item.status === "missing").map((item) => item.skill);
  const partialSkills = gapItems.filter((item) => item.status === "partial").map((item) => item.skill);

  return {
    targetRole: user.targetRoles.join(", "),
    experienceLevel: user.experienceLevel,
    currentSkills: user.currentSkills,
    overallScore,
    provider,
    gaps: gapItems.sort((left, right) => right.gapScore - left.gapScore),
    recommendations: {
      nextSkills: gapItems
        .filter((item) => item.priority === "high")
        .slice(0, 3)
        .map((item) => item.skill),
      missingSkills,
      partialSkills
    }
  };
}

/** Seeds the starter skill list into MongoDB without duplicating existing skills. */
async function seedDefaultSkills() {
  await Promise.all(
    DEFAULT_ONET_SKILLS.map((skill) =>
      SkillTaxonomyModel.updateOne(
        { normalizedName: normalizeSkillName(skill.name) },
        {
          $setOnInsert: {
            source: "onet",
            sourceSkillId: "",
            name: skill.name,
            normalizedName: normalizeSkillName(skill.name),
            aliases: skill.aliases,
            category: skill.category,
            relatedRoles: skill.relatedRoles
          }
        },
        { upsert: true }
      )
    )
  );
}

export const skillsService = {
  searchSkills,
  analyzeSkillGap,
  seedDefaultSkills
};
