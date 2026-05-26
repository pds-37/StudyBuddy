import React, { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  X, 
  Sparkles, 
  Target, 
  Brain, 
  Zap, 
  ArrowRight, 
  Clock, 
  ChevronRight,
  TrendingUp,
  Compass
} from "lucide-react";
import { useRoadmapsStore } from "../../../store/roadmaps-store";
import { cn } from "../../../lib/utils/cn";

interface ExpansionFlowProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExpansionFlow({ isOpen, onClose }: ExpansionFlowProps) {
  const [step, setStep] = useState(1);
  const { addTrack, generating } = useRoadmapsStore();
  
  const [data, setData] = useState({
    newInterest: "",
    expansionReason: "",
    priorityWeight: 0.5,
    initialTrackLevel: "beginner"
  });

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleComplete = async () => {
    const success = await addTrack(data);
    if (success) onClose();
  };

  const isStepValid = () => {
    if (step === 1) return data.newInterest.length > 1;
    if (step === 2) return data.expansionReason !== "";
    return true;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <Motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <Motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-transparent bg-obsidian border border-white/[0.08] rounded-[32px] overflow-hidden shadow-2xl"
      >
        {/* HEADER */}
        <div className="px-8 pt-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white text-white">Career Evolution</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Expansion Protocol</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-slate-500 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PROGRESS BAR */}
        <div className="px-8 mt-6">
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden flex gap-1">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={cn("h-full flex-1 transition-all duration-500 rounded-full", s <= step ? "bg-brand" : "bg-white/5")} />
            ))}
          </div>
        </div>

        {/* CONTENT */}
        <div className="px-8 py-10 min-h-[380px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <Motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white text-white leading-tight">What new area do you want to explore?</h3>
                  <p className="text-sm text-slate-500">I'll map this interest into your existing learning graph.</p>
                </div>
                
                <div className="space-y-4">
                  <input 
                    autoFocus
                    placeholder="e.g. AI Foundations, Backend, DevOps..."
                    value={data.newInterest}
                    onChange={e => setData(prev => ({ ...prev, newInterest: e.target.value }))}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white text-white focus:outline-none focus:border-brand/50 transition-all"
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    {["AI & ML", "Backend Architecture", "System Design", "Cloud & DevOps", "Cybersecurity", "Product Design"].map(tag => (
                      <button 
                        key={tag}
                        onClick={() => setData(prev => ({ ...prev, newInterest: tag }))}
                        className={cn(
                          "px-4 py-3 rounded-xl border text-[11px] font-bold uppercase tracking-widest transition-all text-left",
                          data.newInterest === tag ? "border-brand bg-brand/10 text-brand" : "border-white/5 bg-white/[0.02] text-slate-500 hover:border-white/20"
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </Motion.div>
            )}

            {step === 2 && (
              <Motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white text-white leading-tight">Why are you adding this skill path?</h3>
                  <p className="text-sm text-slate-500">Understanding your intent helps me prioritize resources.</p>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { id: "career", label: "Career Demand", sub: "Market is shifting this way" },
                    { id: "curiosity", label: "Curiosity", sub: "Personal interest exploration" },
                    { id: "placement", label: "Placement Prep", sub: "Specific role preparation" },
                    { id: "transition", label: "Full Career Transition", sub: "Switching domains entirely" },
                    { id: "startup", label: "Startup Building", sub: "Need diverse skills for a venture" }
                  ].map(option => (
                    <button 
                      key={option.id}
                      onClick={() => setData(prev => ({ ...prev, expansionReason: option.id }))}
                      className={cn(
                        "flex items-center justify-between px-6 py-4 rounded-2xl border transition-all text-left group",
                        data.expansionReason === option.id ? "border-brand bg-brand/10" : "border-white/5 bg-white/[0.02] hover:border-white/10"
                      )}
                    >
                      <div>
                        <p className={cn("text-sm font-bold uppercase tracking-widest", data.expansionReason === option.id ? "text-brand" : "text-slate-400 group-hover:text-slate-300")}>{option.label}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{option.sub}</p>
                      </div>
                      <ChevronRight className={cn("w-4 h-4", data.expansionReason === option.id ? "text-brand" : "text-slate-300")} />
                    </button>
                  ))}
                </div>
              </Motion.div>
            )}

            {step === 3 && (
              <Motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white text-white leading-tight">How much time do you want to dedicate weekly?</h3>
                  <p className="text-sm text-slate-500">I'll balance this with your existing learning tracks.</p>
                </div>
                
                <div className="space-y-10 py-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-brand mb-1">Weekly Allocation</p>
                      <p className="text-3xl font-bold text-white text-white">{data.priorityWeight === 0.2 ? "2 hrs" : data.priorityWeight === 0.5 ? "5 hrs" : data.priorityWeight === 0.7 ? "10 hrs" : "Full Focus"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Priority</p>
                      <p className="text-xl font-bold text-white text-white">{Math.round(data.priorityWeight * 100)}%</p>
                    </div>
                  </div>
                  
                  <div className="relative h-2 bg-white/5 rounded-full">
                    <input 
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.1"
                      value={data.priorityWeight}
                      onChange={e => setData(prev => ({ ...prev, priorityWeight: parseFloat(e.target.value) }))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />
                    <Motion.div 
                      className="absolute left-0 top-0 h-full bg-brand rounded-full z-10"
                      style={{ width: `${data.priorityWeight * 100}%` }}
                    />
                    <div className="absolute top-6 left-0 right-0 flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      <span>Casual</span>
                      <span>Balanced</span>
                      <span>High Priority</span>
                    </div>
                  </div>
                </div>
              </Motion.div>
            )}

            {step === 4 && (
              <Motion.div 
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white text-white leading-tight">How familiar are you with this domain?</h3>
                  <p className="text-sm text-slate-500">I'll adjust the starting point of your new expansion track.</p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { id: "beginner", label: "Absolute Beginner", icon: Compass, sub: "Starting from scratch" },
                    { id: "intermediate", label: "Intermediate", icon: TrendingUp, sub: "I know the basics" },
                    { id: "experienced", label: "Experienced", icon: Zap, sub: "Deep technical background" }
                  ].map(option => (
                    <button 
                      key={option.id}
                      onClick={() => setData(prev => ({ ...prev, initialTrackLevel: option.id }))}
                      className={cn(
                        "flex items-center gap-5 px-6 py-6 rounded-2xl border transition-all text-left",
                        data.initialTrackLevel === option.id ? "border-brand bg-brand/10" : "border-white/5 bg-white/[0.02] hover:border-white/10"
                      )}
                    >
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", data.initialTrackLevel === option.id ? "bg-brand text-white text-white text-white" : "bg-white/5 text-slate-500")}>
                        <option.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className={cn("text-sm font-bold uppercase tracking-widest", data.initialTrackLevel === option.id ? "text-brand" : "text-slate-300")}>{option.label}</p>
                        <p className="text-[11px] text-slate-500 mt-1">{option.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </Motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* FOOTER */}
        <div className="px-8 py-8 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
          <button 
            onClick={prevStep}
            disabled={step === 1}
            className={cn("text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-0", step === 1 && "pointer-events-none")}
          >
            ← Back
          </button>
          
          {step < 4 ? (
            <button 
              onClick={nextStep}
              disabled={!isStepValid()}
              className="px-8 py-3 rounded-xl bg-brand text-white text-white text-white text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-brand/90 transition shadow-glow disabled:opacity-50 disabled:hover:bg-brand disabled:cursor-not-allowed"
            >
              Continue <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button 
              onClick={handleComplete}
              disabled={generating}
              className="px-8 py-3 rounded-xl bg-brand text-white text-white text-white text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-brand/90 transition shadow-glow disabled:opacity-50"
            >
              {generating ? "Calibrating..." : "Launch Expansion"} <Target className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </Motion.div>
    </div>
  );
}
