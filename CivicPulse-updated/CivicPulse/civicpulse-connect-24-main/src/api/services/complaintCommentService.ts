import { api } from "@/api/client";

export interface ComplaintComment {
  id: number;
  authorName: string;
  authorRole: string;
  message: string;
  createdAt: string;
}

export interface CreateComplaintCommentRequest {
  message: string;
}

export const complaintCommentService = {
  getComments: (complaintId: number) =>
    api.get<ComplaintComment[]>(`/complaints/${complaintId}/comments`),

  addComment: (complaintId: number, data: CreateComplaintCommentRequest) =>
    api.post<ComplaintComment>(`/complaints/${complaintId}/comments`, data),
};
