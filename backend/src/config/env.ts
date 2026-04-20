import "dotenv/config";

/** Reads a required environment variable or returns a development fallback. */
function readEnv(key: string, fallback: string) {
  return process.env[key] ?? fallback;
}

/** Reads a comma-separated list environment variable. */
function readListEnv(key: string, fallback: string[]) {
  const value = process.env[key];

  if (!value) {
    return fallback;
  }

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

/** Reads a boolean environment variable with a sane fallback. */
function readBoolEnv(key: string, fallback: boolean) {
  const value = process.env[key];

  if (value === undefined) {
    return fallback;
  }

  return value.trim().toLowerCase() === "true";
}

/** Reads a numeric environment variable. */
function readNumberEnv(key: string, fallback: number) {
  const value = process.env[key];

  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** Compiles optional origin regex patterns for preview deployments. */
function readRegexListEnv(key: string) {
  return readListEnv(key, []).map((pattern) => new RegExp(pattern));
}

/** Runtime configuration shared by backend modules. */
export const env = {
  nodeEnv: readEnv("NODE_ENV", "development"),
  port: Number(readEnv("PORT", "5000")),
  clientOrigins: readListEnv("CLIENT_ORIGIN", ["http://localhost:5173"]),
  clientOriginRegexes: readRegexListEnv("CLIENT_ORIGIN_REGEX"),
  mongoUri: readEnv("MONGODB_URI", "mongodb://127.0.0.1:27017/studybuddy-career-copilot"),
  mongoDbName: readEnv("MONGODB_DB_NAME", "studybuddy_career_copilot"),
  atlasVectorIndexName: readEnv("ATLAS_VECTOR_INDEX_NAME", "skill_vector_index"),
  atlasVectorPath: readEnv("ATLAS_VECTOR_PATH", "embedding"),
  jwtAccessSecret: readEnv("JWT_ACCESS_SECRET", "replace_me"),
  jwtRefreshSecret: readEnv("JWT_REFRESH_SECRET", "replace_me"),
  jwtAccessExpiresIn: readEnv("JWT_ACCESS_EXPIRES_IN", "15m"),
  jwtRefreshExpiresIn: readEnv("JWT_REFRESH_EXPIRES_IN", "7d"),
  groqApiKey: readEnv("GROQ_API_KEY", ""),
  geminiApiKey: readEnv("GOOGLE_GEMINI_API_KEY", ""),
  huggingFaceApiKey: readEnv("HUGGINGFACE_API_KEY", ""),
  huggingFaceEmbeddingModel: readEnv("HUGGINGFACE_EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2"),
  huggingFaceNerModel: readEnv("HUGGINGFACE_NER_MODEL", "dslim/bert-base-NER"),
  jobSearchProvider: readEnv("JOB_SEARCH_PROVIDER", "auto"),
  jobSearchLocation: readEnv("JOB_SEARCH_LOCATION", "India"),
  jobSearchFallbackQuery: readEnv("JOB_SEARCH_FALLBACK_QUERY", "software engineer"),
  jobSearchDatePosted: readEnv("JOB_SEARCH_DATE_POSTED", "3days"),
  jobSearchEmploymentTypes: readListEnv("JOB_SEARCH_EMPLOYMENT_TYPES", ["FULLTIME"]),
  jobSearchCacheTtlMs: readNumberEnv("JOB_SEARCH_CACHE_TTL_MS", 5 * 60 * 1000),
  jobSearchPreferRemote: readBoolEnv("JOB_SEARCH_PREFER_REMOTE", false),
  jsearchApiKey: readEnv("JSEARCH_API_KEY", ""),
  jsearchApiHost: readEnv("JSEARCH_API_HOST", "jsearch.p.rapidapi.com"),
  jsearchBaseUrl: readEnv("JSEARCH_BASE_URL", "https://jsearch.p.rapidapi.com"),
  adzunaAppId: readEnv("ADZUNA_APP_ID", ""),
  adzunaAppKey: readEnv("ADZUNA_APP_KEY", ""),
  adzunaCountry: readEnv("ADZUNA_COUNTRY", "in"),
  logLevel: readEnv("LOG_LEVEL", "dev")
} as const;
