import axios from "axios";

type ApiErrorPayload = {
  message?: string;
};

/** Returns the most useful error message available from Axios/API failures. */
export function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
