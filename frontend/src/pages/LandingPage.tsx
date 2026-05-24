import { Link } from "react-router-dom";
import {
  ArrowRight,
  Brain,
  Briefcase,
  ChevronRight,
  FileText,
  Github,
  GraduationCap,
  Linkedin,
  ListChecks,
  MessageCircle,
  Play,
  Route,
  ShieldCheck,
  Sparkles,
  Target,
  TerminalSquare
} from "lucide-react";
import { useAppStore } from "../store/app-store";
import { motion as Motion } from "framer-motion";
import { HeroVisualization } from "./HeroVisualization";
import "./LandingPage.css";

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
    <div className="landing-page">
      <main className="landing-main">
        <section className="landing-hero" id="home">
          <div className="landing-hero__copy">
            <Motion.span 
              className="landing-kicker"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Sparkles size={16} />
              AI student career OS
            </Motion.span>
            <Motion.h1 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Veda turns your placement goal into today's exact plan.
            </Motion.h1>
            <Motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              StudyBuddy connects notes, recall, roadmap, projects, resume, interviews, and jobs into one adaptive dashboard for college placements.
            </Motion.p>

            <div className="landing-hero__actions">
              <Link to={startPath} className="btn-primary">
                Open workspace
                <ArrowRight size={18} />
              </Link>
              <Link to="/demo" className="btn-secondary">
                Try demo
                <Play size={16} />
              </Link>
              <a href="#features" className="btn-secondary">
                See workflow
                <ChevronRight size={16} />
              </a>
            </div>

            <div className="landing-hero__stats">
              <div className="landing-stat">
                <strong>7-day</strong>
                <span>Placement sprint</span>
              </div>
              <div className="landing-stat">
                <strong>1 App</strong>
                <span>For the prep loop</span>
              </div>
              <div className="landing-stat">
                <strong>AI Mentor</strong>
                <span>With student context</span>
              </div>
            </div>
          </div>

          <HeroVisualization />
        </section>

        <section className="landing-trust" aria-label="Trust bar">
          {trustItems.map((item, index) => (
            <Motion.span 
              key={item} 
              className="landing-trust__pill"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              {item}
            </Motion.span>
          ))}
        </section>

        <section className="landing-features" id="features">
          <div className="landing-section-head">
            <span className="eyebrow">Why StudyBuddy?</span>
            <h2>Built for placement prep, not just note storage.</h2>
            <p>
              Traditional tools split your prep across notes, tasks, job boards, and resume docs. StudyBuddy unifies the loop so every action improves readiness.
            </p>
          </div>

          <Motion.div 
            className="landing-feature-grid"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, staggerChildren: 0.2 }}
          >
            {features.map((feature, index) => (
              <Motion.article 
                key={feature.title} 
                className="feature-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="feature-icon">
                  <feature.icon size={20} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </Motion.article>
            ))}
          </Motion.div>
        </section>

        <section className="landing-howto" id="how-to-use">
          <div className="landing-section-head">
            <span className="eyebrow">How it works</span>
            <h2>Three steps to a clearer placement path.</h2>
            <p>
              StudyBuddy adds the student intelligence layer: what you know, what you forget, what you build, and what your target role needs.
            </p>
          </div>

          <div className="landing-howto__grid">
            {steps.map((step, index) => (
              <Motion.article 
                key={step.title} 
                className="howto-card"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <span className="howto-step">Step {index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </Motion.article>
            ))}
          </div>
        </section>

        <section className="landing-pricing" id="pricing">
          <div className="landing-section-head">
            <span className="eyebrow">Premium SaaS</span>
            <h2>Free to start. Pro when your prep gets serious.</h2>
            <p>
              Usage limits are transparent: AI messages, notes tracked, mentor plans, and projects.
            </p>
          </div>
          <div className="landing-price-strip">
            <div>
              <strong>Pro Student</strong>
              <span>2,000 AI messages, 10,000 notes, 50 projects, resume and interview intelligence.</span>
            </div>
            <Link to="/pricing" className="btn-primary">
              View pricing
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        <section className="landing-cta">
          <div>
            <span className="eyebrow">Ready to start?</span>
            <h2>Turn study chaos into a clear career system.</h2>
            <p>
              Explore a seeded student workspace with roadmap, recall, project proof, resume readiness, and Veda's next best action.
            </p>
          </div>
          <Link to="/demo" className="btn-primary">
            Try recruiter demo
            <ArrowRight size={18} />
          </Link>
        </section>
      </main>

      <footer className="landing-footer max-w-7xl mx-auto px-6">
        <div className="footer-brand">
          <img src="/brand/studybuddy-logo.png" alt="StudyBuddy Logo" className="h-10 w-auto object-contain mb-4" />
          <p>AI mentor, recall trainer, and career planning workspace for technical learners.</p>
        </div>
        <div className="footer-nav">
          <Link to="/">Home</Link>
          <a href="#features">Features</a>
          <Link to="/auth">Login</Link>
        </div>
        <div className="footer-meta">
          <div className="flex gap-4">
            <a href="https://www.linkedin.com/in/priyanshu-tiwari-pds37" target="_blank" rel="noopener noreferrer">
              <Linkedin size={20} />
            </a>
            <a href="#">
              <Github size={20} />
            </a>
            <a href="#">
              <MessageCircle size={20} />
            </a>
          </div>
          <p className="mt-4 text-xs text-slate-500">Copyright 2026 StudyBuddy</p>
        </div>
      </footer>
    </div>
  );
}
