package com.civicpulse.nexus.dto.response;

import lombok.Builder;

@Builder
public record CategoryResponse(
        Long id,
        String name,
        String description,
        Integer slaHours,
        Long departmentId,
        String departmentName
) {
}