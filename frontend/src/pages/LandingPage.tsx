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
import { useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import "./LandingPage.css";

const features = [
  {
    icon: Brain,
    title: "Smarter recall",
    text: "Spaced repetition for your notes. StudyBuddy knows when you're about to forget a concept."
  },
  {
    icon: Target,
    title: "Career-aware AI",
    text: "Your AI mentor, Veda, understands your career goals and guides your study accordingly."
  },
  {
    icon: Briefcase,
    title: "Resume-to-Role",
    text: "Turn your study proofs into role-specific bullet points that recruiters actually care about."
  }
];

const steps = [
  {
    title: "Sync your notes",
    text: "Keep writing in Markdown. Our CLI syncs your local vault into the cloud workspace."
  },
  {
    title: "Define your target",
    text: "Tell StudyBuddy the role you want. It analyzes your notes against industry expectations."
  },
  {
    title: "Execute daily",
    text: "Follow your dashboard tasks: recall, projects, and interview prep tailored to your gaps."
  }
];

const trustItems = [
  "Local-first Markdown",
  "Built for developers",
  "Privacy by design",
  "AI-driven execution"
];

export function LandingPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const [targetInput, setTargetInput] = useState("");
  
  const handleQuickStart = (e: FormEvent) => {
    e.preventDefault();
    if (targetInput.trim()) {
      localStorage.setItem("studybuddy_pending_target", targetInput.trim());
    }
    navigate(isAuthenticated ? "/dashboard" : "/auth");
  };

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
              AI career workspace
            </Motion.span>
            <Motion.h1 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Turn scattered study notes into a daily career plan.
            </Motion.h1>
            <Motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              StudyBuddy connects your notes, resume, roadmap, recall queue, and AI mentor so the next useful task is always obvious.
            </Motion.p>

            <div className="landing-hero__actions">
              {!isAuthenticated ? (
                <form onSubmit={handleQuickStart} className="quick-start-form">
                  <div className="quick-start-input-wrap">
                    <Target size={18} className="text-cyan" />
                    <input 
                      type="text" 
                      placeholder="What's your dream role? (e.g. AI Engineer)"
                      className="quick-start-input"
                      value={targetInput}
                      onChange={(e) => setTargetInput(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn-primary">
                    Get Started
                    <ArrowRight size={18} />
                  </button>
                </form>
              ) : (
                <Link to="/dashboard" className="btn-primary">
                  Go to Dashboard
                  <ArrowRight size={18} />
                </Link>
              )}
              <a href="#features" className="btn-secondary">
                See workflow
                <Play size={16} />
              </a>
            </div>

            <div className="landing-hero__stats">
              <div className="landing-stat">
                <strong>10x</strong>
                <span>Faster recall</span>
              </div>
              <div className="landing-stat">
                <strong>1 App</strong>
                <span>For all career loops</span>
              </div>
              <div className="landing-stat">
                <strong>Role-first</strong>
                <span>Career context</span>
              </div>
            </div>
          </div>

          <div className="landing-hero__visual" aria-hidden="true">
            <Motion.div 
              className="landing-cluster landing-cluster--primary"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="landing-cluster__badge">
                <ShieldCheck size={16} />
                Ready for role
              </div>
              <strong>72% Readiness</strong>
              <span>+18 points this month</span>
            </Motion.div>
            
            <Motion.div 
              className="landing-cluster landing-cluster--secondary"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <ListChecks size={16} />
              6 Recall tasks due
            </Motion.div>

            <Motion.div 
              className="landing-cluster landing-cluster--accent"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <TerminalSquare size={16} />
              Sync: 12 notes added
            </Motion.div>

            <div className="landing-orbit landing-orbit--one" />
            <div className="landing-orbit landing-orbit--two" />
          </div>
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
            <h2>Built for developers, not just for notes.</h2>
            <p>
              Traditional note apps are where ideas go to die. StudyBuddy turns your knowledge 
              into career progression through active feedback loops.
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
            <h2>Three steps to a clearer career path.</h2>
            <p>
              StudyBuddy integrates with your existing workflow, adding a layer of 
              intelligence that plans your daily execution.
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

        <section className="landing-cta">
          <div>
            <span className="eyebrow">Ready to start?</span>
            <h2>Turn study chaos into a clear career system.</h2>
            <p>
              Join other developers using StudyBuddy to bridge their skill gaps and 
              land their dream roles with precision.
            </p>
          </div>
          <Link to={startPath} className="btn-primary">
            Launch StudyBuddy
            <ArrowRight size={18} />
          </Link>
        </section>
      </main>

      <footer className="landing-footer max-w-7xl mx-auto px-6">
        <div className="footer-brand">
          <strong>StudyBuddy</strong>
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
