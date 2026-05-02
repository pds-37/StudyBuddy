import { FilePenLine, ScanSearch, Sparkles } from "lucide-react";
import { ResumeTailorWorkspace } from "../features/resume/components/ResumeTailorWorkspace";

/** Shows the AI resume tailoring workspace. */
export function ResumePage() {
  return (
    <section className="space-y-6 max-w-[1200px] mx-auto pb-10">
      <div className="flex items-end justify-between py-6 border-b border-white/[0.04]">
        <div>
          <h1 className="text-3xl tracking-tight font-medium text-white">
            Resume Tailor
          </h1>
          <p className="mt-2 text-sm text-[#888888]">
            Optimize your resume for specific job roles.
          </p>
        </div>
      </div>

      <ResumeTailorWorkspace />
    </section>
  );
}

