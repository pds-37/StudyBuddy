import { useQuery } from "@tanstack/react-query";

import { ApiError, apiRequest } from "@/lib/api";
import type { PublicUser } from "@shared";

type SessionResponse = {
  user: PublicUser;
};

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      try {
        return await apiRequest<SessionResponse>("/auth/me");
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          return null;
        }

        throw error;
      }
    }
  });
}
