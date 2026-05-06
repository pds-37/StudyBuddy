import { type RequestHandler } from "express";
import { authService } from "./auth.service.js";
import { loginBodySchema, refreshBodySchema, signupBodySchema } from "./auth.validation.js";

/** Handles user registration. */
const signup: RequestHandler = async (request, response, next) => {
  try {
    const body = signupBodySchema.parse(request.body);
    const result = await authService.signup(body);
    response.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

/** Handles user login. */
const login: RequestHandler = async (request, response, next) => {
  try {
    const body = loginBodySchema.parse(request.body);
    const result = await authService.login(body);
    response.json(result);
  } catch (error) {
    next(error);
  }
};

/** Returns the current authenticated user. */
const me: RequestHandler = async (request, response, next) => {
  try {
    const user = await authService.getMe(request.userId ?? "");
    response.json({ user });
  } catch (error) {
    next(error);
  }
};

/** Issues a fresh access and refresh token pair. */
const refresh: RequestHandler = async (request, response, next) => {
  try {
    const body = refreshBodySchema.parse(request.body);
    const token = body.refreshToken;

    if (!token) {
      response.status(400).json({ message: "Refresh token is required." });
      return;
    }

    const result = await authService.refresh(token);
    response.json(result);
  } catch (error) {
    next(error);
  }
};

/** Allows clients to clear local auth state using a consistent endpoint. */
const logout: RequestHandler = (_request, response) => {
  response.json({ message: "Logged out." });
};

/** Handles Google authentication. */
const googleLogin: RequestHandler = async (request, response, next) => {
  try {
    const { idToken } = request.body;
    if (!idToken) {
      response.status(400).json({ message: "Google ID token is required." });
      return;
    }
    const result = await authService.googleLogin(idToken);
    response.json(result);
  } catch (error) {
    next(error);
  }
};

export const authController = {
  signup,
  login,
  me,
  refresh,
  logout,
  googleLogin
};
