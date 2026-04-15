import { Router } from "express";
import { z } from "zod";

import { serializeUser, store } from "../data/store";
import { comparePassword, clearSessionCookie, hashPassword, setSessionCookie } from "../utils/auth";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

router.post("/register", async (request, response) => {
  const parsed = registerSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ message: "Please enter a valid name, email, and password." });
    return;
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await store.findUserByEmail(email);
  if (existing) {
    response.status(409).json({ message: "This email is already in use." });
    return;
  }

  const user = await store.createUser({
    email,
    name: parsed.data.name,
    passwordHash: await hashPassword(parsed.data.password)
  });

  const notes = await store.listNotes(user.id);
  const sessionUser = serializeUser(user, notes);
  setSessionCookie(response, sessionUser);
  response.status(201).json({ user: sessionUser });
});

router.post("/login", async (request, response) => {
  const parsed = loginSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ message: "Please enter a valid email and password." });
    return;
  }

  const email = parsed.data.email.toLowerCase();
  const user = await store.findUserByEmail(email);
  if (!user) {
    response.status(401).json({ message: "No account found for this email." });
    return;
  }

  const validPassword = await comparePassword(parsed.data.password, user.passwordHash);
  if (!validPassword) {
    response.status(401).json({ message: "Password is incorrect." });
    return;
  }

  const notes = await store.listNotes(user.id);
  const sessionUser = serializeUser(user, notes);
  setSessionCookie(response, sessionUser);
  response.json({ user: sessionUser });
});

router.get("/me", requireAuth, async (request, response) => {
  const user = await store.findUserById(request.user!.id);
  if (!user) {
    response.status(404).json({ message: "User not found." });
    return;
  }

  const notes = await store.listNotes(user.id);
  response.json({ user: serializeUser(user, notes) });
});

router.post("/logout", (_request, response) => {
  clearSessionCookie(response);
  response.status(204).send();
});

export default router;
