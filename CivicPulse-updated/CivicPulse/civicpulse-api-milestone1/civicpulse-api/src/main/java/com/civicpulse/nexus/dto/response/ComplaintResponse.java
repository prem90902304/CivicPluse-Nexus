package com.civicpulse.nexus.dto.response;

import com.civicpulse.nexus.entity.ComplaintPriority;
import com.civicpulse.nexus.entity.ComplaintStatus;
import com.civicpulse.nexus.entity.SlaStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintResponse {

    private Long id;

    private String complaintNumber;

    private String title;

    private String description;

    private String location;

    private ComplaintStatus status;

    private ComplaintPriority priority;

    private String citizenName;

    private String departmentName;

    private String categoryName;

    private String assignedOfficer;

    private List<String> imageUrls;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime deadline;

    private SlaStatus slaStatus;

    private Long remainingHours;
}