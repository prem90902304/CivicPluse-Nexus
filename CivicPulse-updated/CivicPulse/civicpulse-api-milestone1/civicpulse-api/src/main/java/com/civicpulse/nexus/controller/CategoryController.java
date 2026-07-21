package com.civicpulse.nexus.controller;

import com.civicpulse.nexus.dto.response.ApiResponse;
import com.civicpulse.nexus.entity.Category;
import com.civicpulse.nexus.service.CategoryService;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.civicpulse.nexus.dto.response.CategoryResponse;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAll(
            @RequestParam(required = false) Long departmentId
    ) {
        List<CategoryResponse> categories = departmentId == null
                ? categoryService.getAll()
                : categoryService.getByDepartmentId(departmentId);

        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Category>> create(@RequestBody CreateCategoryRequest request) {
        Category created = categoryService.create(
                request.name(), request.description(), request.slaHours(), request.departmentId());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Category created", created));
    }

    public record CreateCategoryRequest(@NotBlank String name, String description,
                                         @NotNull Integer slaHours, Long departmentId) {
    }
}
