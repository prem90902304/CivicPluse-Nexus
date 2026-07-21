package com.civicpulse.services.service.impl;

import com.civicpulse.services.dto.request.ApplyServiceRequest;
import com.civicpulse.services.dto.response.ServiceApplicationResponse;
import com.civicpulse.services.entity.ApplicationStatus;
import com.civicpulse.services.entity.DocumentType;
import com.civicpulse.services.entity.ServiceApplication;
import com.civicpulse.services.entity.ServiceType;
import com.civicpulse.services.exception.ResourceNotFoundException;
import com.civicpulse.services.event.ApplicationSubmittedEvent;
import com.civicpulse.services.kafka.KafkaEventProducer;
import com.civicpulse.services.repository.ServiceApplicationRepository;
import com.civicpulse.services.service.ApplicationService;
import com.civicpulse.services.service.DocumentRequirementCatalog;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApplicationServiceImpl implements ApplicationService {
    private final ServiceApplicationRepository applicationRepository;
    private final KafkaEventProducer eventProducer;

    @Override
    @Transactional
    public ServiceApplicationResponse apply(ApplyServiceRequest request) {
        String applicantName = request.getApplicantName().trim();
        boolean duplicateApplication = applicationRepository
                .existsByApplicantNameIgnoreCaseAndAadhaarNumberAndServiceTypeAndStatusNot(
                        applicantName,
                        request.getAadhaarNumber(),
                        request.getServiceType(),
                        ApplicationStatus.REJECTED
                );
        if (duplicateApplication) {
            throw new IllegalArgumentException(
                    "An application already exists with the same applicant name, Aadhaar number, and service type."
            );
        }
        ServiceApplication application = ServiceApplication.builder()
                .applicationNumber(nextApplicationNumber())
                .citizenId(request.getCitizenId())
                .serviceType(request.getServiceType())
                .applicantName(applicantName)
                .aadhaarNumber(request.getAadhaarNumber())
                .status(ApplicationStatus.SUBMITTED)
                .downloadCount(0)
                .build();
        ServiceApplication saved = applicationRepository.save(application);
        eventProducer.publish("application-submitted", saved.getApplicationNumber(), ApplicationSubmittedEvent.builder()
                .applicationId(saved.getId()).applicationNumber(saved.getApplicationNumber()).citizenId(saved.getCitizenId())
                .serviceType(saved.getServiceType().name()).submittedAt(saved.getCreatedAt()).build());
        return toResponse(saved);
    }

    @Override
    public ServiceApplicationResponse getById(Long applicationId) {
        return toResponse(find(applicationId));
    }

    @Override
    public List<ServiceApplicationResponse> getByCitizenId(Long citizenId) {
        return applicationRepository.findByCitizenIdOrderByCreatedAtDesc(citizenId).stream().map(this::toResponse).toList();
    }

    @Override
    public List<ServiceApplicationResponse> getAll() {
        return applicationRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public List<ServiceApplicationResponse> getByStatus(ApplicationStatus status) {
        return applicationRepository.findByStatusOrderByCreatedAtAsc(status).stream().map(this::toResponse).toList();
    }

    @Override
    public List<ServiceApplicationResponse> getByServiceType(ServiceType serviceType) {
        return applicationRepository.findByServiceTypeOrderByCreatedAtDesc(serviceType).stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public void deleteRejected(Long applicationId) {
        ServiceApplication application = find(applicationId);
        if (application.getStatus() != ApplicationStatus.REJECTED) {
            throw new IllegalArgumentException("Only rejected applications can be deleted");
        }
        applicationRepository.delete(application);
    }

    ServiceApplication find(Long applicationId) {
        return applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application " + applicationId + " was not found"));
    }

    ServiceApplicationResponse toResponse(ServiceApplication application) {
        List<DocumentType> uploadedTypes = application.getDocuments().stream()
                .map(document -> document.getDocumentType())
                .filter(java.util.Objects::nonNull)
                .toList();
        Set<DocumentType> uploadedTypeSet = Set.copyOf(uploadedTypes);
        List<DocumentType> requiredTypes = DocumentRequirementCatalog.requiredFor(application.getServiceType());
        List<DocumentType> missingTypes = requiredTypes.stream()
                .filter(type -> !uploadedTypeSet.contains(type))
                .toList();
        return ServiceApplicationResponse.builder()
                .id(application.getId())
                .applicationNumber(application.getApplicationNumber())
                .citizenId(application.getCitizenId())
                .applicantName(application.getApplicantName())
                .serviceType(application.getServiceType())
                .status(application.getStatus())
                .rejectionReason(application.getRejectionReason())
                .officerMessage(application.getOfficerMessage())
                .certificateNumber(application.getCertificateNumber())
                .digitalSignature(application.getDigitalSignature())
                .approvedAt(application.getApprovedAt())
                .downloadCount(application.getDownloadCount())
                .appliedAt(application.getCreatedAt())
                .documentUrls(application.getDocuments().stream().map(document -> document.getFileUrl()).toList())
                .documentTypes(application.getDocuments().stream().map(document -> document.getDocumentType()).toList())
                .requiredDocumentTypes(requiredTypes)
                .missingDocumentTypes(missingTypes)
                .build();
    }

    private String nextApplicationNumber() {
        return "APP-" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
