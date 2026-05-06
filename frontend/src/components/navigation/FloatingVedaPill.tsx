import { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, X, MessageSquare } from "lucide-react";
import { useCopilotStore } from "../../store/copilot-store";
import { cn } from "../../lib/utils/cn";

export function FloatingVedaPill() {
  const setIsWidgetOpen = useCopilotStore((state) => state.setIsWidgetOpen);
  const isWidgetOpen = useCopilotStore((state) => state.isWidgetOpen);
  const [isReduced, setIsReduced] = useState(false);

  // If the actual chat is open, we hide the pill
  if (isWidgetOpen) return null;

  return (
    <Motion.div 
      className="fixed bottom-6 right-6 z-[45] flex items-center gap-2"
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="relative group">
        <button 
          onClick={() => isReduced ? setIsReduced(false) : setIsWidgetOpen(true)}
          className={cn(
            "flex items-center gap-4 rounded-full bg-slate-900/90 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-500 ease-in-out hover:border-brand/40",
            isReduced ? "p-3 w-14 h-14 justify-center" : "px-6 py-4"
          )}
        >
          <div className={cn(
            "rounded-full bg-gradient-to-br from-brand to-cyan flex items-center justify-center shadow-[0_0_20px_rgba(124,92,255,0.3)] transition-all duration-500",
            isReduced ? "w-10 h-10" : "w-10 h-10"
          )}>
            {isReduced ? <MessageSquare className="w-5 h-5 text-white" /> : <Sparkles className="w-5 h-5 text-white" />}
          </div>

          {!isReduced && (
            <Motion.div 
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              className="text-left flex items-center gap-4 overflow-hidden"
            >
              <div>
                <p className="text-[10px] font-bold text-brand uppercase tracking-widest leading-none mb-1">Veda Assistant</p>
                <p className="text-sm font-bold text-white leading-none whitespace-nowrap">What should I do right now?</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-brand group-hover:translate-x-1 transition-all" />
            </Motion.div>
          )}
        </button>

        {!isReduced && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsReduced(true);
            }}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all opacity-0 group-hover:opacity-100 shadow-lg"
          >
            <X size={12} />
          </button>
        )}
      </div>
    </Motion.div>
  );
}
