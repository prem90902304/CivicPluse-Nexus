import { createFileRoute, Navigate, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Loading } from "@/components/app/Loading";
import type { UserRole } from "@/api/services/types";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, isHydrated, role } = useAuth();
  const location = useLocation();

  if (!isHydrated) return <Loading label="Loading session…" />;
  if (!user) return <Navigate to="/login" search={{ redirect: location.pathname }} />;

  // Role-based route protection
  const path = location.pathname;
  const requires = (needle: string, roles: UserRole[]) =>
    path.startsWith(needle) && !roles.includes(role as UserRole);
  if (requires("/admin", ["ADMIN"])) return <Navigate to="/dashboard" />;
  if (requires("/officer", ["OFFICER", "ADMIN"])) return <Navigate to="/dashboard" />;

  return <DashboardLayout />;
}
