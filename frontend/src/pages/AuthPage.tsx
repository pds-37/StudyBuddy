import { type FormEvent, useState } from "react";
import { isAxiosError } from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useGoogleLogin, GoogleLogin } from "@react-oauth/google";
import { authApi } from "../features/auth/api";
import { type AuthMode } from "../features/auth/types";
import { useAppStore } from "../store/app-store";
import { Shield, Lock, Mail, User as UserIcon, Sparkles } from "lucide-react";
import { cn } from "../lib/utils/cn";
import { NebulaBackground } from "../components/common/NebulaBackground";

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

  const handleGoogleAuth = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return;
    
    setError("");
    setSubmitting(true);
    try {
      const result = await authApi.googleLogin(credentialResponse.credential);
      setSession(result.accessToken, result.refreshToken, result.user);
      navigate(result.user.onboardingCompleted ? "/dashboard" : "/onboarding", { replace: true });
    } catch (requestError) {
      setError(getAuthErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center p-6 overflow-hidden">
      <NebulaBackground showGrid={true} opacity={0.6} />

      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-16 items-center">
        {/* Left Side: Copy */}
        <div className="hidden lg:block space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-bold uppercase tracking-widest">
            <Shield size={14} />
            Secure Career OS
          </div>
          <h1 className="text-6xl font-black tracking-tight text-white leading-[1.1]">
            Build your <span className="text-gradient">future</span> <br /> with confidence.
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed max-w-md">
            Join 10,000+ professionals using AI to navigate their career paths with precision.
          </p>
          <div className="space-y-4">
            {[
              "Personalized Learning Roadmaps",
              "AI-Powered Mock Interviews",
              "Direct Industry Mentorship"
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-slate-300">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Sparkles size={12} />
                </div>
                <span className="text-sm font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="animate-slide-up">
          <form onSubmit={handleSubmit} className="glass p-8 md:p-10 rounded-[2.5rem] border-white/10 relative">
            <div className="flex flex-col items-center mb-10">
               <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand to-cyan flex items-center justify-center text-white mb-6 shadow-lg">
                  <Lock size={24} />
               </div>
               <h2 className="text-2xl font-bold text-white mb-2">{mode === "signup" ? "Create Account" : "Welcome Back"}</h2>
               <p className="text-sm text-slate-500">Enter your details to access your workspace.</p>
            </div>

            <div className="flex p-1 rounded-2xl bg-white/[0.03] border border-white/5 mb-8">
               <button
                 type="button"
                 onClick={() => setMode("signup")}
                 className={cn(
                   "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all",
                   mode === "signup" ? "bg-white text-obsidian shadow-lg" : "text-slate-500 hover:text-white"
                 )}
               >
                 Signup
               </button>
               <button
                 type="button"
                 onClick={() => setMode("login")}
                 className={cn(
                   "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all",
                   mode === "login" ? "bg-white text-obsidian shadow-lg" : "text-slate-500 hover:text-white"
                 )}
               >
                 Login
               </button>
            </div>

            <div className="space-y-4 mb-8">
              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleAuth}
                  onError={() => setError("Google login failed.")}
                  theme="filled_black"
                  shape="pill"
                  width="100%"
                  text="continue_with"
                />
              </div>
              
              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-white/10"></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Or with Email</span>
                <div className="flex-1 h-px bg-white/10"></div>
              </div>
            </div>

            <div className="space-y-6">
              {mode === "signup" && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/[0.03] border border-white/10 text-white text-sm outline-none focus:border-brand transition-colors"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/[0.03] border border-white/10 text-white text-sm outline-none focus:border-brand transition-colors"
                    placeholder="john@example.com"
                    required
                    type="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/[0.03] border border-white/10 text-white text-sm outline-none focus:border-brand transition-colors"
                    placeholder="••••••••"
                    required
                    minLength={8}
                    type="password"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium animate-shake">
                {error}
              </div>
            )}

            <button
              disabled={isSubmitting}
              className="mt-10 w-full py-4 rounded-2xl bg-brand text-white font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(124,92,255,0.4)]"
              type="submit"
            >
              {isSubmitting ? "Authenticating..." : mode === "signup" ? "Get Started" : "Enter Workspace"}
            </button>

            <p className="mt-8 text-center text-xs text-slate-500">
              By continuing, you agree to our <Link to="#" className="text-white hover:underline">Terms of Service</Link> and <Link to="#" className="text-white hover:underline">Privacy Policy</Link>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
