package com.civicpulse.nexus.mapper;

import com.civicpulse.nexus.dto.response.DepartmentResponse;
import com.civicpulse.nexus.entity.Department;
import org.springframework.stereotype.Component;

@Component
public class DepartmentMapper {

    public DepartmentResponse toResponse(Department department) {
        return DepartmentResponse.builder()
                .id(department.getId())
                .name(department.getName())
                .description(department.getDescription())
                .build();
    }
}