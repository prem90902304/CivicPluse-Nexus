package com.civicpulse.services.controller;

import com.civicpulse.services.dto.request.ApplyServiceRequest;
import com.civicpulse.services.dto.response.ApiResponse;
import com.civicpulse.services.dto.response.ServiceApplicationResponse;
import com.civicpulse.services.entity.ApplicationStatus;
import com.civicpulse.services.entity.ServiceType;
import com.civicpulse.services.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ApplicationController {
    private final ApplicationService applicationService;

    @PostMapping("/apply")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<ApiResponse<ServiceApplicationResponse>> apply(@Valid @RequestBody ApplyServiceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Application submitted successfully", applicationService.apply(request)));
    }

    @GetMapping("/citizen/{citizenId}")
    @PreAuthorize("hasAnyRole('CITIZEN', 'ADMIN')")
    public ApiResponse<List<ServiceApplicationResponse>> byCitizen(@PathVariable Long citizenId) {
        return ApiResponse.success("Applications fetched successfully", applicationService.getByCitizenId(citizenId));
    }

    @GetMapping("/{applicationId}")
    @PreAuthorize("hasAnyRole('CITIZEN', 'ADMIN') or (hasRole('OFFICER') and @municipalOfficerAccess.isMunicipalOfficer(authentication))")
    public ApiResponse<ServiceApplicationResponse> get(@PathVariable Long applicationId) {
        return ApiResponse.success("Application fetched successfully", applicationService.getById(applicationId));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<ServiceApplicationResponse>> all() {
        return ApiResponse.success("Applications fetched successfully", applicationService.getAll());
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('OFFICER') and @municipalOfficerAccess.isMunicipalOfficer(authentication))")
    public ApiResponse<List<ServiceApplicationResponse>> byStatus(@PathVariable ApplicationStatus status) {
        return ApiResponse.success("Applications fetched successfully", applicationService.getByStatus(status));
    }

    @GetMapping("/type/{serviceType}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<ServiceApplicationResponse>> byType(@PathVariable ServiceType serviceType) {
        return ApiResponse.success("Applications fetched successfully", applicationService.getByServiceType(serviceType));
    }

    @DeleteMapping("/{applicationId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('OFFICER') and @municipalOfficerAccess.isMunicipalOfficer(authentication))")
    public ApiResponse<Void> deleteRejected(@PathVariable Long applicationId) {
        applicationService.deleteRejected(applicationId);
        return ApiResponse.success("Rejected application deleted", null);
    }
}
