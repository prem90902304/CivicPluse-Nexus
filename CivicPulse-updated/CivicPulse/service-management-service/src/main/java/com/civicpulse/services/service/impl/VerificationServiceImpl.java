package com.civicpulse.services.service.impl;

import com.civicpulse.services.dto.request.DocumentsRequiredRequest;
import com.civicpulse.services.dto.request.VerificationRequest;
import com.civicpulse.services.dto.response.ServiceApplicationResponse;
import com.civicpulse.services.entity.ApplicationStatus;
import com.civicpulse.services.entity.ServiceApplication;
import com.civicpulse.services.exception.InvalidApplicationStateException;
import com.civicpulse.services.event.DocumentVerifiedEvent;
import com.civicpulse.services.event.DocumentsRequiredEvent;
import com.civicpulse.services.kafka.KafkaEventProducer;
import com.civicpulse.services.repository.ServiceApplicationRepository;
import com.civicpulse.services.service.VerificationService;
import com.civicpulse.services.service.DocumentRequirementCatalog;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class VerificationServiceImpl implements VerificationService {
    private final ApplicationServiceImpl applicationService;
    private final ServiceApplicationRepository applicationRepository;
    private final KafkaEventProducer eventProducer;

    @Override
    public ServiceApplicationResponse verify(Long applicationId, VerificationRequest request) {
        ServiceApplication application = applicationService.find(applicationId);
        if (application.getStatus() != ApplicationStatus.SUBMITTED && application.getStatus() != ApplicationStatus.UNDER_VERIFICATION) {
            throw new InvalidApplicationStateException("Only submitted applications can be verified");
        }
        var missingDocuments = DocumentRequirementCatalog.requiredFor(application.getServiceType()).stream()
                .filter(requiredType -> application.getDocuments().stream()
                        .noneMatch(uploaded -> requiredType == uploaded.getDocumentType()))
                .toList();
        if (!missingDocuments.isEmpty()) {
            throw new InvalidApplicationStateException("Missing required documents: " + missingDocuments);
        }
        application.setStatus(ApplicationStatus.UNDER_VERIFICATION);
        if (!request.isVerified()) {
            return applicationService.toResponse(applicationRepository.save(application));
        }
        application.setStatus(ApplicationStatus.VERIFIED);
        application.setVerifiedByOfficerId(request.getOfficerId());
        application.setVerifiedAt(LocalDateTime.now());
        ServiceApplication saved = applicationRepository.save(application);
        eventProducer.publish("document-verified", saved.getApplicationNumber(), DocumentVerifiedEvent.builder()
                .applicationId(saved.getId()).applicationNumber(saved.getApplicationNumber()).citizenId(saved.getCitizenId())
                .officerId(request.getOfficerId()).verifiedAt(saved.getVerifiedAt()).build());
        return applicationService.toResponse(saved);
    }

    @Override
    public ServiceApplicationResponse requestDocuments(Long applicationId, DocumentsRequiredRequest request) {
        ServiceApplication application = applicationService.find(applicationId);
        if (application.getStatus() != ApplicationStatus.SUBMITTED
                && application.getStatus() != ApplicationStatus.UNDER_VERIFICATION
                && application.getStatus() != ApplicationStatus.DOCUMENTS_REQUIRED) {
            throw new InvalidApplicationStateException(
                    "Documents can only be requested for an application awaiting verification"
            );
        }

        application.setStatus(ApplicationStatus.DOCUMENTS_REQUIRED);
        application.setOfficerMessage(request.getMessage().trim());
        application.setVerifiedByOfficerId(request.getOfficerId());
        ServiceApplication saved = applicationRepository.save(application);
        eventProducer.publish("documents-required", saved.getApplicationNumber(), DocumentsRequiredEvent.builder()
                .applicationId(saved.getId())
                .applicationNumber(saved.getApplicationNumber())
                .citizenId(saved.getCitizenId())
                .officerId(request.getOfficerId())
                .message(saved.getOfficerMessage())
                .requestedAt(LocalDateTime.now())
                .build());
        return applicationService.toResponse(saved);
    }
}
