const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";

export const env = {
  appName: import.meta.env.VITE_APP_NAME ?? "StudyBuddy",
  apiBaseUrl: rawApiBaseUrl.endsWith("/api") ? rawApiBaseUrl : `${rawApiBaseUrl}/api`,
  vapidPublicKey: "BNfNZ5jlAnRrUaP6jWqOKY2Ngvqs1nVIxjQ2_a_jMU-S99jIk_yP972B6ApsygIwJ9nvaGQ9NBy6biMVPBWi3Pg"
} as const;
