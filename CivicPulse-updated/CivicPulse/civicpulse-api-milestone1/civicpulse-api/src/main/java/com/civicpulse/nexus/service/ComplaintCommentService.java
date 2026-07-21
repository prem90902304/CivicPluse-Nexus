package com.civicpulse.nexus.service;

import com.civicpulse.nexus.dto.request.CreateComplaintCommentRequest;
import com.civicpulse.nexus.dto.response.ComplaintCommentResponse;

import java.util.List;

public interface ComplaintCommentService {

    List<ComplaintCommentResponse> getComments(Long complaintId);

    ComplaintCommentResponse addComment(
            Long complaintId,
            CreateComplaintCommentRequest request
    );
}