import { InterviewWorkspace } from "../features/interview/components/InterviewWorkspace";

export function InterviewPage() {
  return (
    <section className="space-y-6 max-w-[1200px] mx-auto pb-10">
      <div className="py-6 border-b border-white/[0.04]">
        <h1 className="text-3xl tracking-tight font-medium text-white text-white text-white">Interview</h1>
        <p className="mt-2 text-sm text-[#888888]">AI-driven mock interviews for your role.</p>
      </div>
      <InterviewWorkspace />
    </section>
  );
}
