import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2, Sparkles } from "lucide-react";
import { useAppStore } from "../store/app-store";

export function DemoPage() {
  const startDemoSession = useAppStore((state) => state.startDemoSession);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    startDemoSession();
    setReady(true);
  }, [startDemoSession]);

  if (ready) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#05070a] px-6 text-center text-white">
      <Sparkles className="mb-4 h-10 w-10 text-[#ca8af7]" />
      <h1 className="text-3xl font-black tracking-tight">Preparing your demo workspace</h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
        Loading a placement-ready student profile with roadmap, recall, project, resume, and Veda signals.
      </p>
      <Loader2 className="mt-8 h-6 w-6 animate-spin text-[#28b0f3]" />
    </div>
  );
}
