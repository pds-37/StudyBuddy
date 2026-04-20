import { huggingFaceService } from "./huggingface.service.js";

const FALLBACK_DIMENSIONS = 96;

/** Converts text into stable tokens for local fallback matching. */
function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#. ]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** Produces a small deterministic hash for a token. */
function hashToken(token: string) {
  let hash = 0;

  for (let index = 0; index < token.length; index += 1) {
    hash = (hash * 31 + token.charCodeAt(index)) % FALLBACK_DIMENSIONS;
  }

  return hash;
}

/** Creates a local bag-of-words vector when the free HuggingFace API is unavailable. */
function createFallbackEmbedding(text: string) {
  const vector = Array.from({ length: FALLBACK_DIMENSIONS }, () => 0);

  for (const token of tokenize(text)) {
    vector[hashToken(token)] += 1;
  }

  return vector;
}

/** Calculates cosine similarity for two vectors. */
function cosineSimilarity(left: number[], right: number[]) {
  const length = Math.min(left.length, right.length);
  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let index = 0; index < length; index += 1) {
    dot += left[index] * right[index];
    leftMagnitude += left[index] ** 2;
    rightMagnitude += right[index] ** 2;
  }

  if (leftMagnitude === 0 || rightMagnitude === 0) {
    return 0;
  }

  return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
}

/** Returns a remote HuggingFace embedding or a local fallback embedding. */
async function embedText(text: string) {
  try {
    const remoteEmbedding = await huggingFaceService.embedText(text);

    if (remoteEmbedding.length > 0) {
      return {
        vector: remoteEmbedding,
        provider: "huggingface" as const
      };
    }
  } catch {
    // The fallback keeps the solo-dev MVP usable without paid or unavailable APIs.
  }

  return {
    vector: createFallbackEmbedding(text),
    provider: "local-fallback" as const
  };
}

/** Finds the closest user skill to a required skill. */
async function findBestSkillMatch(requiredSkill: string, userSkills: string[]) {
  const requiredEmbedding = await embedText(requiredSkill);
  let bestMatch = {
    skill: "",
    similarity: 0,
    provider: requiredEmbedding.provider
  };

  for (const userSkill of userSkills) {
    const userEmbedding = await embedText(userSkill);
    const similarity = cosineSimilarity(requiredEmbedding.vector, userEmbedding.vector);

    if (similarity > bestMatch.similarity) {
      bestMatch = {
        skill: userSkill,
        similarity,
        provider: userEmbedding.provider === "huggingface" ? "huggingface" : requiredEmbedding.provider
      };
    }
  }

  return bestMatch;
}

export const embeddingsService = {
  embedText,
  findBestSkillMatch,
  cosineSimilarity
};
