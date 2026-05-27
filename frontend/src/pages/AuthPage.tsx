import { type FormEvent, useState, useEffect } from "react";
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
  User as UserIcon,
  Zap,
  Sparkles,
  Command,
  Layout,
  Code
} from "lucide-react";
import { authApi } from "../features/auth/api";
import { type AuthMode } from "../features/auth/types";
import { useAppStore } from "../store/app-store";
import { motion as Motion, AnimatePresence, type Variants } from "framer-motion";

import { NebulaBackground } from "../components/common/NebulaBackground";

const LOADING_MESSAGES = [
  "Waking up the server...",
  "Establishing secure connection...",
  "Encrypting credentials...",
  "Almost there...",
  "Verifying session..."
];

function LoadingMessages() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence mode="wait">
      <Motion.div
        key={messageIndex}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-2"
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>{LOADING_MESSAGES[messageIndex]}</span>
      </Motion.div>
    </AnimatePresence>
  );
}

function AbstractOSMockup() {
  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 w-[450px] h-[500px] pointer-events-none hidden xl:block z-0">
      <Motion.div 
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 left-10 w-72 h-48 bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col"
      >
        <div className="flex gap-2 mb-6">
          <div className="w-3 h-3 rounded-full bg-red-500/50" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
          <div className="w-3 h-3 rounded-full bg-green-500/50" />
        </div>
        <div className="space-y-4 flex-1">
          <div className="h-2 w-3/4 bg-white/10 rounded-full" />
          <div className="h-2 w-1/2 bg-white/10 rounded-full" />
          <div className="h-2 w-5/6 bg-white/10 rounded-full" />
        </div>
        <div className="mt-auto flex justify-between items-center">
          <div className="w-8 h-8 rounded-full bg-white/5" />
          <div className="h-6 w-20 bg-brand/20 rounded-md" />
        </div>
      </Motion.div>

      <Motion.div 
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-10 right-10 w-56 h-56 bg-brand/10 backdrop-blur-xl border border-brand/20 rounded-3xl p-6 shadow-2xl flex flex-col justify-between"
      >
        <div className="w-12 h-12 rounded-xl bg-brand/20 flex items-center justify-center border border-brand/30 shadow-[0_0_15px_rgba(124,92,191,0.2)]">
          <Sparkles className="w-6 h-6 text-brand" />
        </div>
        <div className="space-y-3">
          <div className="h-2 w-full bg-brand/20 rounded-full" />
          <div className="h-2 w-2/3 bg-brand/20 rounded-full" />
        </div>
      </Motion.div>

      <Motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full"
      />
    </div>
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

  // Desktop native style animations
  const containerVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 20,
        staggerChildren: 0.05 
      }
    },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#030303] text-slate-100 overflow-hidden font-sans">
      
      {/* Left Pane - Desktop App Branding / Value Prop */}
      <div className="hidden lg:flex flex-1 relative bg-[#080808] border-r border-white/5 flex-col justify-between p-14 overflow-hidden">
        {/* Subtle grid and Nebula for premium feel */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDQwIEwgNDAgNDAgNDAgMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)] z-0 pointer-events-none opacity-50" />
        <NebulaBackground opacity={0.12} />

        {/* Top left branding */}
        <div className="relative z-10 flex items-center gap-2.5">
          <img src="/brand/studybuddy-favicon-512.png" alt="StudyBuddy Icon" className="h-8 w-8 object-contain rounded-xl border border-white/10 shadow-[0_0_15px_rgba(99,102,241,0.2)]" />
          <span className="font-extrabold text-xl tracking-tight text-white font-display">StudyBuddy</span>
        </div>

        {/* Floating Abstract OS Mockup Animation */}
        <AbstractOSMockup />

        {/* Center messaging */}
        <div className="relative z-10 -mt-20">
          <Motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300 mb-6">
              <Command className="w-3.5 h-3.5 text-brand" />
              Desktop App Experience
            </div>
            <h2 className="text-[2.75rem] font-black text-white tracking-tight leading-[1.1] mb-6 font-display">
              Lock in. Level up.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-purple-400 to-cyan-400">
                Secure the SDE bag.
              </span>
            </h2>
            <p className="text-slate-400 text-lg max-w-[400px] leading-relaxed mb-8">
              Execute your placement roadmap flawlessly. A unified, native-feeling workspace for your coding, notes, and technical interviews.
            </p>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <Layout className="w-4 h-4 text-slate-400" />
                </div>
                Distraction-free focus modes
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <Code className="w-4 h-4 text-slate-400" />
                </div>
                Integrated coding environments
              </div>
            </div>
          </Motion.div>
        </div>

        {/* Bottom left stats */}
        <div className="relative z-10">
          <blockquote className="text-sm text-slate-500 max-w-[400px] border-l-2 border-brand/30 pl-4 italic">
            "StudyBuddy completely replaced my messy spreadsheets and random notion pages. It feels like a high-end native app built just for my placements."
          </blockquote>
          <div className="mt-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-cyan-600 p-[1px]">
              <div className="w-full h-full bg-[#0A0A0A] rounded-full flex items-center justify-center text-[10px] font-bold">MR</div>
            </div>
            <div className="text-xs text-slate-400">
              <span className="text-slate-200 font-medium block">Mr. Pds</span>
              SDE at Tech
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane - Native Auth Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-12 bg-[#030303] relative z-10">
        
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2.5">
          <img src="/brand/studybuddy-favicon-512.png" alt="StudyBuddy Icon" className="h-8 w-8 object-contain rounded-xl border border-white/10 shadow-[0_0_15px_rgba(99,102,241,0.2)]" />
          <span className="font-extrabold text-xl tracking-tight text-white font-display">StudyBuddy</span>
        </div>

        <Motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[380px]"
        >
          <Motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-2xl font-black tracking-tight text-white mb-2 font-display">
              {isSignup ? "Start your lock-in era" : "Time to lock in"}
            </h1>
            <p className="text-sm text-slate-400">
              {isSignup
                ? "Configure your workspace parameters to level up."
                : "Synchronize your placement algorithms, no cap."}
            </p>
          </Motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {isSignup && (
                <Motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: "auto", scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1.5"
                >
                  <label className="text-xs font-medium text-slate-400 pl-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-all text-white placeholder-slate-600"
                      required={isSignup}
                    />
                  </div>
                </Motion.div>
              )}
            </AnimatePresence>

            <Motion.div variants={itemVariants} className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 pl-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-all text-white placeholder-slate-600"
                  required
                />
              </div>
            </Motion.div>

            <Motion.div variants={itemVariants} className="space-y-1.5">
              <div className="flex justify-between items-center pl-1 pr-1">
                <label className="text-xs font-medium text-slate-400">Password</label>
                {!isSignup && (
                  <a href="#" className="text-[11px] text-brand hover:text-brand-light transition-colors">
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-all text-white placeholder-slate-600"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Motion.div>

            <AnimatePresence>
              {error && (
                <Motion.div 
                  initial={{ opacity: 0, y: -5, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -5, height: 0 }}
                  className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 text-center"
                >
                  {error}
                </Motion.div>
              )}
            </AnimatePresence>

            <Motion.div variants={itemVariants} className="pt-2">
              <Motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full bg-white text-black py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <LoadingMessages />
                ) : (
                  isSignup ? "Create Account" : "Sign In"
                )}
              </Motion.button>
            </Motion.div>
          </form>

          <Motion.div variants={itemVariants} className="relative my-6 text-center flex items-center">
            <div className="flex-1 border-t border-white/10"></div>
            <span className="px-3 text-[10px] font-medium text-slate-500 uppercase tracking-widest">or continue with</span>
            <div className="flex-1 border-t border-white/10"></div>
          </Motion.div>

          <Motion.div variants={itemVariants}>
            <Motion.button
              type="button"
              onClick={() => googleLogin()}
              disabled={isSubmitting}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full bg-[#0A0A0A] border border-white/10 text-slate-200 py-2.5 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </Motion.button>
          </Motion.div>

          <Motion.div variants={itemVariants} className="mt-8 text-center text-[13px] text-slate-500">
            {isSignup ? "Already have an account?" : "Don't have an account?"}
            <button
              onClick={() => setMode(isSignup ? "login" : "signup")}
              className="ml-1.5 text-slate-200 hover:text-white transition-colors underline underline-offset-4"
            >
              {isSignup ? "Sign In" : "Sign Up"}
            </button>
          </Motion.div>

          {/* Try Demo link under the form like a real native app testing link */}
          <Motion.div variants={itemVariants} className="mt-8 text-center">
            <Link to="/demo" className="inline-flex items-center text-[11px] font-medium text-brand/70 hover:text-brand transition-colors bg-brand/5 px-3 py-1 rounded-full border border-brand/10">
              <Sparkles size={10} className="mr-1.5" />
              Try recruiter demo
              <ArrowRight size={10} className="ml-1.5" />
            </Link>
          </Motion.div>

        </Motion.div>
      </div>
    </div>
  );
}
