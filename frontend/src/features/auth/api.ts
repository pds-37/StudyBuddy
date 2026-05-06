import { apiClient } from "../../lib/api/client";
import { type AuthResponse, type LoginPayload, type SignupPayload } from "./types";

/** Creates a user account and returns JWT tokens. */
async function signup(payload: SignupPayload) {
  const response = await apiClient.post<AuthResponse>("/auth/signup", payload);
  return response.data;
}

/** Logs in a user and returns JWT tokens. */
async function login(payload: LoginPayload) {
  const response = await apiClient.post<AuthResponse>("/auth/login", payload);
  return response.data;
}

/** Loads the current authenticated user from the API. */
async function me() {
  const response = await apiClient.get<{ user: AuthResponse["user"] }>("/auth/me");
  return response.data.user;
}

/** Requests fresh JWT tokens using the refresh token. */
async function refresh(refreshToken: string) {
  const response = await apiClient.post<AuthResponse>("/auth/refresh", { refreshToken });
  return response.data;
}

/** Calls the logout endpoint for a consistent auth API shape. */
async function logout() {
  await apiClient.post("/auth/logout");
}

/** Authenticates with Google and returns JWT tokens. */
async function googleLogin(idToken: string) {
  const response = await apiClient.post<AuthResponse>("/auth/google", { idToken });
  return response.data;
}

export const authApi = {
  signup,
  login,
  me,
  refresh,
  logout,
  googleLogin
};
