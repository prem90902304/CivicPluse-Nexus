package com.civicpulse.nexus.service.impl;

import com.civicpulse.nexus.dto.request.DepartmentRequest;
import com.civicpulse.nexus.dto.response.DepartmentResponse;
import com.civicpulse.nexus.entity.ComplaintStatus;
import com.civicpulse.nexus.entity.Department;
import com.civicpulse.nexus.exception.DuplicateResourceException;
import com.civicpulse.nexus.mapper.DepartmentMapper;
import com.civicpulse.nexus.repository.ComplaintRepository;
import com.civicpulse.nexus.repository.DepartmentRepository;
import com.civicpulse.nexus.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final ComplaintRepository complaintRepository;
    private final DepartmentMapper departmentMapper;

    @Override
    public DepartmentResponse create(DepartmentRequest request) {

        if (departmentRepository.existsByNameIgnoreCase(request.getName())) {
            throw new DuplicateResourceException(
                    "Department '" + request.getName() + "' already exists"
            );
        }

        Department department = Department.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();

        Department savedDepartment = departmentRepository.save(department);

        return toResponse(savedDepartment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DepartmentResponse> getAll() {
        return departmentRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private DepartmentResponse toResponse(Department department) {
        DepartmentResponse response = departmentMapper.toResponse(department);

        response.setTotalComplaints(
                complaintRepository.countByDepartmentId(department.getId())
        );

        response.setResolvedComplaints(
                complaintRepository.countByDepartmentIdAndStatus(
                        department.getId(),
                        ComplaintStatus.RESOLVED
                )
        );

        return response;
    }
}