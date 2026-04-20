import { z } from "zod";

export const signupBodySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.string().trim().email("Use a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.")
});

export const loginBodySchema = z.object({
  email: z.string().trim().email("Use a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.")
});

export const refreshBodySchema = z.object({
  refreshToken: z.string().min(1).optional()
});

export type SignupBody = z.infer<typeof signupBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;
