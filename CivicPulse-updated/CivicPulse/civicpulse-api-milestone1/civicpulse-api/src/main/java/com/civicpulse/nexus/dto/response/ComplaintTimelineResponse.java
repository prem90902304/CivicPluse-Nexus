package com.civicpulse.nexus.dto.response;

import com.civicpulse.nexus.entity.ComplaintStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintTimelineResponse {

    private ComplaintStatus status;

    private String remarks;

    private String updatedBy;

    private LocalDateTime createdAt;
}