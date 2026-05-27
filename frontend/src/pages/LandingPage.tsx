import { Link } from "react-router-dom";
import {
  ArrowRight,
  Brain,
  Briefcase,
  Play,
  Target,
  Sparkles,
  Zap,
  ShieldCheck,
  ChevronRight,
  Layers
} from "lucide-react";
import { useAppStore } from "../store/app-store";
import { motion as Motion } from "framer-motion";
import { HeroVisualization } from "./HeroVisualization";

const features = [
  {
    icon: Brain,
    title: "Memory-aware learning",
    text: "Recall and forgetting signals shape what Veda asks you to revise before interviews expose the gap.",
    highlight: "text-purple-400",
    bg: "bg-purple-400/10"
  },
  {
    icon: Target,
    title: "Placement execution plan",
    text: "Roadmap, projects, resume, interview prep, and job targets collapse into one daily priority list.",
    highlight: "text-brand",
    bg: "bg-brand/10"
  },
  {
    icon: Briefcase,
    title: "Proof-first resume loop",
    text: "Turn completed tasks and shipped projects into role-specific resume proof instead of generic bullets.",
    highlight: "text-cyan-400",
    bg: "bg-cyan-400/10"
  }
];

const steps = [
  {
    title: "Set your placement goal",
    text: "Tell Veda your target role, timeline, weak areas, and daily availability to generate a baseline."
  },
  {
    title: "Follow today's plan",
    text: "Study, revise, build, interview, and apply from one student-friendly, distraction-free dashboard."
  },
  {
    title: "Prove readiness",
    text: "Convert roadmap progress, project evidence, and interview signals into a sharper, ATS-friendly resume."
  }
];

const trustItems = [
  "Unified intelligence",
  "Memory-aware roadmap",
  "Project proof loop",
  "Placement-ready workflow"
];

