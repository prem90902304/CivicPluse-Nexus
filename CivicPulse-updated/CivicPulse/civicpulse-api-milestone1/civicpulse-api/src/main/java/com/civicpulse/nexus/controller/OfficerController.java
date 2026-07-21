package com.civicpulse.nexus.controller;

import com.civicpulse.nexus.dto.request.CreateOfficerRequest;
import com.civicpulse.nexus.dto.request.UpdateOfficerRequest;
import com.civicpulse.nexus.dto.response.ApiResponse;
import com.civicpulse.nexus.dto.response.OfficerResponse;
import com.civicpulse.nexus.service.OfficerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.civicpulse.nexus.dto.request.ChangeOfficerPasswordRequest;
import org.springframework.web.bind.annotation.PatchMapping;
import java.util.List;

@RestController
@RequestMapping("/api/officers")
@RequiredArgsConstructor
public class OfficerController {

    private final OfficerService officerService;

    @GetMapping
    public ApiResponse<List<OfficerResponse>> getAllOfficers(
            @RequestParam(required = false) Long departmentId) {

        return ApiResponse.success(
                "Officers fetched successfully",
                officerService.getAllOfficers(departmentId)
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OfficerResponse>> createOfficer(
            @Valid @RequestBody CreateOfficerRequest request) {

        OfficerResponse officer = officerService.createOfficer(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Officer created successfully",
                        officer
                ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<OfficerResponse>> updateOfficer(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOfficerRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Officer updated successfully",
                        officerService.updateOfficer(id, request)
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteOfficer(
            @PathVariable Long id) {

        officerService.deleteOfficer(id);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Officer account deleted successfully",
                        null
                )
        );
    }

    @PatchMapping("/{id}/password")
    public ResponseEntity<ApiResponse<Void>> changeOfficerPassword(
            @PathVariable Long id,
            @Valid @RequestBody ChangeOfficerPasswordRequest request) {

        officerService.changeOfficerPassword(id, request.getNewPassword());

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Officer password changed successfully",
                        null
                )
        );
    }

    @PatchMapping("/{id}/enabled")
    public ResponseEntity<ApiResponse<OfficerResponse>> setOfficerEnabled(
            @PathVariable Long id,
            @RequestParam boolean enabled) {

        return ResponseEntity.ok(ApiResponse.success(
                enabled ? "Officer activated successfully" : "Officer deactivated successfully",
                officerService.setOfficerEnabled(id, enabled)
        ));
    }
}
