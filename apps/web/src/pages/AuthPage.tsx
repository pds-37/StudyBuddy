import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  CalendarClock,
  Check,
  Grid2x2,
  LockKeyhole,
  Radar,
  RotateCcw,
  Star
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import LoadingScreen from "@/components/LoadingScreen";
import { ApiError, apiRequest } from "@/lib/api";
import { useSession } from "@/hooks/useSession";

type AuthMode = "login" | "register";

const heroPoints = [
  "Automatic revision queue",
  "Weak topic prediction",
  "Daily study plan, zero guesswork"
];

const featureCards = [
  {
    icon: RotateCcw,
    title: "Automatic Revision Queue",
    body: "Spaced repetition schedules reviews right before you forget.",
    mini: [
      { label: "Calculus II", detail: "Review in 2h", value: 84 },
      { label: "Organic Chemistry", detail: "Review tomorrow", value: 62 }
    ]
  },
  {
    icon: Radar,
    title: "Weak Topic Prediction",
    body: "Buddy flags the gaps most likely to cost you marks before the exam does.",
    dots: [
      { label: "Weak", style: "landing-feature-card__dot landing-feature-card__dot--weak" },
      { label: "Growing", style: "landing-feature-card__dot landing-feature-card__dot--growing" },
      { label: "Strong", style: "landing-feature-card__dot landing-feature-card__dot--strong" }
    ]
  },
  {
    icon: CalendarClock,
    title: "Daily Study Plan",
    body: "Wake up to an optimized plan mapped to your workload and revision pressure.",
    schedule: [
      { time: "09:00", task: "Calculus — Chapter 7 Review", active: true },
      { time: "11:00", task: "Chemistry — Lab Notes" },
      { time: "14:00", task: "Physics — Problem Set 4" }
    ]
  }
];

const pricingPlans = [
  {
    name: "Student Basic",
    copy: "Perfect for getting started with smarter study habits.",
    price: "Free",
    suffix: "forever",
    button: "Start Free",
    featured: false,
    items: ["Basic revision scheduling", "Standard AI analysis", "Up to 3 courses", "Community support"]
  },
  {
    name: "Academic OS Pro",
    copy: "Unlimited power for students who refuse to leave GPA to chance.",
    price: "$12",
    suffix: "/month",
    button: "Upgrade to Pro",
    featured: true,
    items: [
      "Unlimited weak topic prediction",
      "Advanced adaptive study plans",
      "Priority exam routing",
      "24/7 AI tutor access",
      "Performance analytics dashboard",
      "Export and sync with calendar"
    ]
  }
];

const testimonials = [
  {
    quote:
      "My GPA went from 3.4 to 3.9 in one semester. The weak topic prediction alone caught gaps I didn't know I had.",
    name: "Sarah Chen",
    meta: "Pre-Med, Stanford"
  },
  {
    quote:
      "I used to spend hours planning what to study. Now I just open StudyBuddy and it tells me exactly what to do.",
    name: "Marcus Johnson",
    meta: "Engineering, MIT"
  },
  {
    quote:
      "The daily plan feature is a game-changer. I've never felt more in control of my academic life.",
    name: "Aisha Patel",
    meta: "Law, Yale"
  }
];

