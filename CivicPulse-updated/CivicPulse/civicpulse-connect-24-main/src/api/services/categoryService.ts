import { api } from "../client";
import type { Category } from "./types";

export const categoryService = {
  list: (departmentId?: number) =>
    api.get<Category[]>("/categories", departmentId ? { departmentId } : undefined),
  get: (id: number) => api.get<Category>(`/categories/${id}`),
  create: (input: { name: string; code: string; departmentId: number; slaHours?: number }) =>
    api.post<Category>("/categories", input),
  update: (id: number, input: { name: string; code: string; slaHours?: number }) =>
    api.put<Category>(`/categories/${id}`, input),
  remove: (id: number) => api.delete<void>(`/categories/${id}`),
};
