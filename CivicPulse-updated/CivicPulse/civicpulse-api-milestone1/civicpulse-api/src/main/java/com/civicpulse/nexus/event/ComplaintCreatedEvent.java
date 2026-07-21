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
public class ComplaintCreatedEvent {

    private Long complaintId;
    private String complaintNumber;

    private Long citizenId;
    private String citizenName;
    private String citizenEmail;

    private String departmentName;
    private String categoryName;

    private LocalDateTime createdAt;
}