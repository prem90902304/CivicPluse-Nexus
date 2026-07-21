package com.civicpulse.services.controller;

import com.civicpulse.services.dto.response.ApiResponse;
import com.civicpulse.services.dto.response.ServiceApplicationResponse;
import com.civicpulse.services.entity.DocumentType;
import com.civicpulse.services.service.CertificateService;
import com.civicpulse.services.service.CertificatePdfService;
import com.civicpulse.services.service.DocumentService;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class CertificateController {
    private final DocumentService documentService;
    private final CertificateService certificateService;
    private final CertificatePdfService certificatePdfService;

    @PostMapping("/{applicationId}/documents")
    @PreAuthorize("hasRole('CITIZEN')")
    public ApiResponse<ServiceApplicationResponse> uploadDocument(
            @PathVariable Long applicationId,
            @RequestParam("file") @NotNull MultipartFile file,
            @RequestParam("documentType") DocumentType documentType
    ) {
        return ApiResponse.success("Document uploaded successfully", documentService.upload(applicationId, file, documentType));
    }

    @PutMapping("/{applicationId}/certificate/generate")
    @PreAuthorize("hasRole('OFFICER') and @municipalOfficerAccess.isMunicipalOfficer(authentication)")
    public ApiResponse<ServiceApplicationResponse> generate(@PathVariable Long applicationId) {
        return ApiResponse.success("Certificate generated successfully", certificateService.generate(applicationId));
    }

    @GetMapping("/download/{applicationId}")
    @PreAuthorize("hasAnyRole('CITIZEN', 'ADMIN')")
    public ResponseEntity<byte[]> download(@PathVariable Long applicationId) {
        ServiceApplicationResponse application = certificateService.recordDownload(applicationId);
        String filename = application.getCertificateNumber() + ".pdf";
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(certificatePdfService.generate(application));
    }
}
