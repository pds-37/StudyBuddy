import { MentorshipDashboard } from "../features/mentorship/components/MentorshipDashboard";

export function MentorshipPage() {
  return (
    <section className="space-y-6 max-w-5xl mx-auto">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.38em] text-brand">Connect</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Mentorship Matching</h1>
        <p className="mt-2 text-slate-400">Our AI analyzes your skill gaps to connect you with industry professionals who can guide your career.</p>
      </div>
      <MentorshipDashboard />
    </section>
  );
}