export function LandingPage() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const startPath = isAuthenticated ? "/dashboard" : "/auth";

  return (
    <div className="min-h-screen bg-[#000000] text-slate-100 selection:bg-brand/30 font-sans selection:text-white">
      
      {/* Background ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brand/10 blur-[150px] rounded-full pointer-events-none z-0" />

      {/* Top Navigation */}
      <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 md:px-12">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/20 border border-brand/30">
            <Zap size={16} className="text-brand" />
          </div>
          <span className="font-bold tracking-tight text-white">StudyBuddy</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/auth" className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden sm:block">
            Log in
          </Link>
          <Link to={startPath} className="text-sm font-semibold text-black bg-white px-4 py-2 rounded-full hover:bg-slate-200 transition-colors">
            Get Started
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex flex-col items-center pt-40 pb-24 overflow-hidden">
        
        {/* HERO SECTION */}
        <section className="w-full max-w-7xl px-6 flex flex-col items-center text-center mb-40 relative">
          
          <Motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 20 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand/30 bg-brand/10 mb-8 backdrop-blur-md"
          >
            <Sparkles size={12} className="text-brand" />
            <span className="text-xs font-bold text-brand tracking-widest uppercase">
              Meet Veda AI
            </span>
          </Motion.div>

          <Motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, type: "spring", stiffness: 90, damping: 18 }}
            className="text-5xl md:text-7xl lg:text-[80px] font-bold tracking-tighter text-white max-w-5xl leading-[1.05]"
          >
            Turn your placement goals into <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-500">today's exact plan.</span>
          </Motion.h1>

          <Motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 90, damping: 18 }}
            className="mt-8 text-lg md:text-xl text-slate-400 max-w-2xl font-light tracking-wide leading-relaxed"
          >
            StudyBuddy connects your notes, active recall, projects, and interview prep into one seamless AI-powered OS for college placements.
          </Motion.p>

          <Motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, type: "spring", stiffness: 90, damping: 18 }}
            className="mt-12 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Link to={startPath} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold text-black bg-white hover:bg-slate-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.3)]">
              Start Building
              <ArrowRight size={16} />
            </Link>
            <Link to="/demo" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all backdrop-blur-md">
              <Play size={14} className="fill-current" />
              Recruiter Demo
            </Link>
          </Motion.div>

          <Motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-24 w-full max-w-6xl mx-auto rounded-[2rem] border border-white/10 bg-[#0A0A0A]/50 p-2 md:p-4 backdrop-blur-xl shadow-2xl relative"
          >
            {/* Inner glowing edge */}
            <div className="absolute inset-0 rounded-[2rem] border border-white/[0.05] pointer-events-none" />
            <div className="rounded-[1.5rem] overflow-hidden border border-white/10 bg-black">
              <HeroVisualization />
            </div>
          </Motion.div>
        </section>

        {/* TRUST BAR */}
        <section className="w-full max-w-5xl px-6 py-12 flex flex-wrap justify-center md:justify-between items-center gap-6 mb-32 border-y border-white/5">
          {trustItems.map((item, index) => (
            <Motion.div 
              key={item} 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="text-xs md:text-sm font-semibold text-slate-500 flex items-center gap-2 tracking-[0.2em] uppercase"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
              {item}
            </Motion.div>
          ))}
        </section>

        {/* FEATURES BENTO GRID */}
        <section className="w-full max-w-7xl px-6 mb-40" id="features">
          <div className="flex flex-col items-center text-center mb-16">
            <Motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold tracking-tight text-white"
            >
              Built for <span className="text-brand">placement prep.</span>
            </Motion.h2>
            <Motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-6 text-lg text-slate-400 max-w-2xl font-light"
            >
              Traditional tools split your prep across notes, tasks, and job boards. StudyBuddy unifies the loop so every action directly improves your readiness.
            </Motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1: Wide Card */}
            <Motion.article 
              className="col-span-1 md:col-span-3 lg:col-span-2 rounded-[2rem] border border-white/10 bg-[#0A0A0A] p-10 md:p-14 hover:border-brand/40 transition-colors group relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-brand/20 transition-colors" />
              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-2xl ${features[1].bg} flex items-center justify-center ${features[1].highlight} mb-8 border border-white/5`}>
                  <Target size={28} />
                </div>
                <h3 className="text-3xl font-bold mb-4 text-white">{features[1].title}</h3>
                <p className="text-lg text-slate-400 font-light max-w-lg leading-relaxed">{features[1].text}</p>
              </div>
            </Motion.article>

            {/* Feature 2: Tall/Square Card */}
            <Motion.article 
              className="col-span-1 rounded-[2rem] border border-white/10 bg-[#0A0A0A] p-10 hover:border-purple-400/40 transition-colors group relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-purple-400/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-purple-400/20 transition-colors" />
              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-2xl ${features[0].bg} flex items-center justify-center ${features[0].highlight} mb-6 border border-white/5`}>
                  <Brain size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">{features[0].title}</h3>
                <p className="text-slate-400 font-light leading-relaxed">{features[0].text}</p>
              </div>
            </Motion.article>

            {/* Feature 3: Secondary Card */}
            <Motion.article 
              className="col-span-1 md:col-span-1 rounded-[2rem] border border-white/10 bg-[#0A0A0A] p-10 hover:border-cyan-400/40 transition-colors group relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-400/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-cyan-400/20 transition-colors" />
              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-2xl ${features[2].bg} flex items-center justify-center ${features[2].highlight} mb-6 border border-white/5`}>
                  <Briefcase size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">{features[2].title}</h3>
                <p className="text-slate-400 font-light leading-relaxed">{features[2].text}</p>
              </div>
            </Motion.article>
            
            {/* Extra Bento Box to balance the grid */}
            <Motion.article 
              className="col-span-1 md:col-span-2 rounded-[2rem] border border-white/10 bg-[#0A0A0A] p-10 flex flex-col justify-center items-center text-center relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-brand/5 to-transparent pointer-events-none" />
              <Layers className="text-slate-600 w-12 h-12 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Everything in one place</h3>
              <p className="text-slate-500 text-sm max-w-sm">Ditch the chaotic mess of Notion, Todoist, and Anki. Veda acts as the orchestrator for all of it.</p>
            </Motion.article>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="w-full max-w-5xl px-6 mb-40" id="how-to-use">
          <div className="flex flex-col items-center text-center mb-20">
            <Motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold tracking-tight text-white"
            >
              Three steps to <span className="text-slate-400">clarity.</span>
            </Motion.h2>
          </div>

          <div className="relative ml-4 md:ml-0 md:flex md:flex-col md:items-center">
            {/* Desktop Center Glow Line */}
            <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-[1px] bg-gradient-to-b from-brand/0 via-brand/50 to-brand/0 -translate-x-1/2" />
            
            {steps.map((step, index) => (
              <Motion.div 
                key={step.title}
                className={`relative pl-10 md:pl-0 md:w-[45%] mb-16 last:mb-0 ${index % 2 === 0 ? 'md:pr-16 md:self-start md:text-right' : 'md:pl-16 md:self-end md:text-left'}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                {/* Timeline Glow Dot */}
                <div className={`absolute top-1 md:top-3 w-4 h-4 rounded-full bg-brand shadow-[0_0_15px_rgba(124,92,191,0.8)] -left-[22px] md:-left-[8px] ${index % 2 === 0 ? 'md:left-auto md:-right-[8px]' : ''}`}>
                  <div className="w-full h-full bg-white rounded-full scale-[0.4]" />
                </div>
                
                <h3 className="text-2xl font-bold mb-3 text-white">{step.title}</h3>
                <p className="text-lg text-slate-400 font-light leading-relaxed">{step.text}</p>
              </Motion.div>
            ))}
          </div>
        </section>

        {/* PRICING / FINAL CTA */}
        <section className="w-full max-w-5xl px-6 mb-32" id="pricing">
          <Motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="rounded-[3rem] border border-white/10 bg-[#0A0A0A] p-12 md:p-20 flex flex-col items-center justify-center text-center relative overflow-hidden"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand/20 blur-[120px] pointer-events-none rounded-full" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/5 mb-6">
                <ShieldCheck size={14} className="text-green-400" />
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Start for free</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-6">
                Ready to own your prep?
              </h2>
              <p className="text-xl text-slate-400 font-light max-w-xl mx-auto mb-10 leading-relaxed">
                Upgrade to Pro Student when your prep gets serious for unlimited AI messages, notes, and deep interview intelligence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link to={startPath} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-black bg-white hover:bg-slate-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)] text-lg">
                  Get Started
                  <ArrowRight size={18} />
                </Link>
                <Link to="/demo" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-lg">
                  Explore Demo
                  <ChevronRight size={18} />
                </Link>
              </div>
            </div>
          </Motion.div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-white/5 bg-[#030303] py-16 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-12">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/20 border border-brand/30">
                <Zap size={16} className="text-brand" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">StudyBuddy</span>
            </div>
            <p className="text-sm text-slate-500 text-center md:text-left max-w-xs font-light">
              AI mentor, recall trainer, and career planning workspace for technical learners.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-12 md:gap-24 text-center md:text-left">
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600 mb-2">Product</span>
              <Link to="/" className="text-sm text-slate-400 hover:text-white transition-colors">Home</Link>
              <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">Features</a>
              <Link to="/pricing" className="text-sm text-slate-400 hover:text-white transition-colors">Pricing</Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600 mb-2">Connect</span>
              <a href="https://www.linkedin.com/in/priyanshu-tiwari-pds37" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">GitHub</a>
              <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 text-center text-xs text-slate-600 font-light tracking-wide">
          &copy; 2026 StudyBuddy. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
