import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/app-store';
import { NeuralConstellation3D } from '../components/common/NeuralConstellation3D';
import './LandingPage.css';

export function LandingPage() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const startPath = isAuthenticated ? '/dashboard' : '/auth';

  // Custom Cursor Logic
  useEffect(() => {
    const c1 = document.getElementById('cur');
    const c2 = document.getElementById('cur2');
    if (!c1 || !c2) return;

    let x = 0, y = 0, x2 = 0, y2 = 0;
    let animationFrameId: number;

    const onMouseMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
    };
    
    const onMouseLeave = () => {
      c1.style.opacity = '0';
      c2.style.opacity = '0';
    };
    
    const onMouseEnter = () => {
      c1.style.opacity = '1';
      c2.style.opacity = '1';
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    const loop = () => {
      c1.style.left = x + 'px';
      c1.style.top = y + 'px';
      x2 += (x - x2) * 0.14;
      y2 += (y - y2) * 0.14;
      c2.style.left = x2 + 'px';
      c2.style.top = y2 + 'px';
      animationFrameId = requestAnimationFrame(loop);
    };
    loop();

    const hoverElements = document.querySelectorAll('button, a, .fc');
    const onHoverEnter = () => {
      c1.style.transform = 'translate(-50%,-50%) scale(1.8)';
      c2.style.transform = 'translate(-50%,-50%) scale(0.5)';
    };
    const onHoverLeave = () => {
      c1.style.transform = 'translate(-50%,-50%) scale(1)';
      c2.style.transform = 'translate(-50%,-50%) scale(1)';
    };

    hoverElements.forEach((el) => {
      el.addEventListener('mouseenter', onHoverEnter);
      el.addEventListener('mouseleave', onHoverLeave);
    });

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      hoverElements.forEach((el) => {
        el.removeEventListener('mouseenter', onHoverEnter);
        el.removeEventListener('mouseleave', onHoverLeave);
      });
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Scroll Reveal Logic
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('in'), i * 60);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    
    return () => obs.disconnect();
  }, []);

  // Card 3D Tilt Logic
  const card3dWrapRef = useRef<HTMLDivElement>(null);
  const card3dRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = card3dWrapRef.current;
    const card = card3dRef.current;
    if (!wrap || !card) return;

    const onMouseMove = (e: MouseEvent) => {
      const rect = wrap.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      
      // Increased the multiplier for a more dramatic tilt
      card.style.transform = `rotateX(${-dy * 16}deg) rotateY(${dx * 20}deg) scale3d(1.02, 1.02, 1.02)`;
      
      // Enhanced dynamic shadow with a more vibrant glow
      card.style.boxShadow = `${-dx * 30}px ${-dy * 30}px 90px rgba(0,0,0,0.8),
        0 0 0 1px rgba(255,255,255,0.08),
        ${dx * 12}px ${dy * 12}px 50px rgba(109,94,245,0.25)`;
    };

    const onMouseLeave = () => {
      // More pronounced resting angle
      card.style.transform = 'rotateX(8deg) rotateY(-12deg) scale3d(1, 1, 1)';
      card.style.boxShadow = '0 50px 120px rgba(0,0,0,0.8),0 0 0 1px rgba(255,255,255,0.05)';
    };

    wrap.addEventListener('mousemove', onMouseMove);
    wrap.addEventListener('mouseleave', onMouseLeave);

    return () => {
      wrap.removeEventListener('mousemove', onMouseMove);
      wrap.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  // Feature Card Tilt Logic
  useEffect(() => {
    const fcs = document.querySelectorAll<HTMLDivElement>('.fc');
    
    const onMouseMove = (e: MouseEvent) => {
      const card = e.currentTarget as HTMLDivElement;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) / (r.width / 2);
      const y = (e.clientY - r.top - r.height / 2) / (r.height / 2);
      card.style.transform = `perspective(600px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
    };

    const onMouseLeave = (e: MouseEvent) => {
      const card = e.currentTarget as HTMLDivElement;
      card.style.transform = 'perspective(600px) rotateX(0) rotateY(0)';
    };

    fcs.forEach(card => {
      card.addEventListener('mousemove', onMouseMove);
      card.addEventListener('mouseleave', onMouseLeave);
    });

    return () => {
      fcs.forEach(card => {
        card.removeEventListener('mousemove', onMouseMove);
        card.removeEventListener('mouseleave', onMouseLeave);
      });
    };
  }, []);

  // Carousel Drag Scrolling Logic
  const carouselRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const slider = carouselRef.current;
    if (!slider) return;
    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    const onMouseDown = (e: MouseEvent) => {
      isDown = true;
      slider.style.scrollSnapType = 'none'; // disable snap while dragging
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    };
    const onMouseLeave = () => {
      isDown = false;
      slider.style.scrollSnapType = 'x mandatory';
    };
    const onMouseUp = () => {
      isDown = false;
      slider.style.scrollSnapType = 'x mandatory';
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2; // scroll-fast
      slider.scrollLeft = scrollLeft - walk;
    };

    slider.addEventListener('mousedown', onMouseDown);
    slider.addEventListener('mouseleave', onMouseLeave);
    slider.addEventListener('mouseup', onMouseUp);
    slider.addEventListener('mousemove', onMouseMove);

    return () => {
      slider.removeEventListener('mousedown', onMouseDown);
      slider.removeEventListener('mouseleave', onMouseLeave);
      slider.removeEventListener('mouseup', onMouseUp);
      slider.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  // Nav Scroll Style
  useEffect(() => {
    const nav = document.querySelector('nav');
    if (!nav) return;
    
    const onScroll = () => {
      nav.style.borderBottomColor = window.scrollY > 30
        ? 'rgba(255,255,255,0.09)' 
        : 'rgba(255,255,255,0.06)';
    };
    
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="landing-page">
      {/* custom cursors */}
      <div id="cur"></div>
      <div id="cur2"></div>

      {/* NAV */}
      <nav>
        <Link to="/" className="flex items-center">
          <img src="/brand/studybuddy-logo.png" alt="StudyBuddy Logo" className="h-10 w-auto object-contain" />
        </Link>
        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#">Roadmaps</a></li>
          <li><a href="#">For Students</a></li>
          <li><a href="#">Pricing</a></li>
          <li><a href="#">Blog</a></li>
          <li><a href="#">About</a></li>
        </ul>
        <div className="nav-r">
          <Link to="/demo" className="btn-ghost" style={{textDecoration:'none'}}>Demo</Link>
          <Link to="/auth" className="btn-ghost" style={{textDecoration:'none'}}>Log in</Link>
          <Link to={startPath} className="btn-nav" style={{textDecoration:'none'}}>Get Started Free →</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-l">
          <div className="badge"><div className="badge-dot"></div>Desktop App Experience</div>

          <h1>
            Your ultimate<br />
            <span className="italic-serif">Academic Weapon</span>
          </h1>

          <p className="hero-sub">
            Execute your placement roadmap flawlessly. A unified, native-feeling workspace for your coding, notes, and technical interviews.
          </p>

          <ul className="feat-pills">
            <li className="feat-pill">
              <div className="pill-icon">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6d5ef5" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
              </div>
              Distraction-free focus modes
            </li>
            <li className="feat-pill">
              <div className="pill-icon">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6d5ef5" strokeWidth="2"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
              </div>
              Integrated coding environments
            </li>
            <li className="feat-pill">
              <div className="pill-icon">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6d5ef5" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" /></svg>
              </div>
              AI-powered career insights via Veda
            </li>
          </ul>

          <div className="ctas">
            <Link to={startPath} className="btn-primary" style={{textDecoration:'none', display:'inline-block'}}>Start Your Journey Free</Link>
            <button className="btn-sec">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              Explore Features
            </button>
          </div>

          <div className="testimonial">
            <p className="t-quote">"StudyBuddy completely replaced my messy spreadsheets and random notion pages. It feels like a high-end native app built just for my placements."</p>
            <div className="t-author">
              <div className="t-av">MR</div>
              <div>
                <div className="t-name">Mr. Pds</div>
                <div className="t-role">SDE at Tech</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3D RIGHT */}
        <NeuralConstellation3D />
      </section>

      {/* STATS */}
      <div className="stats">
        <div className="stat reveal">
          <div className="stat-n" id="sn1">50<span>K+</span></div>
          <div className="stat-l">Active Learners</div>
        </div>
        <div className="stat reveal">
          <div className="stat-n" id="sn2">200<span>K+</span></div>
          <div className="stat-l">Notes Synced</div>
        </div>
        <div className="stat reveal">
          <div className="stat-n" id="sn3">10<span>K+</span></div>
          <div className="stat-l">Roadmaps Generated</div>
        </div>
        <div className="stat reveal">
          <div className="stat-n" id="sn4">4.9<span>/5 ★</span></div>
          <div className="stat-l">Average Rating</div>
        </div>
      </div>

      {/* FEATURES */}
      <div id="features" className="section">
        <div className="eye reveal">Everything you need</div>
        <h2 className="sec-title reveal">Learn, build &amp; grow<br /><em>all in one place</em></h2>
        <p className="sec-sub reveal">An all-in-one platform designed to adapt to you — your pace, your goals, your career.</p>

        <div className="feat-carousel reveal" ref={carouselRef}>
          <div className="fc">
            <div className="fc-ico">🗺️</div>
            <div className="fc-t">AI Roadmaps</div>
            <p className="fc-d">Personalized, adaptive roadmaps that evolve with your progress and adjust to your learning pace automatically.</p>
            <a href="#" className="fc-link">Learn more →</a>
          </div>
          <div className="fc">
            <div className="fc-ico">📝</div>
            <div className="fc-t">Smart Notes</div>
            <p className="fc-d">AI-enhanced notes with recall linking and a live knowledge graph — never lose a concept again.</p>
            <a href="#" className="fc-link">Learn more →</a>
          </div>
          <div className="fc">
            <div className="fc-ico">🧠</div>
            <div className="fc-t">Recall System</div>
            <p className="fc-d">Active recall and spaced repetition to make learning stick forever — scientifically proven methods.</p>
            <a href="#" className="fc-link">Learn more →</a>
          </div>
          <div className="fc">
            <div className="fc-ico">🤖</div>
            <div className="fc-t">AI Mentor (Veda)</div>
            <p className="fc-d">Get instant help, clarity and guidance from Veda AI — your personal, always-available career advisor.</p>
            <a href="#" className="fc-link">Learn more →</a>
          </div>
          <div className="fc">
            <div className="fc-ico">📄</div>
            <div className="fc-t">Resume Builder</div>
            <p className="fc-d">AI-powered resume optimization tailored to each role with ATS scoring and one-click adaptation.</p>
            <a href="#" className="fc-link">Learn more →</a>
          </div>
          <div className="fc">
            <div className="fc-ico">💼</div>
            <div className="fc-t">Job Matcher</div>
            <p className="fc-d">Find the right opportunities that match your skills and career goals with real-time job matching.</p>
            <a href="#" className="fc-link">Learn more →</a>
          </div>
        </div>
      </div>

      {/* 3D CARD SECTION */}
      <div className="card3d-section">
        <div className="card3d-wrap reveal" ref={card3dWrapRef}>
          <div className="card3d" ref={card3dRef}>
            <div className="chrome">
              <div className="d dr"></div><div className="d dy"></div><div className="d dg"></div>
              <div className="chrome-title">StudyBuddy · Dashboard</div>
            </div>
            <div className="dash">
              <div className="row2">
                <div className="dc">
                  <div className="dc-label">Frontend Roadmap</div>
                  <div className="dc-val pu">92%</div>
                  <div className="dc-bar"><div className="dc-fill fill-p" style={{width: '92%'}}></div></div>
                </div>
                <div className="dc">
                  <div className="dc-label">Interview Ready</div>
                  <div className="dc-val gr">88%</div>
                  <div className="dc-bar"><div className="dc-fill fill-g" style={{width: '88%'}}></div></div>
                </div>
              </div>
              <div className="dc-tasks">
                <div className="dc-tasks-label">Today's Focus</div>
                <div className="task"><div className="tc done">✓</div>System Design Mock Interview</div>
                <div className="task"><div className="tc done">✓</div>Revise React Hooks Internals</div>
                <div className="task"><div className="tc"></div>Complete Next.js Capstone</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card3d-right reveal">
          <div className="eye">Your progress dashboard</div>
          <h3>Track every step of<br /><em>your journey</em></h3>
          <p>A beautiful, native-feeling dashboard that shows your roadmap health, daily targets, recall scores, and career readiness — all in one view.</p>
          <div className="mini-stats">
            <div className="ms">
              <div className="ms-n">12<em>d</em></div>
              <div className="ms-l">Current streak</div>
            </div>
            <div className="ms">
              <div className="ms-n">4<em>/6</em></div>
              <div className="ms-l">Lessons today</div>
            </div>
            <div className="ms">
              <div className="ms-n">68<em>%</em></div>
              <div className="ms-l">Career ready</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="cta-wrap">
        <div className="eye reveal">Get started today</div>
        <h2 className="cta-title reveal">Your career OS<br />is <em>waiting for you</em></h2>
        <p className="cta-sub reveal">Join 50,000+ students who are building their future with StudyBuddy.</p>
        <div className="cta-btns reveal">
          <Link to={startPath} className="btn-cta-p" style={{textDecoration:'none'}}>Start for Free →</Link>
          <Link to="/demo" className="btn-cta-s" style={{textDecoration:'none'}}>✦ Try Recruiter Demo</Link>
        </div>
      </div>

      {/* FOOTER */}
      <footer>
        <a href="#" className="logo" style={{textDecoration:'none', color:'var(--t1)'}}>
          <div className="logo-box">⚡</div>StudyBuddy
        </a>
        <div className="f-links">
          <a href="#">Privacy</a><a href="#">Terms</a><a href="#">Blog</a><a href="#">Contact</a>
        </div>
        <div className="f-copy">© 2026 StudyBuddy · Powered by Veda AI</div>
      </footer>
    </div>
  );
}
