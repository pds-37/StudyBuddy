import { motion as Motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { useCopilotStore } from "../../store/copilot-store";

export function FloatingVedaPill() {
  const setIsWidgetOpen = useCopilotStore((state) => state.setIsWidgetOpen);

  return (
    <Motion.div 
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[45]"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <button 
        onClick={() => setIsWidgetOpen(true)}
        className="flex items-center gap-4 px-8 py-4 rounded-full bg-slate-900/80 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl group hover:border-brand/30 transition-all"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-cyan flex items-center justify-center shadow-[0_0_20px_rgba(124,92,255,0.3)]">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="text-left">
          <p className="text-[10px] font-bold text-brand uppercase tracking-widest leading-none mb-1">Veda Assistant</p>
          <p className="text-sm font-bold text-white leading-none">What should I do right now?</p>
        </div>
        <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-brand group-hover:translate-x-1 transition-all" />
      </button>
    </Motion.div>
  );
}
