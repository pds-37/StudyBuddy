import { Link } from "react-router-dom";
import {
  ArrowRight,
  Brain,
  Briefcase,
  Github,
  Linkedin,
  MessageCircle,
  Play,
  Target,
  Sparkles
} from "lucide-react";
import { useAppStore } from "../store/app-store";
import { motion as Motion } from "framer-motion";
import { HeroVisualization } from "./HeroVisualization";

const features = [
  {
    icon: Brain,
    title: "Memory-aware learning",
    text: "Recall and forgetting signals shape what Veda asks you to revise before interviews expose the gap."
  },
  {
    icon: Target,
    title: "Placement execution plan",
    text: "Roadmap, projects, resume, interview prep, and job targets collapse into one daily priority list."
  },
  {
    icon: Briefcase,
    title: "Proof-first resume loop",
    text: "Turn completed tasks and shipped projects into role-specific resume proof instead of generic bullets."
  }
];

const steps = [
  {
    title: "Set your placement goal",
    text: "Tell Veda your target role, timeline, weak areas, and daily availability."
  },
  {
    title: "Follow today's plan",
    text: "Study, revise, build, interview, and apply from one student-friendly dashboard."
  },
  {
    title: "Prove readiness",
    text: "Convert roadmap progress, project evidence, and interview signals into a sharper resume."
  }
];

const trustItems = [
  "Unified student intelligence",
  "Memory-aware roadmap",
  "Project proof loop",
  "Placement-ready workflow"
];

