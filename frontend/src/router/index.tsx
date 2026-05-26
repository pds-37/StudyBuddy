import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { MarketingLayout } from "../layouts/MarketingLayout";
import { Loader2 } from "lucide-react";
import { ProtectedRoute } from "./ProtectedRoute";

// Lazy-loaded pages
const AuthPage = lazy(() => import("../pages/AuthPage").then(m => ({ default: m.AuthPage })));
const CopilotPage = lazy(() => import("../pages/CopilotPage").then(m => ({ default: m.CopilotPage })));
const CompaniesPage = lazy(() => import("../pages/CompaniesPage").then(m => ({ default: m.CompaniesPage })));
const CompanyTypeDetailPage = lazy(() => import("../pages/CompanyTypeDetailPage").then(m => ({ default: m.CompanyTypeDetailPage })));
const DashboardPage = lazy(() => import("../pages/DashboardPage").then(m => ({ default: m.DashboardPage })));
const DemoPage = lazy(() => import("../pages/DemoPage").then(m => ({ default: m.DemoPage })));
const JobsPage = lazy(() => import("../pages/JobsPage").then(m => ({ default: m.JobsPage })));
const LandingPage = lazy(() => import("../pages/LandingPage").then(m => ({ default: m.LandingPage })));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage").then(m => ({ default: m.NotFoundPage })));
const NotesPage = lazy(() => import("../pages/NotesPage").then(m => ({ default: m.NotesPage })));
const OnboardingPage = lazy(() => import("../pages/OnboardingPage").then(m => ({ default: m.OnboardingPage })));
const ResumePage = lazy(() => import("../pages/ResumePage").then(m => ({ default: m.ResumePage })));
const RecallPage = lazy(() => import("../pages/RecallPage").then(m => ({ default: m.RecallPage })));
const RoadmapPage = lazy(() => import("../pages/RoadmapPage").then(m => ({ default: m.RoadmapPage })));
const SkillGapPage = lazy(() => import("../pages/SkillGapPage").then(m => ({ default: m.SkillGapPage })));
const InterviewPage = lazy(() => import("../pages/InterviewPage").then(m => ({ default: m.InterviewPage })));
const MentorshipPage = lazy(() => import("../pages/MentorshipPage").then(m => ({ default: m.MentorshipPage })));
const ProjectsPage = lazy(() => import("../pages/ProjectsPage").then(m => ({ default: m.ProjectsPage })));
const PricingPage = lazy(() => import("../pages/PricingPage").then(m => ({ default: m.PricingPage })));
const StudyPage = lazy(() => import("../pages/StudyPage").then(m => ({ default: m.StudyPage })));
const KnowledgePage = lazy(() => import("../pages/KnowledgePage").then(m => ({ default: m.KnowledgePage })));
const SettingsPage = lazy(() => import("../pages/SettingsPage").then(m => ({ default: m.SettingsPage })));
const FocusPage = lazy(() => import("../pages/FocusPage").then(m => ({ default: m.FocusPage })));


function PageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-transparent bg-obsidian bg-transparent bg-obsidian$4">
      <Loader2 className="h-8 w-8 animate-spin text-brand" />
    </div>
  );
}


/** Defines the app route skeleton before feature implementation begins. */
export function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<MarketingLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/demo" element={<DemoPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/skill-gap" element={<SkillGapPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/recall" element={<RecallPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/companies" element={<CompaniesPage />} />
            <Route path="/companies/:companyTypeId" element={<CompanyTypeDetailPage />} />
            <Route path="/resume" element={<ResumePage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/focus" element={<FocusPage />} />
            <Route path="/copilot" element={<CopilotPage />} />
            <Route path="/interview" element={<InterviewPage />} />
            <Route path="/mentorship" element={<MentorshipPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/study/:taskId" element={<StudyPage />} />
             <Route path="/knowledge" element={<KnowledgePage />} />
             <Route path="/settings" element={<SettingsPage />} />
             <Route path="/dashboard" element={<DashboardPage />} />

          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
