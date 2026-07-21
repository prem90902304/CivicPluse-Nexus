import { API_BASE_URL, ApiError, api, tokenStore } from "../client";
import type { ApplicationStatus, DocumentType, ServiceApplication, ServiceType } from "./types";

export interface ApplyServiceInput {
  citizenId: number;
  serviceType: ServiceType;
  applicantName: string;
  aadhaarNumber: string;
}

export const serviceApplicationService = {
  apply: (input: ApplyServiceInput) => api.post<ServiceApplication>("/services/apply", input),
  mine: (citizenId: number) => api.get<ServiceApplication[]>(`/services/citizen/${citizenId}`),
  get: (id: number) => api.get<ServiceApplication>(`/services/${id}`),
  all: () => api.get<ServiceApplication[]>("/services"),
  byStatus: (status: ApplicationStatus) =>
    api.get<ServiceApplication[]>(`/services/status/${status}`),
  byType: (type: ServiceType) => api.get<ServiceApplication[]>(`/services/type/${type}`),
  uploadDocument: (id: number, file: File, documentType: DocumentType) => {
    const form = new FormData();
    form.append("file", file);
    form.append("documentType", documentType);
    return api.upload<ServiceApplication>(`/services/${id}/documents`, form);
  },
  verify: (id: number, officerId: number, verified = true) =>
    api.put<ServiceApplication>(`/services/verify/${id}`, { officerId, verified }),
  approve: (id: number, officerId: number) =>
    api.put<ServiceApplication>(`/services/approve/${id}`, { officerId, verified: true }),
  reject: (id: number, officerId: number, reason: string) =>
    api.put<ServiceApplication>(`/services/reject/${id}`, { officerId, reason }),
  requestDocuments: (id: number, officerId: number, message: string) =>
    api.put<ServiceApplication>(`/services/documents-required/${id}`, { officerId, message }),
  deleteRejected: (id: number) => api.delete<void>(`/services/${id}`),
  generateCertificate: (id: number) =>
    api.put<ServiceApplication>(`/services/${id}/certificate/generate`),
  download: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/services/download/${id}`, {
      headers: tokenStore.access ? { Authorization: `Bearer ${tokenStore.access}` } : {},
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      const message =
        payload && typeof payload === "object" && "message" in payload
          ? String((payload as { message: unknown }).message)
          : "Certificate download failed";
      throw new ApiError(message, response.status, payload);
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `civicpulse-certificate-${id}.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
  },
};
