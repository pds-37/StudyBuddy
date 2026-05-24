import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, GraduationCap, ShieldCheck, Sparkles, Users } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "₹0",
    icon: GraduationCap,
    description: "For trying the placement workflow.",
    features: ["Daily mentor plan", "250 notes tracked", "100 AI messages/month", "2 projects"]
  },
  {
    name: "Pro Student",
    price: "₹299/mo",
    icon: Sparkles,
    featured: true,
    description: "For serious placement preparation.",
    features: ["2,000 AI messages/month", "10,000 notes tracked", "50 projects", "Resume and interview intelligence"]
  },
  {
    name: "Campus",
    price: "Custom",
    icon: Users,
    description: "For cohorts, clubs, and placement cells.",
    features: ["Team dashboards", "Campus readiness signals", "Mentor workflows", "Cohort analytics"]
  }
];

export function PricingPage() {
  return (
    <main className="min-h-screen bg-[#05070a] px-6 py-16 text-slate-100">
      <section className="mx-auto max-w-6xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition hover:text-white">
          StudyBuddy
        </Link>

        <div className="mt-14 max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#ca8af7]/25 bg-[#ca8af7]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#ca8af7]">
            <ShieldCheck size={14} />
            Premium student SaaS
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Pricing that scales from one student to a whole placement cell.</h1>
          <p className="mt-5 text-base leading-7 text-slate-400">
            Start free, then upgrade when your AI usage, notes, projects, and placement workflow need more room.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`rounded-lg border p-6 ${
                plan.featured
                  ? "border-[#ca8af7]/40 bg-[#120d1c] shadow-[0_20px_80px_-30px_rgba(202,138,247,0.55)]"
                  : "border-white/10 bg-[#0c1017]"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
                  <plan.icon size={20} className={plan.featured ? "text-[#ca8af7]" : "text-[#28b0f3]"} />
                </div>
                {plan.featured && (
                  <span className="rounded-full bg-[#ca8af7] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                    Recommended
                  </span>
                )}
              </div>
              <h2 className="mt-6 text-2xl font-black">{plan.name}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{plan.description}</p>
              <p className="mt-6 text-4xl font-black">{plan.price}</p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2ec4a0]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                to={plan.featured ? "/auth" : plan.name === "Campus" ? "/demo" : "/auth"}
                className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold transition ${
                  plan.featured ? "bg-[#ca8af7] text-white hover:bg-[#d9a9fb]" : "border border-white/10 text-slate-200 hover:bg-white/[0.05]"
                }`}
              >
                {plan.name === "Campus" ? "View demo" : "Start now"}
                <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
