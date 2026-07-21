import { api } from "../client";
import type { Officer } from "./types";

export const officerService = {
  list: (departmentId?: number) =>
    api.get<Officer[]>("/officers", departmentId ? { departmentId } : undefined),
  get: (id: number) => api.get<Officer>(`/officers/${id}`),
  create: (input: {
    fullName: string;
    email: string;
    phone: string;
    departmentId: number;
    password: string;
  }) => api.post<Officer>("/officers", input),
  update: (id: number, input: { fullName: string; phone: string; departmentId: number }) =>
    api.put<Officer>(`/officers/${id}`, input),
  remove: (id: number) => api.delete<void>(`/officers/${id}`),

  changePassword: (id: number, data: { newPassword: string }) =>
    api.patch(`/officers/${id}/password`, data),

  setEnabled: (id: number, enabled: boolean) =>
    api.patch<Officer>(`/officers/${id}/enabled?enabled=${enabled}`),
};
