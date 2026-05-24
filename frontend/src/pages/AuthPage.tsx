import { type FormEvent, useState } from "react";
import { isAxiosError } from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import {
  ArrowRight,
  CreditCard,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Quote,
  ShieldCheck,
  Sparkles,
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

const marqueeItems = [
  "Roadmap",
  "Recall",
  "Projects",
  "Resume",
  "Interview",
  "Jobs",
  "Skill gaps",
  "Veda",
  "Notes",
  "Mentors"
];

export function AuthPage() {
  const navigate = useNavigate();
  const setSession = useAppStore((state) => state.setSession);
  const [mode, setMode] = useState<AuthMode>("login");
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
      <aside className="auth-left" aria-label="StudyBuddy value proposition">
        <div className="auth-brand">
          <img src="/brand/studybuddy-logo.png" alt="StudyBuddy" className="auth-brand-logo" />
          <span className="auth-brand-name">StudyBuddy</span>
          <span className="auth-brand-badge">PRO</span>
        </div>

        <div className="auth-hero-copy">
          <p className="auth-hero-kicker">
            <span className="auth-kicker-dash" />
            STUDENT CAREER OS
          </p>
          <h1 className="auth-hero-title">
            One daily plan<br />
            for your <em>placement</em><br />
            prep.
          </h1>
          <p className="auth-hero-subtitle">
            Veda connects roadmap, recall, projects, resume, interview prep, and jobs so the next useful action is always clear.
          </p>
        </div>

        <div className="auth-marquee-wrap" aria-hidden="true">
          <div className="auth-marquee-track">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={`${item}-${i}`} className="auth-marquee-item">
                <span className="auth-marquee-dot" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="auth-stats-row">
          <div className="auth-stat-card">
            <strong>7<span className="auth-stat-highlight">d</span></strong>
            <span>Placement sprint</span>
          </div>
          <div className="auth-stat-card">
            <strong>6<span className="auth-stat-highlight">+</span></strong>
            <span>Prep signals</span>
          </div>
          <div className="auth-stat-card">
            <strong>1<span className="auth-stat-highlight">st</span></strong>
            <span>Daily action</span>
          </div>
        </div>

        <blockquote className="auth-testimonial">
          <Quote size={18} className="auth-quote-icon" />
          <p>
            "The demo profile shows the real product loop: Veda explains why today's task matters using memory, roadmap, project, and resume signals."
          </p>
          <footer>
            <span className="auth-testimonial-avatar">S</span>
            <div>
              <strong>StudyBuddy demo</strong>
              <span>Unified student intelligence loop</span>
            </div>
          </footer>
        </blockquote>
      </aside>

      <section className="auth-right" aria-label="StudyBuddy authentication">
        <div className="auth-form-container">
          <div className="auth-form-head">
            <h2 className="auth-welcome">{isSignup ? "Get started." : "Welcome back."}</h2>
            <p className="auth-welcome-sub">
              {isSignup ? "Create your account to begin your placement journey." : "Sign in to continue your placement journey."}
            </p>
            <Link to="/demo" className="mt-4 inline-flex text-sm font-bold text-[#ca8af7] hover:text-white">
              Try the recruiter demo first
              <ArrowRight size={15} className="ml-1" />
            </Link>
          </div>

          <div className="auth-tabs" aria-label="Authentication mode">
            <button
              type="button"
              className={cn("auth-tab", mode === "login" && "active")}
              onClick={() => setMode("login")}
              aria-pressed={mode === "login"}
            >
              Sign in
            </button>
            <button
              type="button"
              className={cn("auth-tab", mode === "signup" && "active")}
              onClick={() => setMode("signup")}
              aria-pressed={mode === "signup"}
            >
              Create account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {isSignup && (
              <div className="auth-input-group">
                <label>Full Name</label>
                <div className="auth-input-wrap">
                  <UserIcon size={17} />
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="auth-input"
                    placeholder="Your name"
                    required
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div className="auth-input-group">
              <label>Email address</label>
              <div className="auth-input-wrap">
                <Mail size={17} />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="auth-input"
                  placeholder="you@college.edu"
                  required
                  type="email"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label>Password</label>
              <div className="auth-input-wrap">
                <Lock size={17} />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
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
              {!isSignup && (
                <a href="#" className="auth-forgot-link">Forgot password?</a>
              )}
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
                  Securing session...
                </>
              ) : (
                <>
                  {isSignup ? "Create Account" : "Sign in to StudyBuddy"}
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          <div className="auth-social-row">
            <button
              className="auth-social-btn"
              onClick={() => googleLogin()}
              disabled={isSubmitting}
              type="button"
            >
              <span className="google-mark" aria-hidden="true">G</span>
              Google
            </button>
          </div>

          <p className="auth-switch-mode">
            {isSignup ? "Already have an account? " : "Don't have an account? "}
            <button
              type="button"
              className="auth-switch-btn"
              onClick={() => setMode(isSignup ? "login" : "signup")}
            >
              {isSignup ? "Sign in" : "Start free"}
            </button>
          </p>

          <div className="auth-trust-row">
            <span><ShieldCheck size={14} /> SSL encrypted</span>
            <span><CreditCard size={14} /> No card needed</span>
            <span><Sparkles size={14} /> Free plan</span>
          </div>
        </div>
      </section>
    </div>
  );
}
