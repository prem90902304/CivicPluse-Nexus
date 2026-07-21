package com.civicpulse.nexus.service;

import com.civicpulse.nexus.dto.response.CategoryResponse;
import com.civicpulse.nexus.entity.Category;

import java.util.List;

public interface CategoryService {

    Category create(String name, String description, Integer slaHours, Long departmentId);

    List<CategoryResponse> getAll();

    List<CategoryResponse> getByDepartmentId(Long departmentId);
}