import type { AuthSessionUser } from "./auth";

declare global {
  namespace Express {
    interface Request {
      user?: AuthSessionUser;
    }
  }
}

export {};
