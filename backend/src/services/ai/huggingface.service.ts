import axios from "axios";
import { env } from "../../config/env.js";
import { requestContextStorage } from "../../core/context.js";

type HuggingFaceFeatureResponse = number[] | number[][] | number[][][];

const HUGGINGFACE_BASE_URL = "https://api-inference.huggingface.co/pipeline/feature-extraction";

/** Flattens HuggingFace feature extraction output into a single embedding vector. */
function normalizeFeatureResponse(output: HuggingFaceFeatureResponse): number[] {
  const rows: number[][] = [];

  /** Recursively collects numeric vectors from nested HuggingFace output. */
  function collectRows(value: HuggingFaceFeatureResponse | number[]) {
    if (!Array.isArray(value) || value.length === 0) {
      return;
    }

    if (typeof value[0] === "number") {
      rows.push(value as number[]);
      return;
    }

    for (const child of value as HuggingFaceFeatureResponse[]) {
      collectRows(child);
    }
  }

  collectRows(output);

  if (rows.length === 0) {
    return [];
  }

  const dimensions = Math.max(...rows.map((row) => row.length));

  return Array.from({ length: dimensions }, (_value, index) => {
    const total = rows.reduce((sum, row) => sum + (row[index] ?? 0), 0);
    return total / rows.length;
  });
}

/** Calls HuggingFace's free inference API for a text embedding. */
async function embedText(text: string) {
  const store = requestContextStorage.getStore();
  const apiKey = store?.apiKeys?.huggingface || env.huggingFaceApiKey;

  if (!apiKey) {
    throw new Error("HuggingFace API key is not configured.");
  }

  const response = await axios.post<HuggingFaceFeatureResponse>(
    `${HUGGINGFACE_BASE_URL}/${env.huggingFaceEmbeddingModel}`,
    {
      inputs: text,
      options: {
        wait_for_model: true
      }
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      timeout: 15000
    }
  );

  return normalizeFeatureResponse(response.data);
}

export const huggingFaceService = {
  embedText
};
