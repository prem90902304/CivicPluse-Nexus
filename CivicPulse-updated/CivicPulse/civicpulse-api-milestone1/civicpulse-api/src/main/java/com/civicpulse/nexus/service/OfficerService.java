package com.civicpulse.nexus.service;

import com.civicpulse.nexus.dto.request.CreateOfficerRequest;
import com.civicpulse.nexus.dto.request.UpdateOfficerRequest;
import com.civicpulse.nexus.dto.response.OfficerResponse;

import java.util.List;

public interface OfficerService {

    List<OfficerResponse> getAllOfficers(Long departmentId);

    OfficerResponse createOfficer(CreateOfficerRequest request);

    OfficerResponse updateOfficer(Long id, UpdateOfficerRequest request);

    void deleteOfficer(Long id);

    void changeOfficerPassword(Long id, String newPassword);

    OfficerResponse setOfficerEnabled(Long id, boolean enabled);
}
