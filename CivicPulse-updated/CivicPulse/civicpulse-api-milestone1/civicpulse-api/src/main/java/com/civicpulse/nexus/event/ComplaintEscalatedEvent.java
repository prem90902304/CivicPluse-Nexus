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
public class ComplaintEscalatedEvent {

    private Long complaintId;
    private String complaintNumber;
    private String citizenEmail;
    private LocalDateTime escalatedAt;
}