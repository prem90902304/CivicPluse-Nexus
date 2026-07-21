package com.civicpulse.nexus.service;

import com.civicpulse.nexus.dto.request.DepartmentRequest;
import com.civicpulse.nexus.dto.response.DepartmentResponse;

import java.util.List;

public interface DepartmentService {

    DepartmentResponse create(DepartmentRequest request);

    List<DepartmentResponse> getAll();
}