import { api } from "../client";
import type {
  Complaint,
  ComplaintComment,
  ComplaintPriority,
  ComplaintStatus,
  ComplaintTimelineEntry,
  Paginated,
} from "./types";

export interface ComplaintListParams extends Record<
  string,
  string | number | boolean | undefined | null
> {
  page?: number;
  size?: number;
  search?: string;
  status?: ComplaintStatus | "";
  priority?: ComplaintPriority | "";
  departmentId?: number | "";
  categoryId?: number | "";
  sort?: string;
}

export interface CreateComplaintInput {
  title: string;
  description: string;
  location: string;
  departmentId: number;
  categoryId: number;
  priority: ComplaintPriority;
  imageUrls?: string[];
}
const statusMap: Record<string, ComplaintStatus> = {
  NEW: "NEW",
  PENDING: "PENDING",
  ASSIGNED: "ASSIGNED",
  IN_PROGRESS: "IN_PROGRESS",
  ESCALATED: "ESCALATED",
  RESOLVED: "RESOLVED",
  REJECTED: "REJECTED",
  CLOSED: "CLOSED",
};

const backendStatusMap: Record<string, string> = {
  NEW: "NEW",
  PENDING: "PENDING",
  ASSIGNED: "ASSIGNED",
  IN_PROGRESS: "IN_PROGRESS",
  ESCALATED: "ESCALATED",
  RESOLVED: "RESOLVED",
  REJECTED: "REJECTED",
  CLOSED: "CLOSED",
};

export const complaintService = {
  list: async (params: ComplaintListParams = {}): Promise<Paginated<Complaint>> => {
    const complaints =
      await api.get<Array<Complaint & { complaintNumber?: string }>>("/complaints");

    const searchText = params.search?.trim().toLowerCase() ?? "";
    const normalizedComplaints = complaints
      .map((complaint) => ({
        ...complaint,
        status: statusMap[complaint.status] ?? complaint.status,
        referenceNumber: complaint.referenceNumber ?? complaint.complaintNumber ?? "",
      }))
      .filter((complaint) => {
        const matchesSearch =
          !searchText ||
          complaint.title.toLowerCase().includes(searchText) ||
          complaint.referenceNumber.toLowerCase().includes(searchText) ||
          complaint.citizenName?.toLowerCase().includes(searchText) ||
          complaint.departmentName?.toLowerCase().includes(searchText) ||
          complaint.categoryName?.toLowerCase().includes(searchText);

        const matchesStatus = !params.status || complaint.status === params.status;
        const matchesPriority = !params.priority || complaint.priority === params.priority;

        return matchesSearch && matchesStatus && matchesPriority;
      });

    const page = params.page ?? 0;
    const size = params.size ?? 15;
    const start = page * size;

    return {
      items: normalizedComplaints.slice(start, start + size),
      total: normalizedComplaints.length,
      page,
      size,
    };
  },
  mine: async (params: ComplaintListParams = {}): Promise<Paginated<Complaint>> => {
    const complaints =
      await api.get<Array<Complaint & { complaintNumber?: string }>>("/complaints/my");

    const normalizedComplaints: Complaint[] = complaints.map((complaint) => ({
      ...complaint,
      status: statusMap[complaint.status] ?? complaint.status,
      referenceNumber: complaint.referenceNumber ?? complaint.complaintNumber ?? "",
    }));

    const page = params.page ?? 0;
    const size = params.size ?? 10;
    const start = page * size;

    return {
      items: normalizedComplaints.slice(start, start + size),
      total: normalizedComplaints.length,
      page,
      size,
    };
  },
  assigned: async (params: ComplaintListParams = {}): Promise<Paginated<Complaint>> => {
    const complaints =
      await api.get<Array<Complaint & { complaintNumber?: string }>>("/complaints/assigned");

    const searchText = params.search?.trim().toLowerCase() ?? "";

    const filteredComplaints = complaints
      .map((complaint) => ({
        ...complaint,
        referenceNumber: complaint.referenceNumber ?? complaint.complaintNumber ?? "",
      }))
      .filter((complaint) => {
        const matchesSearch =
          !searchText ||
          complaint.title.toLowerCase().includes(searchText) ||
          complaint.referenceNumber.toLowerCase().includes(searchText) ||
          complaint.citizenName?.toLowerCase().includes(searchText);

        const matchesStatus = !params.status || complaint.status === params.status;

        return matchesSearch && matchesStatus;
      });

    const page = params.page ?? 0;
    const size = params.size ?? 15;
    const start = page * size;

    return {
      items: filteredComplaints.slice(start, start + size),
      total: filteredComplaints.length,
      page,
      size,
    };
  },
  timeline: (id: number) => api.get<ComplaintTimelineEntry[]>(`/complaints/${id}/timeline`),
  deleteComplaint: (id: number) => api.delete(`/complaints/${id}`),
  comments: (id: number) => api.get<ComplaintComment[]>(`/complaints/${id}/comments`),
  addComment: (id: number, message: string) =>
    api.post<ComplaintComment>(`/complaints/${id}/comments`, { message }),
  create: async (input: CreateComplaintInput): Promise<Complaint> => {
    const complaint = await api.post<Complaint & { complaintNumber?: string }>(
      "/complaints",
      input,
    );

    return {
      ...complaint,
      referenceNumber: complaint.referenceNumber ?? complaint.complaintNumber ?? "",
    };
  },
  updateStatus: (id: number, data: string | Record<string, unknown>) => {
    const status = typeof data === "string" ? data : String(data.status ?? "");

    const requestData = {
      ...(typeof data === "string" ? {} : data),
      status: backendStatusMap[status] ?? status,
    };

    return api.put<Complaint>(`/complaints/${id}/status`, requestData);
  },

  get: async (id: number): Promise<Complaint> => {
    const complaint = await api.get<Complaint & { complaintNumber?: string }>(`/complaints/${id}`);

    return {
      ...complaint,
      referenceNumber: complaint.referenceNumber ?? complaint.complaintNumber ?? "",
    };
  },

  assign: (id: number, officerId: number) =>
    api.put<Complaint>(`/complaints/${id}/assign`, { officerId }),

  uploadImage: (file: File) => {
    const form = new FormData();
    form.append("file", file);

    return api.upload<{ url: string }>("/uploads", form);
  },
};
