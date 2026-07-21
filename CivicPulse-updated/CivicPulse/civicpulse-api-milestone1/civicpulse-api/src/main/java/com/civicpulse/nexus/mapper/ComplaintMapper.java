package com.civicpulse.nexus.mapper;

import com.civicpulse.nexus.dto.response.ComplaintResponse;
import com.civicpulse.nexus.entity.Complaint;
import org.springframework.stereotype.Component;
import com.civicpulse.nexus.service.SlaService;

import java.util.ArrayList;

@Component
public class ComplaintMapper {

    private final SlaService slaService;

    public ComplaintMapper(SlaService slaService) {
        this.slaService = slaService;
    }

    public ComplaintResponse toResponse(Complaint complaint) {

        return ComplaintResponse.builder()
                .id(complaint.getId())
                .complaintNumber(complaint.getComplaintNumber())
                .title(complaint.getTitle())
                .description(complaint.getDescription())
                .location(complaint.getLocation())
                .status(complaint.getStatus())
                .priority(complaint.getPriority())
                .citizenName(
                        complaint.getCitizen() != null
                                ? complaint.getCitizen().getFullName()
                                : null
                )
                .departmentName(
                        complaint.getDepartment() != null
                                ? complaint.getDepartment().getName()
                                : null
                )
                .categoryName(
                        complaint.getCategory() != null
                                ? complaint.getCategory().getName()
                                : null
                )
                .assignedOfficer(
                        complaint.getAssignedOfficer() != null
                                ? complaint.getAssignedOfficer().getFullName()
                                : null
                )

                .imageUrls(
                        complaint.getImageUrls() == null
                                ? new ArrayList<>()
                                : new ArrayList<>(complaint.getImageUrls())
                )
                .createdAt(complaint.getCreatedAt())
                .updatedAt(complaint.getUpdatedAt())

                // ===== SLA =====
                .deadline(complaint.getDeadline())
                .slaStatus(complaint.getSlaStatus())
                .remainingHours(
                        complaint.getDeadline() != null
                                ? slaService.getRemainingHours(complaint)
                                : null
                )

                .build();
    }
}