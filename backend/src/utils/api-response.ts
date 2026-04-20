/** Wraps successful API responses in a consistent envelope. */
export function apiResponse<T>(data: T, message = "ok") {
  return {
    message,
    data
  };
}
