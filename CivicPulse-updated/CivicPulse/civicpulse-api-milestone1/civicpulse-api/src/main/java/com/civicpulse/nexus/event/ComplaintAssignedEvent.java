package com.civicpulse.nexus.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintAssignedEvent {

    private Long complaintId;
    private String complaintNumber;
    private String citizenEmail;

    private Long officerId;
    private String officerName;
    private String officerEmail;

    private LocalDateTime assignedAt;
}