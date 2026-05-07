import { MentorshipDashboard } from "../features/mentorship/components/MentorshipDashboard";

export function MentorshipPage() {
  return (
    <section className="space-y-10 max-w-[1200px] mx-auto pb-12 pt-4">

      <div className="py-6 border-b border-white/[0.04]">
        <h1 className="text-3xl tracking-tight font-medium text-white">Mentorship</h1>
        <p className="mt-2 text-sm text-[#888888]">Find industry professionals for your target role.</p>
      </div>
      <MentorshipDashboard />
    </section>
  );
}
