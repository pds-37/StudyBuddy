/** Browser-safe environment variables exposed by Vite. */
export const env = {
  appName: import.meta.env.VITE_APP_NAME ?? "StudyBuddy",
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api"
} as const;
