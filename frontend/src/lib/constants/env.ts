const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";

export const env = {
  appName: import.meta.env.VITE_APP_NAME ?? "StudyBuddy",
  apiBaseUrl: rawApiBaseUrl.endsWith("/api") ? rawApiBaseUrl : `${rawApiBaseUrl}/api`
} as const;
