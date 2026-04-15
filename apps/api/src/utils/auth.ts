import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Response } from "express";

import { env } from "../config/env";
import type { AuthSessionUser } from "../types/auth";

const COOKIE_NAME = "study_buddy_session";

type TokenPayload = AuthSessionUser;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signSessionToken(user: AuthSessionUser) {
  return jwt.sign(user, env.JWT_SECRET, {
    expiresIn: "30d"
  });
}

export function verifySessionToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}

export function setSessionCookie(response: Response, user: AuthSessionUser) {
  response.cookie(COOKIE_NAME, signSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 30
  });
}

export function clearSessionCookie(response: Response) {
  response.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production"
  });
}

export function readSessionCookie(cookieHeader: Record<string, unknown>) {
  const token = cookieHeader[COOKIE_NAME];
  return typeof token === "string" ? token : null;
}
