import { type FormEvent, useState } from "react";
import { isAxiosError } from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Sparkles,
  Target,
  User as UserIcon
} from "lucide-react";
import { authApi } from "../features/auth/api";
import { type AuthMode } from "../features/auth/types";
import { useAppStore } from "../store/app-store";
import { cn } from "../lib/utils/cn";
import "./AuthPage.css";

function getAuthErrorMessage(error: unknown) {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "Unable to reach the auth server.";
  }
  return error instanceof Error ? error.message : "Authentication failed.";
}

export function AuthPage() {
  const navigate = useNavigate();
  const setSession = useAppStore((state) => state.setSession);
  const [mode, setMode] = useState<AuthMode>("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);
  const isSignup = mode === "signup";

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError("");
      setSubmitting(true);
      try {
        const result = await authApi.googleLogin(tokenResponse.access_token);
        setSession(result.accessToken, result.refreshToken, result.user);
        navigate(result.user.onboardingCompleted ? "/dashboard" : "/onboarding", { replace: true });
      } catch (requestError) {
        setError(getAuthErrorMessage(requestError));
      } finally {
        setSubmitting(false);
      }
    },
    onError: () => setError("Google login failed.")
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result = isSignup
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
    <div className="auth-page">
      <div className="auth-shell">
        <section className="auth-brand-panel">
          <div className="auth-brand-panel__topline">
            <span className="auth-signal-dot" />
            Veda workspace
          </div>
          <h1>One calm place for your next career move.</h1>
          <p>
            StudyBuddy keeps your roadmap, recall, interviews, and mentor actions aligned in one focused command center.
          </p>

          <div className="auth-command-card" aria-hidden="true">
            <div className="auth-command-card__header">
              <div>
                <span>Today</span>
                <strong>Execution Plan</strong>
              </div>
              <Sparkles size={18} />
            </div>
            <div className="auth-progress-line">
              <span style={{ width: "72%" }} />
            </div>
            <div className="auth-mini-grid">
              {[
                { label: "Focus", value: "3 tasks", icon: Target },
                { label: "Recall", value: "12 due", icon: Brain },
                { label: "Ready", value: "84%", icon: CheckCircle2 }
              ].map((item) => (
                <div key={item.label} className="auth-mini-card">
                  <item.icon size={16} />
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="auth-trust-row">
            {["Private by default", "Adaptive roadmap", "AI mentor"].map((item) => (
              <div key={item} className="auth-trust-pill">
                <CheckCircle2 size={14} />
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-card-head">
            <img src="/brand/studybuddy-logo.png" alt="StudyBuddy" className="auth-logo" />
            <div>
              <p className="auth-card-kicker">{isSignup ? "Start your workspace" : "Welcome back"}</p>
              <h2>{isSignup ? "Create your account" : "Log in to StudyBuddy"}</h2>
            </div>
          </div>

          <div className="auth-tabs" aria-label="Authentication mode">
            <button
              type="button"
              className={cn("auth-tab", mode === "signup" && "active")}
              onClick={() => setMode("signup")}
              aria-pressed={mode === "signup"}
            >
              Sign Up
            </button>
            <button
              type="button"
              className={cn("auth-tab", mode === "login" && "active")}
              onClick={() => setMode("login")}
              aria-pressed={mode === "login"}
            >
              Login
            </button>
          </div>

          <button
            className="google-btn-custom"
            onClick={() => googleLogin()}
            disabled={isSubmitting}
            type="button"
          >
            <span className="google-mark" aria-hidden="true">G</span>
            Continue with Google
          </button>

          <div className="auth-divider">
            <span>or continue with email</span>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {isSignup && (
              <div className="auth-input-group">
                <label>Full Name</label>
                <div className="auth-input-wrap">
                  <UserIcon size={18} />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="auth-input"
                    placeholder="Your name"
                    required
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div className="auth-input-group">
              <label>Email Address</label>
              <div className="auth-input-wrap">
                <Mail size={18} />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                  placeholder="you@example.com"
                  required
                  type="email"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label>Password</label>
              <div className="auth-input-wrap">
                <Lock size={18} />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                  placeholder="Enter your password"
                  required
                  minLength={8}
                  type={showPassword ? "text" : "password"}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-password-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}

            <button disabled={isSubmitting} className="btn-auth-submit" type="submit">
              {isSubmitting ? (
                <>
                  <Loader2 size={17} className="auth-spin" />
                  Securing session
                </>
              ) : (
                <>
                  {isSignup ? "Create Account" : "Enter Workspace"}
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <p className="auth-footer">
            By continuing, you agree to our <Link to="#">Terms</Link> and <Link to="#">Privacy</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
