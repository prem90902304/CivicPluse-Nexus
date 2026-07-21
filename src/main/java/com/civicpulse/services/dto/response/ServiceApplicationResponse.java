package com.civicpulse.services.dto.response;

import com.civicpulse.services.entity.ApplicationStatus;
import com.civicpulse.services.entity.DocumentType;
import com.civicpulse.services.entity.ServiceType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class ServiceApplicationResponse {
    private final Long id;
    private final String applicationNumber;
    private final Long citizenId;
    private final String applicantName;
    private final ServiceType serviceType;
    private final ApplicationStatus status;
    private final String rejectionReason;
    private final String officerMessage;
    private final String certificateNumber;
    private final String digitalSignature;
    private final LocalDateTime approvedAt;
    private final Integer downloadCount;
    private final LocalDateTime appliedAt;
    private final List<String> documentUrls;
    private final List<DocumentType> documentTypes;
    private final List<DocumentType> requiredDocumentTypes;
    private final List<DocumentType> missingDocumentTypes;
}
