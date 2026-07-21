package com.civicpulse.services.service.impl;

import com.civicpulse.services.dto.response.ServiceApplicationResponse;
import com.civicpulse.services.entity.ApplicationStatus;
import com.civicpulse.services.entity.ServiceApplication;
import com.civicpulse.services.exception.InvalidApplicationStateException;
import com.civicpulse.services.event.CertificateGeneratedEvent;
import com.civicpulse.services.kafka.KafkaEventProducer;
import com.civicpulse.services.repository.ServiceApplicationRepository;
import com.civicpulse.services.service.CertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class CertificateServiceImpl implements CertificateService {
    private final ApplicationServiceImpl applicationService;
    private final ServiceApplicationRepository applicationRepository;
    private final KafkaEventProducer eventProducer;

    @Override
    public ServiceApplicationResponse generate(Long applicationId) {
        ServiceApplication application = applicationService.find(applicationId);
        if (application.getStatus() != ApplicationStatus.APPROVED) {
            throw new InvalidApplicationStateException("Only approved applications can have certificates generated");
        }
        application.setStatus(ApplicationStatus.CERTIFICATE_GENERATED);
        application.setCertificateNumber(application.getServiceType().getCertificatePrefix() + "-" + LocalDateTime.now().getYear() + "-" + String.format("%06d", application.getId()));
        application.setDigitalSignature("Digitally Signed by Municipal Officer");
        ServiceApplication saved = applicationRepository.save(application);
        eventProducer.publish("certificate-generated", saved.getApplicationNumber(), CertificateGeneratedEvent.builder()
                .applicationId(saved.getId()).applicationNumber(saved.getApplicationNumber()).certificateNumber(saved.getCertificateNumber())
                .citizenId(saved.getCitizenId()).generatedAt(saved.getUpdatedAt()).build());
        return applicationService.toResponse(saved);
    }

    @Override
    public ServiceApplicationResponse recordDownload(Long applicationId) {
        ServiceApplication application = applicationService.find(applicationId);
        if (application.getStatus() != ApplicationStatus.CERTIFICATE_GENERATED && application.getStatus() != ApplicationStatus.DOWNLOADED) {
            throw new InvalidApplicationStateException("A certificate is not available for download yet");
        }
        application.setStatus(ApplicationStatus.DOWNLOADED);
        application.setDownloadCount(application.getDownloadCount() + 1);
        return applicationService.toResponse(applicationRepository.save(application));
    }
}
