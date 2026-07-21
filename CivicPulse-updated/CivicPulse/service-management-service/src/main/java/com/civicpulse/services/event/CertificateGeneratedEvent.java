package com.civicpulse.services.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter @Builder @NoArgsConstructor @AllArgsConstructor
public class CertificateGeneratedEvent {
    private Long applicationId;
    private String applicationNumber;
    private String certificateNumber;
    private Long citizenId;
    private LocalDateTime generatedAt;
}