export function LandingPage() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const startPath = isAuthenticated ? "/dashboard" : "/auth";

  return (
    <div className="min-h-screen bg-black text-white selection:bg-brand/30">
      <main className="relative z-10 flex flex-col items-center pt-32 pb-24 overflow-hidden">
        
        {/* HERO SECTION */}
        <section className="w-full max-w-7xl px-6 flex flex-col items-center text-center mb-40 relative">
          {/* Subtle top glow */}
          <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand/10 blur-[120px] rounded-full pointer-events-none" />
          
          <Motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 90, damping: 18 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-8 backdrop-blur-md"
          >
            <Sparkles size={14} className="text-white" />
            <span className="text-xs font-medium text-white tracking-widest uppercase">
              AI Student Career OS
            </span>
          </Motion.div>

          <Motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, type: "spring", stiffness: 90, damping: 18 }}
            className="text-5xl md:text-8xl font-medium tracking-tighter text-white max-w-5xl leading-[1.05]"
          >
            Turn placement goals into today's exact plan.
          </Motion.h1>

          <Motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 90, damping: 18 }}
            className="mt-8 text-xl md:text-2xl text-text-muted max-w-3xl font-light tracking-wide"
          >
            StudyBuddy connects notes, recall, projects, and interviews into one seamless dashboard for college placements.
          </Motion.p>

          <Motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, type: "spring", stiffness: 90, damping: 18 }}
            className="mt-12 flex flex-col sm:flex-row items-center gap-4"
          >
            <Link to={startPath} className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-medium text-black bg-white hover:bg-gray-100 transition-colors">
              Open Workspace
              <ArrowRight size={18} />
            </Link>
            <Link to="/demo" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-medium text-white bg-transparent border border-white/20 hover:bg-white/10 transition-colors">
              Try Demo
              <Play size={16} className="fill-current" />
            </Link>
          </Motion.div>

          <Motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-24 w-full max-w-5xl mx-auto rounded-3xl border border-white/10 bg-white/5 p-4 md:p-8 backdrop-blur-sm"
          >
            <HeroVisualization />
          </Motion.div>
        </section>

        {/* TRUST BAR */}
        <section className="w-full max-w-7xl px-6 py-10 border-y border-white/10 flex flex-wrap justify-center md:justify-between items-center gap-8 mb-40">
          {trustItems.map((item, index) => (
            <Motion.div 
              key={item} 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              className="text-sm md:text-base font-medium text-text-muted flex items-center gap-3 tracking-widest uppercase"
            >
              <div className="w-1 h-1 rounded-full bg-white/50" />
              {item}
            </Motion.div>
          ))}
        </section>

        {/* FEATURES BENTO GRID */}
        <section className="w-full max-w-7xl px-6 mb-40" id="features">
          <div className="flex flex-col items-center text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight">Built for placement prep.</h2>
            <p className="mt-6 text-xl text-text-muted max-w-2xl font-light">
              Traditional tools split your prep across notes, tasks, and job boards. StudyBuddy unifies the loop so every action improves readiness.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Motion.article 
              className="col-span-1 md:col-span-2 rounded-3xl border border-white/10 bg-white/[0.02] p-10 md:p-16 hover:bg-white/[0.04] transition-colors group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform">
                <Target size={32} />
              </div>
              <h3 className="text-3xl font-medium mb-4">{features[1].title}</h3>
              <p className="text-xl text-text-muted font-light max-w-2xl">{features[1].text}</p>
            </Motion.article>

            <Motion.article 
              className="rounded-3xl border border-white/10 bg-white/[0.02] p-10 hover:bg-white/[0.04] transition-colors group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                <Brain size={28} />
              </div>
              <h3 className="text-2xl font-medium mb-3">{features[0].title}</h3>
              <p className="text-text-muted font-light text-lg">{features[0].text}</p>
            </Motion.article>

            <Motion.article 
              className="rounded-3xl border border-white/10 bg-white/[0.02] p-10 hover:bg-white/[0.04] transition-colors group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                <Briefcase size={28} />
              </div>
              <h3 className="text-2xl font-medium mb-3">{features[2].title}</h3>
              <p className="text-text-muted font-light text-lg">{features[2].text}</p>
            </Motion.article>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="w-full max-w-5xl px-6 mb-40" id="how-to-use">
          <div className="flex flex-col items-center text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight">Three steps to clarity.</h2>
          </div>

          <div className="relative border-l border-white/10 ml-4 md:ml-0 md:pl-0 md:border-none md:flex md:flex-col md:items-center">
            {/* Desktop Center Line */}
            <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/10 -translate-x-1/2" />
            
            {steps.map((step, index) => (
              <Motion.div 
                key={step.title}
                className={`relative pl-8 md:pl-0 md:w-1/2 mb-16 last:mb-0 ${index % 2 === 0 ? 'md:pr-16 md:self-start md:text-right' : 'md:pl-16 md:self-end md:text-left'}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
              >
                {/* Timeline Dot */}
                <div className={`absolute top-0 md:top-2 w-8 h-8 rounded-full bg-black border border-white/30 flex items-center justify-center text-xs font-bold -left-[17px] md:-left-[16px] ${index % 2 === 0 ? 'md:left-auto md:-right-[16px]' : ''}`}>
                  {index + 1}
                </div>
                
                <h3 className="text-2xl font-medium mb-3 mt-1 md:mt-0">{step.title}</h3>
                <p className="text-lg text-text-muted font-light">{step.text}</p>
              </Motion.div>
            ))}
          </div>
        </section>

        {/* PRICING */}
        <section className="w-full max-w-4xl px-6 mb-40" id="pricing">
          <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.02] p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden text-center md:text-left">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-brand/5 blur-[100px] pointer-events-none" />
            <div className="relative z-10 flex-1">
              <h2 className="text-3xl md:text-4xl font-medium mb-4">Start for free.</h2>
              <p className="text-xl text-text-muted font-light max-w-md mx-auto md:mx-0">
                Upgrade to Pro Student when your prep gets serious. 2,000 AI messages, 10,000 notes, and deep interview intelligence.
              </p>
            </div>
            <Link to="/pricing" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-medium text-black bg-white hover:bg-gray-100 transition-colors shrink-0 relative z-10">
              View Pricing
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="w-full max-w-4xl px-6 text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-medium tracking-tight mb-8">Ready to start?</h2>
          <Link to="/demo" className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-full font-medium text-black bg-white hover:bg-gray-100 transition-colors text-lg">
            Try Recruiter Demo
            <ArrowRight size={20} />
          </Link>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-white/10 bg-black py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-12">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <Sparkles size={20} className="text-white" />
              </div>
              <span className="font-semibold text-xl text-white tracking-tight">StudyBuddy</span>
            </div>
            <p className="text-base text-text-muted text-center md:text-left max-w-xs font-light">
              AI mentor, recall trainer, and career planning workspace for technical learners.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-12 md:gap-24 text-center md:text-left">
            <div className="flex flex-col gap-4">
              <span className="text-sm font-semibold uppercase tracking-widest text-white/50 mb-2">Product</span>
              <Link to="/" className="text-text-muted hover:text-white transition-colors">Home</Link>
              <a href="#features" className="text-text-muted hover:text-white transition-colors">Features</a>
              <Link to="/pricing" className="text-text-muted hover:text-white transition-colors">Pricing</Link>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-sm font-semibold uppercase tracking-widest text-white/50 mb-2">Connect</span>
              <a href="https://www.linkedin.com/in/priyanshu-tiwari-pds37" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="text-text-muted hover:text-white transition-colors">GitHub</a>
              <a href="#" className="text-text-muted hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 text-center text-sm text-white/30 font-light">
          &copy; 2026 StudyBuddy. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
