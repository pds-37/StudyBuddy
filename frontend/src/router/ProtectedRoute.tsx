import { Navigate, Outlet } from "react-router-dom";
import { useAppStore } from "../store/app-store";

/** Guards authenticated routes using the JWT session stored in Zustand. */
export function ProtectedRoute() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}
