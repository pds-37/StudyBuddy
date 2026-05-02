import bcrypt from "bcryptjs";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import { env } from "../../config/env.js";
import { ApiError } from "../../utils/api-error.js";
import { UserModel, type UserDocument } from "../users/user.model.js";
import { type LoginBody, type SignupBody } from "./auth.validation.js";

type TokenPayload = {
  userId: string;
};

type AuthResult = {
  user: {
    id: string;
    name: string;
    email: string;
  };
  accessToken: string;
  refreshToken: string;
};

const SALT_ROUNDS = 12;

/** Converts a Mongo user document into the safe auth user shape. */
function toAuthUser(user: UserDocument) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    targetRoles: user.targetRoles,
    currentSkills: user.currentSkills,
    experienceLevel: user.experienceLevel,
    onboardingCompleted: user.onboardingCompleted
  };
}

/** Signs a JWT for the provided user id and secret. */
function signToken(userId: string, secret: string, expiresIn: SignOptions["expiresIn"]) {
  const options: SignOptions = { expiresIn };
  return jwt.sign({ userId }, secret, options);
}

/** Creates the access and refresh token pair for a user. */
function createTokenPair(userId: string) {
  return {
    accessToken: signToken(userId, env.jwtAccessSecret, env.jwtAccessExpiresIn as SignOptions["expiresIn"]),
    refreshToken: signToken(userId, env.jwtRefreshSecret, env.jwtRefreshExpiresIn as SignOptions["expiresIn"])
  };
}

/** Creates a new user account and returns auth tokens. */
async function signup(payload: SignupBody): Promise<AuthResult> {
  const normalizedEmail = payload.email.toLowerCase();
  const existingUser = await UserModel.findOne({ email: normalizedEmail }).lean();

  if (existingUser) {
    throw new ApiError(409, "An account already exists for this email.");
  }

  const passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS);
  const user = await UserModel.create({
    email: normalizedEmail,
    passwordHash,
    name: payload.name
  });
  const tokens = createTokenPair(String(user._id));

  return {
    user: toAuthUser(user),
    ...tokens
  };
}

/** Validates email and password credentials and returns auth tokens. */
async function login(payload: LoginBody): Promise<AuthResult> {
  const normalizedEmail = payload.email.toLowerCase();
  const user = await UserModel.findOne({ email: normalizedEmail }).select("+passwordHash");

  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const tokens = createTokenPair(String(user._id));

  return {
    user: toAuthUser(user),
    ...tokens
  };
}

/** Loads the authenticated user from the database. */
async function getMe(userId: string) {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return toAuthUser(user);
}

/** Verifies an access token and returns its typed payload. */
function verifyAccessToken(token: string): TokenPayload {
  const payload = jwt.verify(token, env.jwtAccessSecret) as JwtPayload & TokenPayload;

  if (!payload.userId) {
    throw new ApiError(401, "Invalid authentication token.");
  }

  return { userId: payload.userId };
}

/** Verifies a refresh token and returns a new token pair. */
async function refresh(refreshToken: string): Promise<AuthResult> {
  const payload = jwt.verify(refreshToken, env.jwtRefreshSecret) as JwtPayload & TokenPayload;

  if (!payload.userId) {
    throw new ApiError(401, "Invalid refresh token.");
  }

  const user = await UserModel.findById(payload.userId);

  if (!user) {
    throw new ApiError(401, "Refresh token user no longer exists.");
  }

  const tokens = createTokenPair(String(user._id));

  return {
    user: toAuthUser(user),
    ...tokens
  };
}

export const authService = {
  signup,
  login,
  getMe,
  refresh,
  verifyAccessToken
};
