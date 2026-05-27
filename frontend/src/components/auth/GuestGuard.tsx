import { Lock } from "lucide-react";
import { useAppStore } from "../../store/app-store";
import { Link } from "react-router-dom";

type GuestGuardProps = {
  children: React.ReactNode;
  fallbackText?: string;
  className?: string;
};

export function GuestGuard({ 
  children, 
  fallbackText = "Please login to get full function of the app. Let's learn and grow together.",
  className = ""
}: GuestGuardProps) {
  const isDemoMode = useAppStore((state) => state.isDemoMode);

  if (isDemoMode) {
    return (
      <div className={`relative flex flex-col items-center justify-center p-6 border border-white/10 rounded-xl bg-surface/50 backdrop-blur-sm text-center ${className}`}>
        <div className="w-12 h-12 rounded-full bg-brand/20 text-brand flex items-center justify-center mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Feature Restricted</h3>
        <p className="text-sm text-slate-400 mb-6 max-w-sm">
          {fallbackText}
        </p>
        <Link 
          to="/auth"
          className="px-6 py-2 bg-brand hover:bg-brand-600 text-white font-medium rounded-lg transition-colors"
        >
          Login or Sign Up
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
