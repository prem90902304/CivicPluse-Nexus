import { api } from "../client";
import type { Department } from "./types";

export const departmentService = {
  list: () => api.get<Department[]>("/departments"),
  get: (id: number) => api.get<Department>(`/departments/${id}`),
  create: (input: { name: string; code: string }) => api.post<Department>("/departments", input),
  update: (id: number, input: { name: string; code: string }) =>
    api.put<Department>(`/departments/${id}`, input),
  remove: (id: number) => api.delete<void>(`/departments/${id}`),
};
