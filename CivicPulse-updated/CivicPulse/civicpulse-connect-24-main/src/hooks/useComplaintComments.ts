import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  complaintCommentService,
  type CreateComplaintCommentRequest,
} from "@/api/services/complaintCommentService";

export const complaintCommentKeys = {
  all: ["complaint-comments"] as const,
  list: (complaintId: number) => [...complaintCommentKeys.all, complaintId] as const,
};

export function useComplaintComments(complaintId?: number) {
  return useQuery({
    queryKey: complaintCommentKeys.list(complaintId ?? 0),
    queryFn: () => complaintCommentService.getComments(complaintId!),
    enabled: Boolean(complaintId),
  });
}

export function useAddComplaintComment(complaintId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateComplaintCommentRequest) =>
      complaintCommentService.addComment(complaintId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: complaintCommentKeys.list(complaintId),
      });
    },
  });
}
