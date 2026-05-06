import { Link } from "react-router-dom";
import {
  ArrowRight,
  Brain,
  Briefcase,
  Target,
  Sparkles,
  ShieldCheck,
  ListChecks,
  TerminalSquare,
  Zap,
  Globe,
  Lock,
  MessageSquare
} from "lucide-react";
import { useAppStore } from "../store/app-store";
import { motion as Motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, type FormEvent, useRef } from "react";
import "./LandingPage.css";

const features = [
  {
    icon: Brain,
    title: "Veda Memory Engine",
    text: "AI-driven spaced repetition. Veda analyzes your notes to predict exactly when you'll forget a concept, then nudges you to review."
  },
  {
    icon: Zap,
    title: "Execution-First AI",
    text: "Most AI chat bots just talk. Veda builds daily tasks, schedules mock interviews, and ensures your study hours convert to job readiness."
  },
  {
    icon: Target,
    title: "Gap-Specific Roadmap",
    text: "Sync your resume and notes. Our roadmap engine uses Llama 3.3 to find exactly where you fall short of your dream role."
  }
];

export function LandingPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const [targetInput, setTargetInput] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const handleQuickStart = (e: FormEvent) => {
    e.preventDefault();
    if (targetInput.trim()) {
      localStorage.setItem("studybuddy_pending_target", targetInput.trim());
    }
    navigate(isAuthenticated ? "/dashboard" : "/auth");
  };

  const startPath = isAuthenticated ? "/dashboard" : "/auth";

  return (
    <div className="landing-page" ref={containerRef}>
      <header className="landing-nav max-w-7xl mx-auto px-6">
        <div className="nav-logo">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-cyan flex items-center justify-center text-white shadow-lg">
            S
          </div>
          StudyBuddy
        </div>
        <nav className="nav-links hidden md:flex">
          <a href="#features" className="nav-link">Features</a>
          <a href="#how-it-works" className="nav-link">Workflow</a>
          <Link to="/auth" className="nav-link">Login</Link>
        </nav>
        <Link to={startPath} className="btn-primary">
          {isAuthenticated ? "Dashboard" : "Get Started"}
        </Link>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <Motion.div 
            className="landing-hero__copy"
            style={{ y: heroY, opacity: heroOpacity }}
          >
            <Motion.span 
              className="landing-kicker"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Sparkles size={14} />
              AI Career OS for Developers
            </Motion.span>
            
            <Motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Build your <span className="text-gradient">future</span> <br />
              with precision.
            </Motion.h1>

            <Motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Stop collecting notes and start building a career. StudyBuddy turns your scattered knowledge into a data-driven daily execution plan.
            </Motion.p>

            <Motion.div 
              className="landing-hero__actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {!isAuthenticated && (
                <form onSubmit={handleQuickStart} className="quick-start-form">
                  <div className="quick-start-input-wrap">
                    <Target size={20} className="text-brand" />
                    <input 
                      type="text" 
                      placeholder="What is your dream role? (e.g. SRE at Google)"
                      className="quick-start-input"
                      value={targetInput}
                      onChange={(e) => setTargetInput(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn-primary">
                    Go
                    <ArrowRight size={18} />
                  </button>
                </form>
              )}
            </Motion.div>
          </Motion.div>

          <div className="landing-hero__visual">
            <div className="visual-backdrop" />
            <div className="landing-orbit orbit-1" />
            <div className="landing-orbit orbit-2" />
            
            <Motion.div 
              className="floating-card card-readiness"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            >
              <div className="card-label">
                <ShieldCheck size={14} />
                Veda Analysis
              </div>
              <h4>84% Readiness</h4>
              <p>Match score for L5 Backend Engineer at Meta.</p>
            </Motion.div>

            <Motion.div 
              className="floating-card card-tasks"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            >
              <div className="card-label" style={{ color: "#7c5cff" }}>
                <ListChecks size={14} />
                Recall Tasks
              </div>
              <h4>4 Due Today</h4>
              <p>B-Trees, Distributed Locking, Raft Consensus...</p>
            </Motion.div>

            <Motion.div 
              className="floating-card card-sync"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            >
              <div className="card-label" style={{ color: "#10b981" }}>
                <TerminalSquare size={14} />
                CLI Sync
              </div>
              <h4>12 Notes Linked</h4>
              <p>Successfully extracted 4 new skill entities.</p>
            </Motion.div>
          </div>
        </section>

        <Motion.section 
          className="landing-trust"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <div className="trust-item"><Briefcase size={20} /> Career First</div>
          <div className="trust-item"><Globe size={20} /> Open Standards</div>
          <div className="trust-item"><Lock size={20} /> Privacy Centric</div>
          <div className="trust-item"><MessageSquare size={20} /> Llama 3.3 Powered</div>
        </Motion.section>

        <section className="landing-features" id="features">
          <div className="section-head">
            <span className="eyebrow">The OS for Growth</span>
            <h2>Built for technical obsession.</h2>
            <p>Traditional note apps are where ideas go to die. StudyBuddy turns your knowledge into career leverage.</p>
          </div>

          <div className="feature-grid">
            {features.map((feature, i) => (
              <Motion.div 
                key={feature.title}
                className="feature-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="feature-icon">
                  <feature.icon size={24} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </Motion.div>
            ))}
          </div>
        </section>

        <section className="landing-cta">
          <div className="cta-glow" />
          <div>
            <span className="eyebrow" style={{ color: "#ffffff" }}>Start your journey</span>
            <h2>Stop studying. Start executing.</h2>
            <p>Join the next generation of engineers using AI to bridge their knowledge gaps and land elite roles.</p>
          </div>
          <Link to={startPath} className="btn-primary" style={{ padding: "1.25rem 3rem", fontSize: "1.125rem" }}>
            Get Early Access
            <ArrowRight size={20} />
          </Link>
        </section>
      </main>

      <footer className="landing-footer max-w-7xl mx-auto px-6 border-t border-white/5">
        <div className="footer-brand">
          <h2>StudyBuddy</h2>
          <p>The developer's companion for memory retention and career progression. Built for those who build.</p>
        </div>
        <div className="footer-links">
          <h4>Platform</h4>
          <ul>
            <li><a href="#">Features</a></li>
            <li><a href="#">Mentorship</a></li>
            <li><a href="#">Sync CLI</a></li>
          </ul>
        </div>
        <div className="footer-links">
          <h4>Connect</h4>
          <ul>
            <li><a href="https://linkedin.com/in/priyanshu-tiwari-pds37">LinkedIn</a></li>
            <li><a href="#">GitHub</a></li>
            <li><a href="#">Discord</a></li>
          </ul>
        </div>
      </footer>
    </div>
  );
}
