declare global {
  namespace Express {
    interface Request {
      userId?: string;
      authToken?: string;
    }
  }
}

export {};
