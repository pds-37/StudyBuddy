import { Route, Routes } from "react-router-dom";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { MarketingLayout } from "../layouts/MarketingLayout";
import { AuthPage } from "../pages/AuthPage";
import { CopilotPage } from "../pages/CopilotPage";
import { DashboardPage } from "../pages/DashboardPage";
import { JobsPage } from "../pages/JobsPage";
import { LandingPage } from "../pages/LandingPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { NotesPage } from "../pages/NotesPage";
import { OnboardingPage } from "../pages/OnboardingPage";
import { ResumePage } from "../pages/ResumePage";
import { RoadmapPage } from "../pages/RoadmapPage";
import { SkillGapPage } from "../pages/SkillGapPage";
import { InterviewPage } from "../pages/InterviewPage";
import { MentorshipPage } from "../pages/MentorshipPage";
import { ProjectsPage } from "../pages/ProjectsPage";
import { ProtectedRoute } from "./ProtectedRoute";

/** Defines the app route skeleton before feature implementation begins. */
export function AppRouter() {
  return (
    <Routes>
      <Route element={<MarketingLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/skill-gap" element={<SkillGapPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/copilot" element={<CopilotPage />} />
          <Route path="/interview" element={<InterviewPage />} />
          <Route path="/mentorship" element={<MentorshipPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
