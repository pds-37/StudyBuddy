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
            "flex items-center gap-3 rounded-full border border-white/[0.08] bg-[#10141c] shadow-2xl shadow-black/30 transition-all duration-300 ease-in-out hover:border-white/20",
            isReduced ? "h-12 w-12 justify-center p-2" : "px-4 py-3"
          )}
        >
          <div className={cn(
            "flex items-center justify-center rounded-full bg-brand text-white transition-all duration-300",
            isReduced ? "h-8 w-8" : "h-9 w-9"
          )}>
            {isReduced ? <MessageSquare className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
          </div>

          {!isReduced && (
            <Motion.div 
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              className="flex items-center gap-3 overflow-hidden text-left"
            >
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase leading-none tracking-widest text-brand">Veda</p>
                <p className="whitespace-nowrap text-sm font-semibold leading-none text-white">Need help?</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500 transition-all group-hover:translate-x-1 group-hover:text-white" />
            </Motion.div>
          )}
        </button>

        {!isReduced && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsReduced(true);
            }}
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.08] bg-[#10141c] text-slate-500 opacity-0 shadow-lg transition-all hover:bg-white/[0.06] hover:text-white group-hover:opacity-100"
            aria-label="Minimize Veda"
          >
            <X size={12} />
          </button>
        )}
      </div>
    </Motion.div>
  );
}
