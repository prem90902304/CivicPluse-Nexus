import { api } from "../client";
import type { DashboardStats } from "./types";

export const analyticsService = {
  dashboard: () => api.get<DashboardStats>("/analytics/dashboard"),
  citizen: () => api.get<DashboardStats>("/analytics/citizen"),
  officer: () => api.get<DashboardStats>("/analytics/officer"),
  admin: () => api.get<DashboardStats>("/analytics/admin"),
};
