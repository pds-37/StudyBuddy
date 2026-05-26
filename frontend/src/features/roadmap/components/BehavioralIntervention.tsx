import React from "react";
import { motion as Motion } from "framer-motion";
import { Sparkles, ArrowRight, ShieldAlert, Heart, Zap } from "lucide-react";
import { cn } from "../../../lib/utils/cn";

interface BehavioralInterventionProps {
  type: "recovery" | "burnout" | "overload" | "acceleration";
  message: string;
  onAction: () => void;
}

export function BehavioralIntervention({ type, message, onAction }: BehavioralInterventionProps) {
  const configs = {
    recovery: {
      icon: Heart,
      title: "Welcome Back",
      color: "text-rose-400",
      bg: "bg-rose-400/10",
      border: "border-rose-400/20",
      action: "Start Recovery Sprint"
    },
    burnout: {
      icon: ShieldAlert,
      title: "Sustainable Pacing",
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      border: "border-amber-400/20",
      action: "Simplify Roadmap"
    },
    overload: {
      icon: ShieldAlert,
      title: "Cognitive Load Alert",
      color: "text-cyan-400",
      bg: "bg-cyan-400/10",
      border: "border-cyan-400/20",
      action: "Re-prioritize Tracks"
    },
    acceleration: {
      icon: Zap,
      title: "Learning Velocity",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      border: "border-emerald-400/20",
      action: "Unlock Advanced Path"
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <Motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-6 rounded-[24px] border flex flex-col md:flex-row items-center gap-6",
        config.bg,
        config.border
      )}
    >
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", config.bg, config.border)}>
        <Icon className={cn("w-6 h-6", config.color)} />
      </div>
      
      <div className="flex-1 text-center md:text-left">
        <h4 className={cn("text-xs font-bold uppercase tracking-[0.2em] mb-1", config.color)}>{config.title}</h4>
        <p className="text-sm text-slate-300 text-slate-300 font-medium leading-relaxed">{message}</p>
      </div>

      <button 
        onClick={onAction}
        className={cn(
          "px-6 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 transition shadow-lg",
          "bg-transparent bg-obsidian border border-white/10 hover:bg-white/5"
        )}
      >
        {config.action} <ArrowRight className="w-4 h-4" />
      </button>
    </Motion.div>
  );
}
