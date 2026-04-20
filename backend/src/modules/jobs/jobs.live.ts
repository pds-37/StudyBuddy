import axios from "axios";
import { env } from "../../config/env.js";
import { DEFAULT_ONET_SKILLS } from "../skills/default-skills.js";
import type { EnrichedJobListing } from "./jobs.types.js";

type JobSearchContext = {
  query: string;
  location: string;
  limit: number;
};

type JSearchApplyOption = {
  publisher?: string | null;
  apply_link?: string | null;
  is_direct?: boolean | null;
};

type JSearchJob = {
  job_id?: string | null;
  employer_name?: string | null;
  job_title?: string | null;
  job_city?: string | null;
  job_state?: string | null;
  job_country?: string | null;
  job_description?: string | null;
  job_apply_link?: string | null;
  job_publisher?: string | null;
  job_posted_at_datetime_utc?: string | null;
  job_employment_type?: string | null;
  job_is_remote?: boolean | null;
  job_min_salary?: number | null;
  job_max_salary?: number | null;
  job_salary_currency?: string | null;
  job_required_skills?: string[] | null;
  job_highlights?: Record<string, string[] | null> | null;
  apply_options?: JSearchApplyOption[] | null;
};

type JSearchResponse = {
  data?: JSearchJob[];
};

type AdzunaJob = {
  id?: string | number;
  title?: string;
  description?: string;
  created?: string;
  redirect_url?: string;
  contract_time?: string;
  contract_type?: string;
  salary_min?: number;
  salary_max?: number;
  company?: {
    display_name?: string;
  };
  location?: {
    display_name?: string;
  };
  category?: {
    label?: string;
  };
};

type AdzunaResponse = {
  results?: AdzunaJob[];
};

const liveJobsCache = new Map<string, { expiresAt: number; jobs: EnrichedJobListing[] }>();

/** Compacts repeated whitespace while preserving readability. */
function compactWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

/** Returns a unique array of non-empty strings. */
function uniqueStrings(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map((value) => value?.trim()).filter(Boolean) as string[]));
}

/** Picks a stable text snippet for the UI. */
function toDescriptionSnippet(value: string | null | undefined, maxLength: number = 280) {
  if (!value) {
    return undefined;
  }

  const compact = compactWhitespace(value);
  return compact.length > maxLength ? `${compact.slice(0, maxLength - 3)}...` : compact;
}

/** Chooses the best available apply link. */
function pickApplyUrl(fallbackUrl: string | null | undefined, applyOptions: JSearchApplyOption[]) {
  const directOption = applyOptions.find((option) => option.apply_link && option.is_direct);
  const anyOption = applyOptions.find((option) => option.apply_link);

  return directOption?.apply_link ?? anyOption?.apply_link ?? fallbackUrl ?? undefined;
}

/** Builds a readable location label from partial upstream fields. */
function formatLocation(parts: Array<string | null | undefined>, fallback: string) {
  const joined = uniqueStrings(parts).join(", ");
  return joined || fallback;
}

/** Extracts likely skills from free-text job content. */
function extractSkillsFromText(...sections: Array<string | null | undefined>) {
  const haystack = compactWhitespace(sections.filter(Boolean).join(" ")).toLowerCase();

  if (!haystack) {
    return [];
  }

  const matches = DEFAULT_ONET_SKILLS.filter((skill) => {
    const variants = [skill.name, ...skill.aliases].map((value) => value.toLowerCase());
    return variants.some((variant) => haystack.includes(variant));
  }).map((skill) => skill.name);

  return Array.from(new Set(matches)).slice(0, 12);
}

