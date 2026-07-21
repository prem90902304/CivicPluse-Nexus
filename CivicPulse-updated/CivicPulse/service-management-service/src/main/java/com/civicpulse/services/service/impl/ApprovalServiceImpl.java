package com.civicpulse.services.service.impl;

import com.civicpulse.services.dto.request.RejectionRequest;
import com.civicpulse.services.dto.request.VerificationRequest;
import com.civicpulse.services.dto.response.ServiceApplicationResponse;
import com.civicpulse.services.entity.ApplicationStatus;
import com.civicpulse.services.entity.ServiceApplication;
import com.civicpulse.services.exception.InvalidApplicationStateException;
import com.civicpulse.services.event.CertificateApprovedEvent;
import com.civicpulse.services.kafka.KafkaEventProducer;
import com.civicpulse.services.repository.ServiceApplicationRepository;
import com.civicpulse.services.service.ApprovalService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class ApprovalServiceImpl implements ApprovalService {
    private final ApplicationServiceImpl applicationService;
    private final ServiceApplicationRepository applicationRepository;
    private final KafkaEventProducer eventProducer;

    @Override
    public ServiceApplicationResponse approve(Long applicationId, VerificationRequest request) {
        ServiceApplication application = applicationService.find(applicationId);
        if (application.getStatus() != ApplicationStatus.VERIFIED) {
            throw new InvalidApplicationStateException("Only verified applications can be approved");
        }
        application.setStatus(ApplicationStatus.APPROVED);
        application.setApprovedByOfficerId(request.getOfficerId());
        application.setApprovedAt(LocalDateTime.now());
        ServiceApplication saved = applicationRepository.save(application);
        eventProducer.publish("certificate-approved", saved.getApplicationNumber(), CertificateApprovedEvent.builder()
                .applicationId(saved.getId()).applicationNumber(saved.getApplicationNumber()).citizenId(saved.getCitizenId())
                .officerId(request.getOfficerId()).approvedAt(saved.getApprovedAt()).build());
        return applicationService.toResponse(saved);
    }

    @Override
    public ServiceApplicationResponse reject(Long applicationId, RejectionRequest request) {
        ServiceApplication application = applicationService.find(applicationId);
        if (application.getStatus() == ApplicationStatus.CERTIFICATE_GENERATED || application.getStatus() == ApplicationStatus.DOWNLOADED || application.getStatus() == ApplicationStatus.REJECTED) {
            throw new InvalidApplicationStateException("This application can no longer be rejected");
        }
        application.setStatus(ApplicationStatus.REJECTED);
        application.setApprovedByOfficerId(request.getOfficerId());
        application.setRejectionReason(request.getReason().trim());
        return applicationService.toResponse(applicationRepository.save(application));
    }
}
