package com.civicpulse.nexus.event;

import com.civicpulse.nexus.entity.ComplaintStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintStatusUpdatedEvent {

    private Long complaintId;
    private String complaintNumber;

    private String citizenEmail;

    private ComplaintStatus status;
    private LocalDateTime updatedAt;
}