import { type FormEvent, useState } from "react";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { authApi } from "../features/auth/api";
import { type AuthMode } from "../features/auth/types";
import { useAppStore } from "../store/app-store";

/** Converts API and network errors into readable auth form messages. */
function getAuthErrorMessage(error: unknown) {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "Unable to reach the auth server.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Authentication failed.";
}

/** Shows the signup and login screen for JWT authentication. */
export function AuthPage() {
  const navigate = useNavigate();
  const setSession = useAppStore((state) => state.setSession);
  const [mode, setMode] = useState<AuthMode>("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);

  /** Submits the current auth form mode to the API. */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const result =
        mode === "signup"
          ? await authApi.signup({ name, email, password })
          : await authApi.login({ email, password });

      setSession(result.accessToken, result.refreshToken, result.user);
      navigate(result.user.onboardingCompleted ? "/dashboard" : "/onboarding", { replace: true });
    } catch (requestError) {
      setError(getAuthErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto grid min-h-[calc(100vh-88px)] max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-[1fr_440px]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.42em] text-cyan">Career Copilot</p>
        <h1 className="mt-6 max-w-2xl text-5xl font-semibold tracking-tight text-white md:text-6xl">
          Build your career plan with focus.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-8 text-slate-400">
          Create one secure profile for your skills, roadmap, career notes, and AI guidance.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-glow">
        <div className="grid grid-cols-2 rounded-2xl bg-black/30 p-1">
          <button
            className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
              mode === "signup" ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"
            }`}
            type="button"
            onClick={() => setMode("signup")}
          >
            Create account
          </button>
          <button
            className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
              mode === "login" ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"
            }`}
            type="button"
            onClick={() => setMode("login")}
          >
            Sign in
          </button>
        </div>

        <div className="mt-8 space-y-5">
          {mode === "signup" ? (
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-sm text-white outline-none transition focus:border-brand"
                placeholder="Aman Sharma"
                required
              />
            </label>
          ) : null}

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-sm text-white outline-none transition focus:border-brand"
              placeholder="you@college.edu"
              required
              type="email"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Password</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-sm text-white outline-none transition focus:border-brand"
              placeholder="Minimum 8 characters"
              required
              minLength={8}
              type="password"
            />
          </label>
        </div>

        {error ? <p className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}

        <button
          disabled={isSubmitting}
          className="mt-7 w-full rounded-2xl bg-gradient-to-r from-brand to-blue-500 px-5 py-4 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
        >
          {isSubmitting ? "Please wait..." : mode === "signup" ? "Create StudyBuddy account" : "Sign in"}
        </button>
      </form>
    </section>
  );
}
