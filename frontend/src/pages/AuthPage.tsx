import { type FormEvent, useState } from "react";
import { isAxiosError } from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Quote,
  ShieldCheck,
  User as UserIcon,
  Zap,
  Sparkles
} from "lucide-react";
import { authApi } from "../features/auth/api";
import { type AuthMode } from "../features/auth/types";
import { useAppStore } from "../store/app-store";
import { cn } from "../lib/utils/cn";
import { motion as Motion, AnimatePresence } from "framer-motion";

function getAuthErrorMessage(error: unknown) {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "Unable to reach the auth server.";
  }
  return error instanceof Error ? error.message : "Authentication failed.";
}

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
    <div className="flex min-h-screen bg-background text-text-primary">
      {/* LEFT SIDE - Value Proposition */}
      <aside className="hidden lg:flex w-[45%] flex-col justify-between p-12 bg-background-secondary border-r border-border relative overflow-hidden z-10">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-brand/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan/5 blur-[100px] rounded-full" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15 border border-brand/20">
            <Zap size={20} className="text-brand" />
          </div>
          <span className="text-xl font-bold tracking-tight">StudyBuddy</span>
          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-text-muted tracking-widest uppercase ml-2">PRO</span>
        </div>

        <div className="relative z-10 max-w-md mt-16">
          <div className="inline-flex items-center gap-2 mb-6 text-brand">
            <Sparkles size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Student Career OS</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold leading-[1.15] mb-6">
            One daily plan<br />
            for your <span className="text-brand-light font-medium italic">placement</span><br />
            prep.
          </h1>
          <p className="text-lg text-text-secondary leading-relaxed">
            Veda connects roadmap, recall, projects, resume, interview prep, and jobs so the next useful action is always clear.
          </p>
        </div>

        <div className="relative z-10 mt-auto pt-16">
          <blockquote className="p-6 rounded-2xl bg-surface border border-border backdrop-blur-xl">
            <Quote size={20} className="text-brand mb-4 opacity-50" />
            <p className="text-sm text-text-secondary leading-relaxed italic mb-6">
              "The demo profile shows the real product loop: Veda explains why today's task matters using memory, roadmap, project, and resume signals."
            </p>
            <footer className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center text-brand font-bold border border-brand/30">
                S
              </div>
              <div>
                <strong className="block text-sm font-semibold text-text-primary">StudyBuddy demo</strong>
                <span className="text-xs text-text-muted">Unified student intelligence loop</span>
              </div>
            </footer>
          </blockquote>
        </div>
      </aside>

      {/* RIGHT SIDE - Authentication Form */}
      <section className="flex-1 flex flex-col justify-center items-center p-6 relative overflow-hidden bg-ai-workspace">
        <div className="w-full max-w-[420px] relative z-10 animate-fade-in">
          {/* Mobile Header */}
          <div className="flex lg:hidden items-center gap-2 mb-12 justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/15 border border-brand/20">
              <Zap size={16} className="text-brand" />
            </div>
            <span className="text-lg font-bold tracking-tight">StudyBuddy</span>
          </div>

          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold mb-3">{isSignup ? "Create your workspace" : "Welcome back"}</h2>
            <p className="text-text-secondary">
              {isSignup ? "Begin your placement journey." : "Sign in to continue your placement journey."}
            </p>
            <Link to="/demo" className="mt-4 inline-flex items-center text-sm font-medium text-brand hover:text-brand-light transition-colors">
              Try the recruiter demo first
              <ArrowRight size={14} className="ml-1.5" />
            </Link>
          </div>

          <div className="flex p-1 mb-8 rounded-xl bg-background-secondary border border-border">
            <button
              type="button"
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                !isSignup ? "bg-surface shadow-[0_2px_10px_rgba(0,0,0,0.2)] text-text-primary border border-white/5" : "text-text-muted hover:text-text-secondary"
              )}
              onClick={() => setMode("login")}
            >
              Sign in
            </button>
            <button
              type="button"
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                isSignup ? "bg-surface shadow-[0_2px_10px_rgba(0,0,0,0.2)] text-text-primary border border-white/5" : "text-text-muted hover:text-text-secondary"
              )}
              onClick={() => setMode("signup")}
            >
              Create account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="popLayout">
              {isSignup && (
                <Motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1.5"
                >
                  <label className="text-sm font-medium text-text-secondary ml-1">Full Name</label>
                  <div className="relative">
                    <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="w-full bg-background-secondary border border-border rounded-xl py-3 pl-11 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/50 transition-all"
                      placeholder="Your name"
                      required
                      autoComplete="name"
                    />
                  </div>
                </Motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary ml-1">Email address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full bg-background-secondary border border-border rounded-xl py-3 pl-11 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/50 transition-all"
                  placeholder="you@college.edu"
                  required
                  type="email"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-medium text-text-secondary">Password</label>
                {!isSignup && (
                  <a href="#" className="text-xs text-brand hover:text-brand-light transition-colors">Forgot password?</a>
                )}
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full bg-background-secondary border border-border rounded-xl py-3 pl-11 pr-12 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/50 transition-all"
                  placeholder="Enter your password"
                  required
                  minLength={8}
                  type={showPassword ? "text" : "password"}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <Motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 text-center" 
                  role="alert"
                >
                  {error}
                </Motion.div>
              )}
            </AnimatePresence>

            <button 
              disabled={isSubmitting} 
              className="w-full py-3.5 rounded-xl bg-brand text-white font-medium hover:bg-brand-light focus:outline-none focus:ring-2 focus:ring-brand/50 focus:ring-offset-2 focus:ring-offset-background transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4" 
              type="submit"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Securing session...
                </>
              ) : (
                <>
                  {isSignup ? "Create Workspace" : "Sign in to StudyBuddy"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="relative my-8 text-center flex items-center">
            <div className="flex-1 border-t border-border"></div>
            <span className="px-4 text-xs font-medium text-text-muted uppercase tracking-wider">or continue with</span>
            <div className="flex-1 border-t border-border"></div>
          </div>

          <button
            className="w-full py-3 rounded-xl bg-background-secondary border border-border text-text-primary font-medium hover:bg-white/5 transition-colors flex justify-center items-center gap-3"
            onClick={() => googleLogin()}
            disabled={isSubmitting}
            type="button"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          
          <div className="mt-12 flex items-center justify-center gap-6 text-xs text-text-muted font-medium">
            <span className="flex items-center gap-1.5"><ShieldCheck size={14} /> SSL encrypted</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="flex items-center gap-1.5"><Sparkles size={14} /> Free tier</span>
          </div>
        </div>
      </section>
    </div>
  );
}
