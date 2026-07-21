import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { Loading } from "@/components/app/Loading";

export const Route = createFileRoute("/")({
  component: IndexRedirect,
});

function IndexRedirect() {
  const { user, isHydrated } = useAuth();
  if (!isHydrated) return <Loading />;
  if (!user) return <Navigate to="/login" />;
  if (user.role === "ADMIN") return <Navigate to="/admin/dashboard" />;
  if (user.role === "OFFICER") return <Navigate to="/officer/dashboard" />;
  return <Navigate to="/dashboard" />;
}
