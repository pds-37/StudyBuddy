import { type FormEvent, useState } from "react";
import { isAxiosError } from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { authApi } from "../features/auth/api";
import { type AuthMode } from "../features/auth/types";
import { useAppStore } from "../store/app-store";
import { Shield, Lock, Mail, User as UserIcon, Sparkles, ArrowRight, Target } from "lucide-react";
import { cn } from "../lib/utils/cn";
import { motion as Motion, AnimatePresence } from "framer-motion";
import "./AuthPage.css";

// Simple Google Icon Component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

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

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError("");
      setSubmitting(true);
      try {
        const res = await authApi.googleLogin(tokenResponse.access_token);
        setSession(res.accessToken, res.refreshToken, res.user);
        navigate(res.user.onboardingCompleted ? "/dashboard" : "/onboarding", { replace: true });
      } catch (err) {
        setError("Google authentication failed.");
      } finally {
        setSubmitting(false);
      }
    },
    onError: () => setError("Google login failed.")
  });

  return (
    <div className="auth-page min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="auth-bg-orb orb-1" />
      <div className="auth-bg-orb orb-2" />
      
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-20 items-center relative z-10">
        <Motion.div 
          className="hidden lg:block space-y-10"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-black uppercase tracking-widest">
            <Shield size={14} />
            Secure Career Infrastructure
          </div>
          <h1 className="text-7xl font-black text-white leading-[1.05] tracking-tight">
            Build your <span className="text-gradient">future</span> <br />
            with confidence.
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed max-w-lg">
            Join the elite circle of developers using Veda AI to navigate their career paths with mathematical precision.
          </p>
          
          <div className="grid gap-6">
            {[
              { icon: Sparkles, text: "Dynamic Learning Roadmaps", color: "emerald" },
              { icon: Target, text: "Role-Specific Readiness Analysis", color: "cyan" },
              { icon: Lock, text: "Zero-Knowledge Data Privacy", color: "indigo" }
            ].map((item, i) => (
              <div 
                key={item.text}
                className="flex items-center gap-4 text-slate-300"
              >
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10">
                  <item.icon size={18} />
                </div>
                <span className="font-bold text-lg">{item.text}</span>
              </div>
            ))}
          </div>
        </Motion.div>

        <Motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="auth-card glass-premium p-10 md:p-12 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand to-cyan" />
            
            <div className="flex flex-col items-center mb-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand to-cyan flex items-center justify-center text-white mb-8 shadow-xl">
                <Lock size={32} />
              </div>
              <h2 className="text-3xl font-black text-white mb-3">
                {mode === "signup" ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="text-slate-500 font-medium max-w-[240px]">
                Enter your details to access your private AI workspace.
              </p>
            </div>

            <div className="flex p-1.5 rounded-2xl bg-white/[0.03] border border-white/5 mb-10">
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={cn(
                  "flex-1 py-3 rounded-xl text-sm font-black transition-all",
                  mode === "signup" ? "bg-white text-obsidian shadow-lg" : "text-slate-500 hover:text-white"
                )}
              >
                Signup
              </button>
              <button
                type="button"
                onClick={() => setMode("login")}
                className={cn(
                  "flex-1 py-3 rounded-xl text-sm font-black transition-all",
                  mode === "login" ? "bg-white text-obsidian shadow-lg" : "text-slate-500 hover:text-white"
                )}
              >
                Login
              </button>
            </div>

            <div className="space-y-6 mb-10">
              <button 
                type="button"
                onClick={() => googleLogin()}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white text-obsidian font-black text-sm hover:bg-slate-100 transition-all active:scale-[0.98] shadow-lg disabled:opacity-50"
              >
                <GoogleIcon className="w-5 h-5" />
                Continue with Google
              </button>
              
              <div className="flex items-center gap-4 px-2">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Or use Email</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                <Motion.div 
                  key={mode}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {mode === "signup" && (
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                      <div className="relative group">
                        <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand transition-colors" size={20} />
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-14 pr-6 py-5 rounded-2xl bg-white/[0.03] border border-white/10 text-white text-sm outline-none focus:border-brand focus:bg-white/[0.05] transition-all"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand transition-colors" size={20} />
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-14 pr-6 py-5 rounded-2xl bg-white/[0.03] border border-white/10 text-white text-sm outline-none focus:border-brand focus:bg-white/[0.05] transition-all"
                        placeholder="john@example.com"
                        required
                        type="email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand transition-colors" size={20} />
                      <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-14 pr-6 py-5 rounded-2xl bg-white/[0.03] border border-white/10 text-white text-sm outline-none focus:border-brand focus:bg-white/[0.05] transition-all"
                        placeholder="••••••••"
                        required
                        minLength={8}
                        type="password"
                      />
                    </div>
                  </div>
                </Motion.div>
              </AnimatePresence>

              {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center">
                  {error}
                </div>
              )}

              <button
                disabled={isSubmitting}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-brand to-indigo-600 text-white font-black text-lg hover:shadow-[0_20px_40px_rgba(124,92,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                type="submit"
              >
                {isSubmitting ? "Processing..." : mode === "signup" ? "Create Account" : "Access Workspace"}
                {!isSubmitting && <ArrowRight size={20} />}
              </button>
            </form>

            <p className="mt-10 text-center text-xs text-slate-500 font-medium">
              By continuing, you agree to our <Link to="#" className="text-white hover:underline">Terms of Service</Link> and <Link to="#" className="text-white hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        </Motion.div>
      </div>
    </div>
  );
}
