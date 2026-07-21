package com.civicpulse.services.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter @Builder @NoArgsConstructor @AllArgsConstructor
public class CertificateApprovedEvent {
    private Long applicationId;
    private String applicationNumber;
    private Long citizenId;
    private Long officerId;
    private LocalDateTime approvedAt;
}
