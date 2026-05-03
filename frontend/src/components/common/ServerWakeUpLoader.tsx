import { motion } from "framer-motion";
import { Loader2, Sparkles, Zap } from "lucide-react";

/** 
 * A premium full-screen loader shown when the Render backend is waking up from sleep.
 * Features nebula-style background and progress signals.
 */
export function ServerWakeUpLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-obsidian overflow-hidden">
      {/* Background Nebula Decor */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-brand/20 blur-[120px]" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan/15 blur-[100px]" 
      />
      <div className="absolute inset-0 bg-grid opacity-10" />

      <div className="relative z-10 flex flex-col items-center max-w-md px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-24 h-24 rounded-[2.5rem] bg-brand/10 border border-brand/20 flex items-center justify-center text-brand mb-10 shadow-glow"
        >
          <Zap size={48} className="animate-pulse" />
        </motion.div>

        <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Waking Up Veda AI</h1>
        <p className="text-slate-400 text-lg leading-relaxed mb-12">
          Your AI mentor is initializing its knowledge engine. This usually takes 30-40 seconds on cold starts.
        </p>

        <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden relative mb-8">
           <motion.div 
             initial={{ x: "-100%" }}
             animate={{ x: "100%" }}
             transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
             className="absolute inset-0 bg-gradient-to-r from-transparent via-brand to-transparent"
           />
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">
           <div className="flex items-center gap-2">
              <Loader2 size={12} className="animate-spin text-cyan" />
              Connecting to Render
           </div>
           <div className="flex items-center gap-2">
              <Sparkles size={12} className="text-brand" />
              Spinning up Llama 3
           </div>
        </div>
      </div>

      <p className="fixed bottom-12 text-[10px] font-black uppercase tracking-[0.4em] text-slate-700">
        StudyBuddy Career OS • Neural Bridge v1.0
      </p>
    </div>
  );
}
