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
    <div className="min-h-screen bg-ai-workspace">
      <main className="relative z-10 flex flex-col items-center pt-24 pb-32">
        <section className="w-full max-w-6xl px-6 flex flex-col items-center text-center mt-12 mb-32" id="home">
          <Motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 90, damping: 18 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand/30 bg-brand/10 mb-8"
          >
            <Sparkles size={14} className="text-brand" />
            <span className="text-xs font-semibold text-brand-light uppercase tracking-widest">
              AI student career OS
            </span>
          </Motion.div>

          <Motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, type: "spring", stiffness: 90, damping: 18 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-white max-w-4xl leading-[1.1]"
          >
            Veda turns your placement goal into today's exact plan.
          </Motion.h1>

          <Motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 90, damping: 18 }}
            className="mt-8 text-xl text-text-secondary max-w-2xl font-light"
          >
            StudyBuddy connects notes, recall, roadmap, projects, resume, interviews, and jobs into one adaptive dashboard for college placements.
          </Motion.p>

          <Motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, type: "spring", stiffness: 90, damping: 18 }}
            className="mt-12 flex flex-col sm:flex-row items-center gap-4"
          >
            <Link to={startPath} className="btn-primary px-6 py-3 text-base">
              Open workspace
              <ArrowRight size={18} />
            </Link>
            <Link to="/demo" className="btn-secondary px-6 py-3 text-base">
              Try demo
              <Play size={16} />
            </Link>
          </Motion.div>

          <Motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-24 w-full flex justify-center"
          >
            <HeroVisualization />
          </Motion.div>
        </section>

        <section className="w-full max-w-5xl px-6 flex flex-wrap justify-center gap-6 md:gap-12 py-12 border-y border-white/5 bg-surface mb-32" aria-label="Trust bar">
          {trustItems.map((item, index) => (
            <Motion.span 
              key={item} 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="text-sm font-medium text-text-muted flex items-center gap-2 tracking-wide"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-brand/50" />
              {item}
            </Motion.span>
          ))}
        </section>

        <section className="w-full max-w-6xl px-6 mb-32" id="features">
          <div className="text-center mb-16">
            <span className="eyebrow mb-3">Why StudyBuddy?</span>
            <h2 className="text-3xl md:text-4xl">Built for placement prep, not just note storage.</h2>
            <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
              Traditional tools split your prep across notes, tasks, job boards, and resume docs. StudyBuddy unifies the loop so every action improves readiness.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Motion.article 
                key={feature.title} 
                className="cognitive-card p-8 flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-light mb-6">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl mb-3">{feature.title}</h3>
                <p className="text-text-secondary leading-relaxed flex-1">{feature.text}</p>
              </Motion.article>
            ))}
          </div>
        </section>

        <section className="w-full max-w-6xl px-6 mb-32" id="how-to-use">
          <div className="text-center mb-16">
            <span className="eyebrow mb-3">How it works</span>
            <h2 className="text-3xl md:text-4xl">Three steps to a clearer placement path.</h2>
            <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
              StudyBuddy adds the student intelligence layer: what you know, what you forget, what you build, and what your target role needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <Motion.article 
                key={step.title} 
                className="relative p-8 rounded-2xl border border-white/5 bg-surface/50 overflow-hidden"
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand/0 via-brand/40 to-brand/0 opacity-50" />
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4 block">Step {index + 1}</span>
                <h3 className="text-xl mb-3">{step.title}</h3>
                <p className="text-text-secondary leading-relaxed">{step.text}</p>
              </Motion.article>
            ))}
          </div>
        </section>

        <section className="w-full max-w-4xl px-6 mb-32" id="pricing">
          <div className="text-center mb-12">
            <span className="eyebrow mb-3">Premium SaaS</span>
            <h2 className="text-3xl md:text-4xl">Free to start. Pro when your prep gets serious.</h2>
          </div>
          <div className="cognitive-card p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <strong className="block text-2xl mb-2">Pro Student</strong>
              <span className="text-text-secondary">2,000 AI messages, 10,000 notes, 50 projects, resume and interview intelligence.</span>
            </div>
            <Link to="/pricing" className="btn-primary shrink-0">
              View pricing
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        <section className="w-full max-w-4xl px-6 text-center mb-16">
          <span className="eyebrow mb-3">Ready to start?</span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Turn study chaos into a clear career system.</h2>
          <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto">
            Explore a seeded student workspace with roadmap, recall, project proof, resume readiness, and Veda's next best action.
          </p>
          <Link to="/demo" className="btn-primary px-8 py-4 text-lg">
            Try recruiter demo
            <ArrowRight size={18} />
          </Link>
        </section>
      </main>

      <footer className="w-full border-t border-white/5 bg-background py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 border border-brand/20">
                <Sparkles size={16} className="text-brand" />
              </div>
              <span className="font-semibold text-lg text-white">StudyBuddy</span>
            </div>
            <p className="text-sm text-text-muted text-center md:text-left max-w-xs">AI mentor, recall trainer, and career planning workspace for technical learners.</p>
          </div>
          <div className="flex gap-6 text-sm font-medium text-text-secondary">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <Link to="/auth" className="hover:text-white transition-colors">Login</Link>
          </div>
          <div className="flex gap-4 text-text-muted">
            <a href="https://www.linkedin.com/in/priyanshu-tiwari-pds37" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              <Linkedin size={20} />
            </a>
            <a href="#" className="hover:text-white transition-colors">
              <Github size={20} />
            </a>
            <a href="#" className="hover:text-white transition-colors">
              <MessageCircle size={20} />
            </a>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 text-center text-xs text-text-muted/50">
          Copyright 2026 StudyBuddy
        </div>
      </footer>
    </div>
  );
}
