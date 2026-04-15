import { Navigate, Outlet, createBrowserRouter } from "react-router-dom";

import AppShell from "@/layouts/AppShell";
import AuthPage from "@/pages/AuthPage";
import BuddyPage from "@/pages/BuddyPage";
import DashboardPage from "@/pages/DashboardPage";
import LibraryPage from "@/pages/LibraryPage";
import NotesPage from "@/pages/NotesPage";
import RemindersPage from "@/pages/RemindersPage";
import RoadmapPage from "@/pages/RoadmapPage";

const RootRedirect = () => <Navigate to="/dashboard" replace />;
const AppLayout = () => (
  <AppShell>
    <Outlet />
  </AppShell>
);

export const router = createBrowserRouter([
  {
    path: "/auth",
    element: <AuthPage />
  },
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <RootRedirect />
      },
      {
        path: "dashboard",
        element: <DashboardPage />
      },
      {
        path: "buddy",
        element: <BuddyPage />
      },
      {
        path: "notes",
        element: <NotesPage />
      },
      {
        path: "library",
        element: <LibraryPage />
      },
      {
        path: "reminders",
        element: <RemindersPage />
      },
      {
        path: "roadmap",
        element: <RoadmapPage />
      }
    ]
  }
]);
