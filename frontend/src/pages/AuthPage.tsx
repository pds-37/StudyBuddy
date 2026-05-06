import { type FormEvent, useState } from "react";
import { isAxiosError } from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useGoogleLogin, GoogleLogin } from "@react-oauth/google";
import { authApi } from "../features/auth/api";
import { type AuthMode } from "../features/auth/types";
import { useAppStore } from "../store/app-store";
import { Shield, Lock, Mail, User as UserIcon, Sparkles, Route, Target, Briefcase } from "lucide-react";
import { cn } from "../lib/utils/cn";
import { NebulaBackground } from "../components/common/NebulaBackground";
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
  const [error, setError] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);

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
      const result = mode === "signup"
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
      <div className="auth-page__glow" />
      
      <div className="auth-shell">
        <section className="auth-brand-panel">
          <div className="auth-eyebrow">
            <Sparkles size={14} />
            Career OS
          </div>
          <h1>Build your future with confidence.</h1>
          <p>
            Join 10,000+ professionals using AI to navigate their career paths with precision.
          </p>
          
          <div className="auth-trust-grid">
            {[
              { icon: Route, label: "Personalized Learning Roadmaps" },
              { icon: Target, label: "AI-Powered Mock Interviews" },
              { icon: Briefcase, label: "Direct Industry Mentorship" }
            ].map((item) => (
              <div key={item.label} className="auth-trust-item">
                <div className="auth-trust-icon">
                  <item.icon size={18} />
                </div>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-card-head text-center">
            <img src="/brand/studybuddy-logo.png" alt="StudyBuddy" className="h-20 w-auto mx-auto mb-3 object-contain drop-shadow-[0_0_15px_rgba(202,138,247,0.2)]" />
            <p className="text-slate-500 text-sm mt-2">Enter your details to access your workspace.</p>
          </div>

          <div className="auth-tabs">
            <button 
              className={cn("auth-tab", mode === "signup" && "active")}
              onClick={() => setMode("signup")}
            >
              Sign Up
            </button>
            <button 
              className={cn("auth-tab", mode === "login" && "active")}
              onClick={() => setMode("login")}
            >
              Login
            </button>
          </div>

          <button 
            className="google-btn-custom"
            onClick={() => googleLogin()}
            disabled={isSubmitting}
          >
            <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" width={20} />
            Continue with Google
          </button>

          <div className="auth-divider">
            <span>or email</span>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === "signup" && (
              <div className="auth-input-group">
                <label>Full Name</label>
                <div className="auth-input-wrap">
                  <UserIcon size={18} />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="auth-input"
                    placeholder="John Doe"
                    required
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
                  placeholder="••••••••"
                  required
                  minLength={8}
                  type="password"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                {error}
              </div>
            )}

            <button
              disabled={isSubmitting}
              className="btn-auth-submit"
              type="submit"
            >
              {isSubmitting ? "Wait a moment..." : mode === "signup" ? "Create Account" : "Enter Workspace"}
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

