import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, MessageSquare, Send, CheckCircle2, ShieldCheck, MapPin, ExternalLink } from "lucide-react";

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "student",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-[#000000] px-6 py-16 text-slate-100 selection:bg-brand/35 selection:text-white">
      {/* Background Glowing Effects */}
      <div className="absolute top-0 left-1/3 h-[500px] w-[500px] rounded-full bg-brand/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 h-[500px] w-[500px] rounded-full bg-accent/5 blur-[150px] pointer-events-none" />

      <section className="mx-auto max-w-6xl relative z-10">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-all group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>

        <div className="mt-12 max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-light">
            <Mail size={14} className="animate-pulse" />
            Support Ecosystem
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl font-display bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
            Get in Touch
          </h1>
          <p className="mt-5 text-lg text-slate-400">
            Have questions about StudyBuddy for your college? Or need help compiling the C++ Sync client? Contact our placement coordinators and developers.
          </p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-5">
          {/* Contact Details Cards */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-white/[0.07] bg-[#07080a]/60 p-6 backdrop-blur-xl transition-all duration-300 hover:border-brand/30">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 font-display">
                <MessageSquare size={18} className="text-brand-light" />
                Community & Help
              </h3>
              <p className="mt-2.5 text-sm text-slate-400 leading-relaxed">
                Join our Discord workspace. Collaborate with 50,000+ SDE aspirants, share notes, and resolve roadmap bugs in real time.
              </p>
              <a 
                href="https://discord.gg/studybuddy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:text-brand-light transition-all"
              >
                Join Discord Workspace
                <ExternalLink size={12} />
              </a>
            </div>

            <div className="rounded-2xl border border-white/[0.07] bg-[#07080a]/60 p-6 backdrop-blur-xl transition-all duration-300 hover:border-brand/30">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 font-display">
                <ShieldCheck size={18} className="text-accent-light" />
                Campus Partnerships
              </h3>
              <p className="mt-2.5 text-sm text-slate-400 leading-relaxed">
                Interested in deploying StudyBuddy to your university placement cell or coding club? Get access to campus-wide intelligence tools.
              </p>
              <a 
                href="mailto:campus@studybuddy.ai" 
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-accent-light hover:text-accent transition-all"
              >
                Request College Portal
                <ExternalLink size={12} />
              </a>
            </div>

            <div className="rounded-2xl border border-white/[0.07] bg-[#07080a]/60 p-6 backdrop-blur-xl transition-all duration-300 hover:border-brand/30">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 font-display">
                <MapPin size={18} className="text-brand-light" />
                Headquarters
              </h3>
              <p className="mt-2.5 text-sm text-slate-400 leading-relaxed">
                StudyBuddy Labs, Inc.<br />
                Silicon Valley &amp; Bangalore, India
              </p>
            </div>
          </div>

          {/* Form Card */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-white/[0.07] bg-[#07080a]/80 p-8 backdrop-blur-2xl shadow-premium">
              {submitted ? (
                <div className="text-center py-12 animate-fade-in">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="mt-6 text-2xl font-bold font-display text-white">Transmission Received</h3>
                  <p className="mt-3 text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Thank you, **{formData.name}**. Our placement engineers will respond to **{formData.email}** within 12 hours.
                  </p>
                  <button 
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: "", email: "", role: "student", message: "" });
                    }}
                    className="mt-8 text-xs font-bold text-brand hover:text-brand-light transition-all"
                  >
                    Send another query
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Name</label>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Alice Smith"
                        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-brand/40 focus:bg-white/[0.04] transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="alice@university.edu"
                        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-brand/40 focus:bg-white/[0.04] transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Profile</label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {["student", "university", "recruiter"].map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setFormData({ ...formData, role })}
                          className={`rounded-xl py-3 text-xs font-bold uppercase tracking-wider border transition-all duration-200 ${
                            formData.role === role
                              ? "border-brand bg-brand/10 text-brand-light shadow-[0_0_15px_rgba(99,102,241,0.25)]"
                              : "border-white/[0.06] bg-white/[0.01] text-slate-400 hover:text-white"
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Message</label>
                    <textarea 
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Ask us anything about roadmaps, sync client compatibility, or subscription plans..."
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-brand/40 focus:bg-white/[0.04] transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.35)] transition-all duration-300 hover:bg-brand-dark hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:-translate-y-[2px]"
                  >
                    Submit Request
                    <Send size={15} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
