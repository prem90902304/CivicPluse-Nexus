package com.civicpulse.nexus.controller;

import com.civicpulse.nexus.dto.request.ComplaintAssignRequest;
import com.civicpulse.nexus.dto.request.ComplaintStatusUpdateRequest;
import com.civicpulse.nexus.dto.request.CreateComplaintRequest;
import com.civicpulse.nexus.dto.response.ApiResponse;
import com.civicpulse.nexus.dto.response.ComplaintResponse;
import com.civicpulse.nexus.service.ComplaintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import com.civicpulse.nexus.dto.response.ComplaintTimelineResponse;
import com.civicpulse.nexus.service.ComplaintTimelineService;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.security.access.prepost.PreAuthorize;
@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;
    private final ComplaintTimelineService complaintTimelineService;

    @PostMapping
    public ApiResponse<ComplaintResponse> create(
            @Valid @RequestBody CreateComplaintRequest request) {

        System.out.println("IMAGE URLS RECEIVED: " + request.getImageUrls());

        return ApiResponse.success(
                "Complaint submitted successfully",
                complaintService.create(request)
        );
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or (hasRole('OFFICER') and @municipalOfficerAccess.isMunicipalOfficer(authentication))")
    public ApiResponse<List<ComplaintResponse>> getAllComplaints() {

        return ApiResponse.success(
                "Complaints fetched successfully",
                complaintService.getAllComplaints()
        );
    }

    @GetMapping("/{id}")
    public ApiResponse<ComplaintResponse> getById(
            @PathVariable Long id) {

        return ApiResponse.success(
                "Complaint fetched successfully",
                complaintService.getById(id)
        );
    }

    @GetMapping("/my")
    public ApiResponse<List<ComplaintResponse>> myComplaints() {

        return ApiResponse.success(
                "Complaints fetched successfully",
                complaintService.getMyComplaints()
        );
    }

    @GetMapping("/assigned")
    public ApiResponse<List<ComplaintResponse>> assignedComplaints() {

        return ApiResponse.success(
                "Assigned complaints fetched successfully",
                complaintService.getAssignedComplaints()
        );
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'OFFICER')")
    public ApiResponse<ComplaintResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody ComplaintStatusUpdateRequest request) {

        return ApiResponse.success(
                "Complaint status updated successfully",
                complaintService.updateStatus(id, request)
        );
    }
    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('OFFICER') and @municipalOfficerAccess.isMunicipalOfficer(authentication))")
    public ApiResponse<ComplaintResponse> assignOfficer(
            @PathVariable Long id,
            @Valid @RequestBody ComplaintAssignRequest request) {

        return ApiResponse.success(
                "Officer assigned successfully",
                complaintService.assignOfficer(
                        id,
                        request.getOfficerId()
                )
        );
    }
    @GetMapping("/{id}/timeline")
    public ResponseEntity<ApiResponse<List<ComplaintTimelineResponse>>> getTimeline(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        complaintTimelineService.getTimeline(id)
                )
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('OFFICER') and @municipalOfficerAccess.isMunicipalOfficer(authentication))")
    public ResponseEntity<ApiResponse<Void>> deleteComplaint(@PathVariable Long id) {
        complaintService.deleteComplaint(id);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Complaint deleted successfully", null)
        );
    }
}