const footerColumns = [
  {
    title: "Product",
    links: ["Features", "Pricing", "Changelog", "Integrations"]
  },
  {
    title: "Resources",
    links: ["Documentation", "Blog", "Community", "Support"]
  },
  {
    title: "Company",
    links: ["About", "Careers", "Press", "Contact"]
  },
  {
    title: "Legal",
    links: ["Privacy", "Terms", "Cookies"]
  }
];

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const session = useSession();
  const authCardRef = useRef<HTMLElement | null>(null);
  const [mode, setMode] = useState<AuthMode>("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [errorMessage, setErrorMessage] = useState("");

  const redirectTarget = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const authMutation = useMutation({
    mutationFn: () =>
      apiRequest(`/auth/${mode}`, {
        method: "POST",
        json: form
      }),
    onSuccess: async () => {
      setErrorMessage("");
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      navigate(redirectTarget, { replace: true });
    },
    onError: (error) => {
      setErrorMessage(error instanceof ApiError ? error.message : "Could not sign you in.");
    }
  });

  useEffect(() => {
    if (session.data?.user) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, session.data?.user]);

  if (session.isLoading) {
    return <LoadingScreen message="Opening Study Buddy..." />;
  }

  const focusAuth = (nextMode: AuthMode) => {
    setMode(nextMode);
    authCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="landing">
      <div className="landing__noise" />
      <div className="landing__orb landing__orb--left" />
      <div className="landing__orb landing__orb--right" />

      <header className="landing-nav">
        <div className="landing-brand">
          <div className="landing-brand__mark">
            <Grid2x2 size={16} />
          </div>
          <strong>StudyBuddy</strong>
        </div>

        <nav className="landing-nav__links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#testimonials">Testimonials</a>
        </nav>

        <div className="landing-nav__actions">
          <button className="landing-nav__ghost" onClick={() => focusAuth("login")}>
            Sign in
          </button>
          <button className="landing-nav__primary" onClick={() => focusAuth("register")}>
            Get Started
          </button>
        </div>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <div className="landing-hero__copy">
            <p className="landing-kicker">Academic OS · Free for students</p>
            <h1>
              Study smarter.
              <span>Not harder.</span>
            </h1>
            <p className="landing-hero__text">
              The elite AI-powered study engine that predicts weak topics, builds your daily plan, and automates your
              revision queue. Reclaim your time.
            </p>

            <ul className="landing-hero__points">
              {heroPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>

          <section ref={authCardRef} className="landing-auth-card">
            <div className="landing-auth-card__tabs">
              <button className={mode === "register" ? "is-active" : ""} onClick={() => setMode("register")}>
                Create account
              </button>
              <button className={mode === "login" ? "is-active" : ""} onClick={() => setMode("login")}>
                Sign in
              </button>
            </div>

            {mode === "register" ? (
              <label className="landing-field">
                <span>Name</span>
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Aman Sharma"
                />
              </label>
            ) : null}

            <label className="landing-field">
              <span>Email</span>
              <input
                value={form.email}
                type="email"
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="you@college.edu"
              />
            </label>

            <label className="landing-field">
              <span>Password</span>
              <input
                value={form.password}
                type="password"
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="Min. 8 characters"
              />
            </label>

            <button className="landing-auth-card__submit" onClick={() => authMutation.mutate()} disabled={authMutation.isPending}>
              <span>{authMutation.isPending ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}</span>
              <ArrowRight size={18} />
            </button>

            <div className="landing-auth-card__divider">
              <span>or</span>
            </div>

            <button className="landing-auth-card__secondary" disabled>
              Continue with Google
            </button>

            <div className="landing-auth-card__legal">
              <LockKeyhole size={14} />
              <p>{errorMessage || "By signing up you agree to our Terms and Privacy Policy."}</p>
            </div>
          </section>
        </section>

        <section id="features" className="landing-section">
          <div className="landing-section__head">
            <p className="landing-kicker">Core Engine</p>
            <h2>
              Systematize your academic
              <span> performance.</span>
            </h2>
          </div>

          <div className="landing-feature-grid">
            {featureCards.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="landing-feature-card">
                  <div className="landing-feature-card__icon">
                    <Icon size={18} />
                  </div>
                  <strong>{feature.title}</strong>
                  <p>{feature.body}</p>

                  {feature.mini ? (
                    <div className="landing-feature-card__queue">
                      {feature.mini.map((item) => (
                        <div key={item.label} className="landing-feature-card__queue-item">
                          <div>
                            <strong>{item.label}</strong>
                            <span>{item.detail}</span>
                          </div>
                          <div className="landing-feature-card__bar">
                            <i style={{ width: `${item.value}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {feature.dots ? (
                    <div className="landing-feature-card__radar">
                      <div className="landing-feature-card__rings" />
                      {feature.dots.map((dot) => (
                        <div key={dot.label} className="landing-feature-card__dot-row">
                          <span className={dot.style} />
                          <small>{dot.label}</small>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {feature.schedule ? (
                    <div className="landing-feature-card__schedule">
                      {feature.schedule.map((entry) => (
                        <div key={`${entry.time}-${entry.task}`} className={`landing-feature-card__schedule-row ${entry.active ? "is-active" : ""}`}>
                          <span>{entry.time}</span>
                          <strong>{entry.task}</strong>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>

        <section id="pricing" className="landing-section">
          <div className="landing-section__head">
            <h2>
              Invest in your
              <span> GPA.</span>
            </h2>
          </div>

          <div className="landing-pricing-grid">
            {pricingPlans.map((plan) => (
              <article key={plan.name} className={`landing-pricing-card ${plan.featured ? "is-featured" : ""}`}>
                {plan.featured ? <div className="landing-pricing-card__badge">Most Popular</div> : null}

                <strong className="landing-pricing-card__name">{plan.name}</strong>
                <p className="landing-pricing-card__copy">{plan.copy}</p>

                <div className="landing-pricing-card__price">
                  <span>{plan.price}</span>
                  <small>{plan.suffix}</small>
                </div>

                <ul className="landing-pricing-card__list">
                  {plan.items.map((item) => (
                    <li key={item}>
                      <Check size={16} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <button className={plan.featured ? "landing-pricing-card__primary" : "landing-pricing-card__secondary"} onClick={() => focusAuth("register")}>
                  {plan.button}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section id="testimonials" className="landing-section">
          <div className="landing-section__head">
            <p className="landing-kicker">Testimonials</p>
            <h2>
              Trusted by
              <span> elite students.</span>
            </h2>
          </div>

          <div className="landing-testimonial-grid">
            {testimonials.map((testimonial, index) => (
              <article key={testimonial.name} className="landing-testimonial-card">
                <div className="landing-testimonial-card__stars">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star key={`${testimonial.name}-${starIndex}`} size={14} fill="currentColor" />
                  ))}
                </div>

                <blockquote>{testimonial.quote}</blockquote>

                <footer className="landing-testimonial-card__person">
                  <div className={`landing-testimonial-card__avatar landing-testimonial-card__avatar--${index + 1}`}>
                    {testimonial.name
                      .split(" ")
                      .map((chunk) => chunk[0])
                      .join("")}
                  </div>
                  <div>
                    <strong>{testimonial.name}</strong>
                    <span>{testimonial.meta}</span>
                  </div>
                </footer>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-cta">
          <div className="landing-cta__glow" />
          <p className="landing-kicker">Ready to outperform?</p>
          <h2>Join thousands of students who already transformed their academic workflow.</h2>
          <button className="landing-cta__button" onClick={() => focusAuth("register")}>
            <span>Get Started Free</span>
            <ArrowRight size={18} />
          </button>
        </section>

        <footer className="landing-footer">
          <div className="landing-footer__grid">
            {footerColumns.map((column) => (
              <div key={column.title} className="landing-footer__column">
                <strong>{column.title}</strong>
                {column.links.map((link) => (
                  <a key={link} href="#top">
                    {link}
                  </a>
                ))}
              </div>
            ))}
          </div>

          <div className="landing-footer__bottom">
            <div className="landing-brand">
              <div className="landing-brand__mark">
                <Grid2x2 size={16} />
              </div>
              <strong>StudyBuddy</strong>
            </div>
            <span>© 2026 StudyBuddy. All rights reserved.</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