/** Deduplicates listings gathered across providers. */
function dedupeJobs(jobs: EnrichedJobListing[]) {
  const seen = new Set<string>();

  return jobs.filter((job) => {
    const key = `${job.applyUrl ?? ""}|${job.title.toLowerCase()}|${job.company.toLowerCase()}|${job.location.toLowerCase()}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

/** Maps one JSearch response object into the app's public job shape. */
function mapJSearchJob(job: JSearchJob): EnrichedJobListing | null {
  if (!job.job_title || !job.employer_name) {
    return null;
  }

  const applyOptions = Array.isArray(job.apply_options) ? job.apply_options : [];
  const highlightText = Object.values(job.job_highlights ?? {})
    .flatMap((section) => section ?? [])
    .join(" ");

  const requiredSkills = uniqueStrings([
    ...(Array.isArray(job.job_required_skills) ? job.job_required_skills : []),
    ...extractSkillsFromText(job.job_description, highlightText)
  ]);

  const sources = uniqueStrings([
    job.job_publisher,
    ...applyOptions.map((option) => option.publisher ?? undefined)
  ]);

  return {
    id: String(job.job_id ?? `${job.employer_name}:${job.job_title}`),
    title: job.job_title,
    company: job.employer_name,
    location: formatLocation([job.job_city, job.job_state, job.job_country], "Location not specified"),
    requiredSkills,
    applyUrl: pickApplyUrl(job.job_apply_link, applyOptions),
    source: sources[0],
    sources,
    provider: "jsearch",
    postedAt: job.job_posted_at_datetime_utc ?? undefined,
    employmentType: job.job_employment_type ?? undefined,
    isRemote: job.job_is_remote ?? undefined,
    salaryMin: job.job_min_salary ?? undefined,
    salaryMax: job.job_max_salary ?? undefined,
    salaryCurrency: job.job_salary_currency ?? undefined,
    description: toDescriptionSnippet(job.job_description)
  };
}

/** Maps one Adzuna result into the app's public job shape. */
function mapAdzunaJob(job: AdzunaJob): EnrichedJobListing | null {
  if (!job.title || !job.company?.display_name) {
    return null;
  }

  const employmentType = [job.contract_time, job.contract_type]
    .filter(Boolean)
    .map((value) => value?.replaceAll("_", " "))
    .join(" / ") || undefined;

  return {
    id: String(job.id ?? `${job.company.display_name}:${job.title}`),
    title: job.title,
    company: job.company.display_name,
    location: job.location?.display_name ?? "Location not specified",
    requiredSkills: extractSkillsFromText(job.title, job.description, job.category?.label),
    applyUrl: job.redirect_url ?? undefined,
    source: "Adzuna",
    sources: ["Adzuna"],
    provider: "adzuna",
    postedAt: job.created ?? undefined,
    employmentType,
    isRemote: job.location?.display_name?.toLowerCase().includes("remote") ?? false,
    salaryMin: job.salary_min ?? undefined,
    salaryMax: job.salary_max ?? undefined,
    description: toDescriptionSnippet(job.description)
  };
}

/** Fetches multi-source jobs through JSearch. */
async function fetchJobsFromJSearch(context: JobSearchContext): Promise<EnrichedJobListing[]> {
  if (!env.jsearchApiKey) {
    return [];
  }

  const response = await axios.get<JSearchResponse>(`${env.jsearchBaseUrl}/search`, {
    params: {
      query: `${context.query}${context.location ? ` in ${context.location}` : ""}`,
      page: 1,
      num_pages: Math.max(1, Math.min(3, Math.ceil(context.limit / 10))),
      date_posted: env.jobSearchDatePosted,
      employment_types: env.jobSearchEmploymentTypes.join(",")
    },
    headers: {
      "X-RapidAPI-Key": env.jsearchApiKey,
      "X-RapidAPI-Host": env.jsearchApiHost
    },
    timeout: 15000
  });

  return dedupeJobs(
    (response.data.data ?? [])
      .map(mapJSearchJob)
      .filter((job): job is EnrichedJobListing => Boolean(job))
  ).slice(0, context.limit);
}

/** Fetches jobs through Adzuna's official jobs API. */
async function fetchJobsFromAdzuna(context: JobSearchContext): Promise<EnrichedJobListing[]> {
  if (!env.adzunaAppId || !env.adzunaAppKey) {
    return [];
  }

  const response = await axios.get<AdzunaResponse>(
    `https://api.adzuna.com/v1/api/jobs/${env.adzunaCountry}/search/1`,
    {
      params: {
        app_id: env.adzunaAppId,
        app_key: env.adzunaAppKey,
        results_per_page: Math.min(context.limit, 50),
        what: context.query,
        where: context.location,
        "content-type": "application/json"
      },
      headers: {
        Accept: "application/json"
      },
      timeout: 15000
    }
  );

  return dedupeJobs(
    (response.data.results ?? [])
      .map(mapAdzunaJob)
      .filter((job): job is EnrichedJobListing => Boolean(job))
  ).slice(0, context.limit);
}

/** Chooses configured providers and merges their live results. */
async function fetchConfiguredProviderJobs(context: JobSearchContext) {
  const providerMode = env.jobSearchProvider.toLowerCase();
  const providerFetchers = [
    { name: "jsearch", fetcher: fetchJobsFromJSearch },
    { name: "adzuna", fetcher: fetchJobsFromAdzuna }
  ] as const;

  const selectedProviders =
    providerMode === "auto"
      ? providerFetchers
      : providerFetchers.filter((provider) => provider.name === providerMode);

  const collectedJobs: EnrichedJobListing[] = [];

  for (const provider of selectedProviders) {
    try {
      const providerJobs = await provider.fetcher(context);
      collectedJobs.push(...providerJobs);

      if (providerMode !== "auto" && providerJobs.length > 0) {
        break;
      }
    } catch (error) {
      console.warn(`Failed to fetch jobs from ${provider.name}:`, error);
    }
  }

  return dedupeJobs(collectedJobs).slice(0, context.limit);
}

/** Fetches live jobs with a short in-memory cache to protect upstream quotas. */
export async function fetchLiveJobs(context: JobSearchContext) {
  const cacheKey = [context.query, context.location, context.limit, env.jobSearchProvider].join("|").toLowerCase();
  const cached = liveJobsCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.jobs;
  }

  const jobs = await fetchConfiguredProviderJobs(context);
  liveJobsCache.set(cacheKey, {
    jobs,
    expiresAt: Date.now() + env.jobSearchCacheTtlMs
  });

  return jobs;
}
