package com.civicpulse.nexus.service.impl;

import com.civicpulse.nexus.dto.response.CategoryResponse;
import com.civicpulse.nexus.entity.Category;
import com.civicpulse.nexus.entity.Department;
import com.civicpulse.nexus.exception.DuplicateResourceException;
import com.civicpulse.nexus.exception.ResourceNotFoundException;
import com.civicpulse.nexus.mapper.CategoryMapper;
import com.civicpulse.nexus.repository.CategoryRepository;
import com.civicpulse.nexus.repository.DepartmentRepository;
import com.civicpulse.nexus.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final DepartmentRepository departmentRepository;
    private final CategoryMapper categoryMapper;

    @Override
    @Transactional
    public Category create(String name,
                           String description,
                           Integer slaHours,
                           Long departmentId) {

        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw new DuplicateResourceException(
                    "Category '" + name + "' already exists");
        }

        Category.CategoryBuilder builder = Category.builder()
                .name(name)
                .description(description)
                .slaHours(slaHours);

        if (departmentId != null) {
            Department department = departmentRepository.findById(departmentId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Department not found: " + departmentId));

            builder.department(department);
        }

        return categoryRepository.save(builder.build());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAll() {

        return categoryRepository.findAll()
                .stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getByDepartmentId(Long departmentId) {

        if (!departmentRepository.existsById(departmentId)) {
            throw new ResourceNotFoundException(
                    "Department not found: " + departmentId
            );
        }

        return categoryRepository.findByDepartment_Id(departmentId)
                .stream()
                .map(categoryMapper::toResponse)
                .toList();
    }
}