package com.civicpulse.nexus.controller;

import com.civicpulse.nexus.dto.request.CreateComplaintCommentRequest;
import com.civicpulse.nexus.dto.response.ApiResponse;
import com.civicpulse.nexus.dto.response.ComplaintCommentResponse;
import com.civicpulse.nexus.service.ComplaintCommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/complaints/{complaintId}/comments")
@RequiredArgsConstructor
public class ComplaintCommentController {

    private final ComplaintCommentService complaintCommentService;

    @GetMapping
    public ApiResponse<List<ComplaintCommentResponse>> getComments(
            @PathVariable Long complaintId) {

        return ApiResponse.success(
                "Comments fetched successfully",
                complaintCommentService.getComments(complaintId)
        );
    }

    @PostMapping
    public ApiResponse<ComplaintCommentResponse> addComment(
            @PathVariable Long complaintId,
            @Valid @RequestBody CreateComplaintCommentRequest request) {

        return ApiResponse.success(
                "Comment added successfully",
                complaintCommentService.addComment(complaintId, request)
        );
    }
}