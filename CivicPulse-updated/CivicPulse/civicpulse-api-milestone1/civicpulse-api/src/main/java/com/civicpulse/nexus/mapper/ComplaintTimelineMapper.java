package com.civicpulse.nexus.mapper;

import com.civicpulse.nexus.dto.response.ComplaintTimelineResponse;
import com.civicpulse.nexus.entity.ComplaintTimeline;
import org.springframework.stereotype.Component;

@Component
public class ComplaintTimelineMapper {

    public ComplaintTimelineResponse toResponse(ComplaintTimeline t) {

        if (t == null) {
            return null;
        }

        return ComplaintTimelineResponse.builder()
                .status(t.getStatus())
                .remarks(t.getRemarks())
                .updatedBy(t.getUpdatedBy())
                .createdAt(t.getCreatedAt())
                .build();
    }
}