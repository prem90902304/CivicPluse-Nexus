package com.civicpulse.services.controller;

import com.civicpulse.services.dto.request.DocumentsRequiredRequest;
import com.civicpulse.services.dto.request.RejectionRequest;
import com.civicpulse.services.dto.request.VerificationRequest;
import com.civicpulse.services.dto.response.ApiResponse;
import com.civicpulse.services.dto.response.ServiceApplicationResponse;
import com.civicpulse.services.entity.ApplicationStatus;
import com.civicpulse.services.service.ApplicationService;
import com.civicpulse.services.service.ApprovalService;
import com.civicpulse.services.service.VerificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
@PreAuthorize("hasRole('OFFICER') and @municipalOfficerAccess.isMunicipalOfficer(authentication)")
public class OfficerApplicationController {
    private final ApplicationService applicationService;
    private final VerificationService verificationService;
    private final ApprovalService approvalService;

    @GetMapping("/pending")
    public ApiResponse<List<ServiceApplicationResponse>> pending() {
        return ApiResponse.success("Pending applications fetched successfully", applicationService.getByStatus(ApplicationStatus.SUBMITTED));
    }

    @PutMapping("/verify/{applicationId}")
    public ApiResponse<ServiceApplicationResponse> verify(@PathVariable Long applicationId, @Valid @RequestBody VerificationRequest request) {
        return ApiResponse.success("Application verification updated", verificationService.verify(applicationId, request));
    }

    @PutMapping("/approve/{applicationId}")
    public ApiResponse<ServiceApplicationResponse> approve(@PathVariable Long applicationId, @Valid @RequestBody VerificationRequest request) {
        return ApiResponse.success("Application approved and certificate generated", approvalService.approve(applicationId, request));
    }

    @PutMapping("/reject/{applicationId}")
    public ApiResponse<ServiceApplicationResponse> reject(@PathVariable Long applicationId, @Valid @RequestBody RejectionRequest request) {
        return ApiResponse.success("Application rejected", approvalService.reject(applicationId, request));
    }

    @PutMapping("/documents-required/{applicationId}")
    public ApiResponse<ServiceApplicationResponse> requestDocuments(
            @PathVariable Long applicationId,
            @Valid @RequestBody DocumentsRequiredRequest request
    ) {
        return ApiResponse.success(
                "Document request sent to the citizen",
                verificationService.requestDocuments(applicationId, request)
        );
    }
}
