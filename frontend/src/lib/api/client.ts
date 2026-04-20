import axios from "axios";
import { env } from "../constants/env";

/** Axios instance for all browser-to-API requests. */
export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true
});

/** Updates the bearer token attached to API requests. */
export function setApiAccessToken(token: string | null) {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete apiClient.defaults.headers.common.Authorization;
}
