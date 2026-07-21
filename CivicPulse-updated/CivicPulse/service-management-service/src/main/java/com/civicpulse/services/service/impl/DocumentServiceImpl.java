package com.civicpulse.services.service.impl;

import com.civicpulse.services.dto.response.ServiceApplicationResponse;
import com.civicpulse.services.entity.ApplicationDocument;
import com.civicpulse.services.entity.ApplicationStatus;
import com.civicpulse.services.entity.DocumentType;
import com.civicpulse.services.entity.ServiceApplication;
import com.civicpulse.services.repository.ApplicationDocumentRepository;
import com.civicpulse.services.repository.ServiceApplicationRepository;
import com.civicpulse.services.service.DocumentService;
import com.civicpulse.services.service.DocumentRequirementCatalog;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class DocumentServiceImpl implements DocumentService {
    private static final Set<String> ALLOWED_TYPES = Set.of("application/pdf", "image/jpeg", "image/png", "image/jpg");
    private final ApplicationServiceImpl applicationService;
    private final ApplicationDocumentRepository documentRepository;
    private final ServiceApplicationRepository applicationRepository;

    @Value("${app.upload-dir}")
    private String uploadDir;

    @Override
    public ServiceApplicationResponse upload(Long applicationId, MultipartFile file, DocumentType documentType) {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("Please select a document to upload");
        if (!ALLOWED_TYPES.contains(file.getContentType())) throw new IllegalArgumentException("Only PDF, JPG, JPEG, and PNG documents are allowed");
        ServiceApplication application = applicationService.find(applicationId);
        if (!DocumentRequirementCatalog.requiredFor(application.getServiceType()).contains(documentType)) {
            throw new IllegalArgumentException("This document is not required for the selected service");
        }
        boolean alreadyUploaded = application.getDocuments().stream()
                .anyMatch(document -> documentType == document.getDocumentType());
        if (alreadyUploaded) {
            throw new IllegalArgumentException("This document type has already been uploaded");
        }
        String storedFileName = UUID.randomUUID() + extension(file.getOriginalFilename());
        try {
            Path directory = Path.of(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(directory);
            Files.copy(file.getInputStream(), directory.resolve(storedFileName), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new IllegalArgumentException("Could not save the uploaded document");
        }
        ApplicationDocument document = ApplicationDocument.builder()
                .application(application)
                .originalFileName(file.getOriginalFilename())
                .fileUrl("/uploads/service-documents/" + storedFileName)
                .contentType(file.getContentType())
                .documentType(documentType)
                .build();
        documentRepository.save(document);
        application.getDocuments().add(document);
        boolean hasAllRequiredDocuments = DocumentRequirementCatalog.requiredFor(application.getServiceType()).stream()
                .allMatch(requiredType -> application.getDocuments().stream()
                        .anyMatch(uploaded -> requiredType == uploaded.getDocumentType()));
        if ((application.getStatus() == ApplicationStatus.DOCUMENTS_REQUIRED
                || application.getStatus() == ApplicationStatus.REJECTED) && hasAllRequiredDocuments) {
            application.setStatus(ApplicationStatus.SUBMITTED);
            application.setOfficerMessage(null);
            application.setRejectionReason(null);
        } else if (application.getStatus() == ApplicationStatus.REJECTED) {
            application.setStatus(ApplicationStatus.DOCUMENTS_REQUIRED);
            application.setRejectionReason(null);
        }
        return applicationService.toResponse(applicationRepository.save(application));
    }

    private String extension(String filename) {
        if (filename == null || !filename.contains(".")) return ".bin";
        return filename.substring(filename.lastIndexOf('.')).toLowerCase();
    }
}
