package com.civicpulse.nexus.mapper;

import com.civicpulse.nexus.dto.response.CategoryResponse;
import com.civicpulse.nexus.entity.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public CategoryResponse toResponse(Category category) {

        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .slaHours(category.getSlaHours())
                .departmentId(
                        category.getDepartment() != null
                                ? category.getDepartment().getId()
                                : null)
                .departmentName(
                        category.getDepartment() != null
                                ? category.getDepartment().getName()
                                : null)
                .build();
    }
}